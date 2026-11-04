import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, signOut } from 'firebase/auth'
import { auth } from '../config/firebase'

interface Ctx {
  user: User | null
  isAdmin: boolean
  loading: boolean
  login: (e: string, p: string) => Promise<void>
  register: (e: string, p: string) => Promise<void>
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
        register: async (e, p) => {
          const c = await createUserWithEmailAndPassword(auth, e, p)
          await sendEmailVerification(c.user)
        },
        reset: e => sendPasswordResetEmail(auth, e),
        logout: () => signOut(auth)
      }}
    >
      {children}
    </C.Provider>
  )
}
