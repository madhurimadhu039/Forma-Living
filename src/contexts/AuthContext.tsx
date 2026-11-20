import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, signOut, updateProfile } from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../config/firebase'

interface Ctx {
  user: User | null
  isAdmin: boolean
  loading: boolean
  login: (e: string, p: string) => Promise<void>
  register: (e: string, p: string, name?: string) => Promise<void>
  reset: (e: string) => Promise<void>
  logout: () => Promise<void>
  resendVerificationEmail: () => Promise<void>
  reloadUser: () => Promise<boolean>
  updateUserProfile: (name: string) => Promise<void>
  sendPasswordResetForUser: () => Promise<void>
}

export function formatAuthError(err: any): string {
  const code = err?.code || ''
  const message = err?.message || ''

  switch (code) {
    case 'auth/too-many-requests':
      return 'Too many requests. Please wait a few moments before requesting another verification email.'
    case 'auth/unauthorized-domain':
      return 'Domain not authorized in Firebase Console. Please add this domain to Firebase Authorized Domains.'
    case 'auth/user-token-expired':
      return 'Your session has expired. Please sign out and sign in again.'
    case 'auth/network-request-failed':
      return 'Network connection error. Please check your internet connection.'
    case 'auth/quota-exceeded':
      return 'Daily project email limit reached. Please try again later.'
    default:
      if (typeof message === 'string' && message.trim()) {
        return message.replace(/^Firebase:\s*/, '').replace(/\s*\(auth\/[^)]+\)\.?$/, '')
      }
      return 'An unexpected error occurred while sending verification email.'
  }
}

const cloneUser = (u: User | null): User | null => {
  if (!u) return null
  return Object.assign(Object.create(Object.getPrototypeOf(u)), u)
}

const C = createContext<Ctx>(null!)
export const useAuth = () => useContext(C)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const unsub = onAuthStateChanged(
        auth,
        async u => {
          setUser(u)
          try {
            setAdmin(u ? !!(await u.getIdTokenResult()).claims.admin : false)
          } catch {
            setAdmin(false)
          }
          setLoading(false)
        },
        err => {
          console.warn('Auth State Error:', err)
          setLoading(false)
        }
      )
      return () => unsub()
    } catch (e) {
      console.warn('Auth listener registration failed:', e)
      setLoading(false)
    }
  }, [])

  return (
    <C.Provider
      value={{
        user,
        isAdmin,
        loading,
        login: async (e, p) => { await signInWithEmailAndPassword(auth, e, p) },
        register: async (e, p, name?: string) => {
          const c = await createUserWithEmailAndPassword(auth, e, p)
          const customerName = name?.trim() || e.split('@')[0]

          try {
            const userRef = doc(db, 'users', c.user.uid)
            const userSnap = await getDoc(userRef)
            if (!userSnap.exists()) {
              await setDoc(userRef, {
                uid: c.user.uid,
                name: customerName,
                email: c.user.email || e,
                createdAt: serverTimestamp(),
              })
            }
          } catch (err) {
            console.warn('Firestore user profile creation notice:', err)
          }

          try {
            await updateProfile(c.user, { displayName: customerName })
          } catch (err) {
            console.warn('Auth profile update notice:', err)
          }
        },
        reset: e => sendPasswordResetEmail(auth, e),
        logout: () => signOut(auth),
        resendVerificationEmail: async () => {
          const currentUser = auth.currentUser
          if (!currentUser) {
            throw new Error('No user is currently signed in. Please sign in first.')
          }
          await currentUser.reload().catch(() => {})
          if (currentUser.emailVerified) {
            setUser(cloneUser(currentUser))
            throw new Error('Your email address is already verified.')
          }
          const actionCodeSettings = typeof window !== 'undefined'
            ? {
                url: `${window.location.origin}/login`,
                handleCodeInApp: false,
              }
            : undefined
          await sendEmailVerification(currentUser, actionCodeSettings)
        },
        reloadUser: async (): Promise<boolean> => {
          const currentUser = auth.currentUser
          if (!currentUser) return false
          await currentUser.reload()
          setUser(cloneUser(auth.currentUser))
          return Boolean(auth.currentUser?.emailVerified)
        },
        updateUserProfile: async (name: string): Promise<void> => {
          const currentUser = auth.currentUser
          if (!currentUser) {
            throw new Error('No user is currently signed in. Please sign in first.')
          }

          const trimmedName = name.trim()
          if (trimmedName.length < 2 || trimmedName.length > 100) {
            throw new Error('Full Name must be between 2 and 100 characters.')
          }

          // 1. Preserve the original Firebase Auth displayName
          const originalDisplayName = currentUser.displayName ?? null

          // 2. Update Firebase Auth displayName first
          await updateProfile(currentUser, { displayName: trimmedName })

          // 3. Then update or create users/{uid} in Firestore
          try {
            const userRef = doc(db, 'users', currentUser.uid)
            const userSnap = await getDoc(userRef)

            if (!userSnap.exists()) {
              await setDoc(userRef, {
                uid: currentUser.uid,
                name: trimmedName,
                email: currentUser.email || '',
                createdAt: serverTimestamp(),
              })
            } else {
              await updateDoc(userRef, {
                name: trimmedName,
                updatedAt: serverTimestamp(),
              })
            }

            // Sync successful update to local state
            setUser(cloneUser(currentUser))
          } catch (firestoreErr: any) {
            // 4. If the Firestore operation fails, restore original Firebase Auth displayName
            try {
              await updateProfile(currentUser, { displayName: originalDisplayName })
              setUser(cloneUser(currentUser))
            } catch (rollbackErr: any) {
              // 5. If Auth rollback also fails, report both errors clearly
              console.error('Failed to rollback Firebase Auth displayName:', rollbackErr)
              const firestoreMsg = firestoreErr?.message || String(firestoreErr)
              const rollbackMsg = rollbackErr?.message || String(rollbackErr)
              const combinedError = new Error(
                `Profile update failed in Firestore: ${firestoreMsg}. Additionally, rolling back authentication display name failed: ${rollbackMsg}`
              )
              ;(combinedError as any).cause = firestoreErr
              ;(combinedError as any).rollbackError = rollbackErr
              throw combinedError
            }
            throw firestoreErr
          }
        },
        sendPasswordResetForUser: async (): Promise<void> => {
          const currentUser = auth.currentUser
          if (!currentUser || !currentUser.email) {
            throw new Error('No signed-in user or email found to send reset instructions.')
          }
          await sendPasswordResetEmail(auth, currentUser.email)
        }
      }}
    >
      {children}
    </C.Provider>
  )
}
