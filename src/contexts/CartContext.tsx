import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from './AuthContext'
import { useProducts } from './ProductContext'

export interface Line {
  productId: string
  qty: number
}

export interface CartToast {
  id: number
  productName: string
  message: string
}

interface Ctx {
  lines: Line[]
  add: (id: string, name?: string, maxStock?: number) => boolean
  setQty: (id: string, q: number) => void
  clear: () => void
  wishlist: string[]
  toggleWish: (id: string) => void
  toast: CartToast | null
  dismissToast: () => void
  cartAnimating: boolean
}

const C = createContext<Ctx>(null!)
export const useCart = () => useContext(C)

const ls = (k: string) => {
  try {
    return JSON.parse(localStorage.getItem(k) || '[]')
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { getProductById } = useProducts()
  const [lines, setLines] = useState<Line[]>(ls('cart'))
  const [wishlist, setWish] = useState<string[]>(ls('wish'))
  const [toast, setToast] = useState<CartToast | null>(null)
  const [cartAnimating, setCartAnimating] = useState(false)

  const linesRef = useRef<Line[]>(lines)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const animTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    linesRef.current = lines
  }, [lines])

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
      if (animTimerRef.current) clearTimeout(animTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (!user) return
    ;(async () => {
      try {
        const [c, w] = await Promise.all([
          getDoc(doc(db, 'carts', user.uid)),
          getDoc(doc(db, 'wishlists', user.uid))
        ])
        if (c.exists()) {
          const r = c.data().lines as Line[]
          setLines(l => {
            const merged = [...r, ...l.filter(x => !r.some(y => y.productId === x.productId))]
            linesRef.current = merged
            return merged
          })
        }
        if (w.exists()) {
          setWish(x => Array.from(new Set([...(w.data().ids as string[]), ...x])))
        }
      } catch (e) {
        console.warn('Cart sync notice:', e)
      }
    })()
  }, [user])

  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(lines))
      if (user) {
        setDoc(doc(db, 'carts', user.uid), { lines }).catch(() => {})
      }
    } catch {}
  }, [lines, user])

  useEffect(() => {
    try {
      localStorage.setItem('wish', JSON.stringify(wishlist))
      if (user) {
        setDoc(doc(db, 'wishlists', user.uid), { ids: wishlist }).catch(() => {})
      }
    } catch {}
  }, [wishlist, user])

  const dismissToast = () => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current)
    }
    setToast(null)
  }

  const triggerCartNotification = (productName: string) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current)
    }
    const toastId = Date.now()
    setToast({
      id: toastId,
      productName,
      message: `${productName} added to your cart`,
    })

    toastTimerRef.current = setTimeout(() => {
      setToast(curr => (curr?.id === toastId ? null : curr))
    }, 3000)

    if (animTimerRef.current) {
      clearTimeout(animTimerRef.current)
    }
    setCartAnimating(true)
    animTimerRef.current = setTimeout(() => {
      setCartAnimating(false)
    }, 900)
  }

  const add = (id: string, customName?: string, customStock?: number): boolean => {
    if (!id || typeof id !== 'string') return false

    const prod = getProductById(id)
    const availableStock = customStock !== undefined ? customStock : prod ? prod.stock : undefined

    // Fail if product is known to have zero or negative stock
    if (availableStock !== undefined && availableStock <= 0) {
      return false
    }

    const current = linesRef.current
    const existing = current.find(x => x.productId === id)
    const currentQty = existing ? existing.qty : 0

    // Fail if customer already has all available stock in cart
    if (availableStock !== undefined && currentQty >= availableStock) {
      return false
    }

    const next = existing
      ? current.map(x => (x.productId === id ? { ...x, qty: x.qty + 1 } : x))
      : [...current, { productId: id, qty: 1 }]

    linesRef.current = next
    setLines(next)

    const resolvedName = (customName && customName.trim()) || prod?.name || 'Product'
    triggerCartNotification(resolvedName)
    return true
  }

  const setQty = (id: string, q: number) => {
    const current = linesRef.current
    const next =
      q <= 0 ? current.filter(x => x.productId !== id) : current.map(x => (x.productId === id ? { ...x, qty: q } : x))
    linesRef.current = next
    setLines(next)
  }

  const clear = () => {
    linesRef.current = []
    setLines([])
  }

  return (
    <C.Provider
      value={{
        lines,
        add,
        setQty,
        clear,
        wishlist,
        toggleWish: id =>
          setWish(w => (w.includes(id) ? w.filter(x => x !== id) : [...w, id])),
        toast,
        dismissToast,
        cartAnimating,
      }}
    >
      {children}
    </C.Provider>
  )
}
