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

          try {
            await sendEmailVerification(c.user)
          } catch (err) {
            console.warn('Email verification dispatch notice:', err)
          }
        },
        reset: e => sendPasswordResetEmail(auth, e),
        logout: () => signOut(auth)
      }}
    >
      {children}
    </C.Provider>
  )
}
