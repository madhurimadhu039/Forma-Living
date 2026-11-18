import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, signOut, updateProfile } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
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
        }
      }}
    >
      {children}
    </C.Provider>
  )
}
