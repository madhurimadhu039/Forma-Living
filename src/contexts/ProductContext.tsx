import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../config/firebase'
import { products as staticProducts, categoryList, categories, Product, CategoryInfo } from '../data/products'

export type { Product, CategoryInfo }
export { categoryList, categories }

interface ProductContextValue {
  /** Active (non-archived) products exposed to storefront, search, wishlist, and checkout */
  products: Product[]
  /** Complete product list including archived items (used by Admin Dashboard) */
  allProducts: Product[]
  /** True when reading live documents from Firestore; false when displaying static fallback */
  isLive: boolean
  loading: boolean
  error: string | null
  getProductById: (id: string) => Product | undefined
  categories: string[]
  categoryList: CategoryInfo[]
}

const initialActiveProducts = staticProducts.filter(p => !p.archived)

const ProductContext = createContext<ProductContextValue>({
  products: initialActiveProducts,
  allProducts: staticProducts,
  isLive: false,
  loading: false,
  error: null,
  getProductById: (id: string) => initialActiveProducts.find(p => p.id === id),
  categories,
  categoryList,
})

export const useProducts = () => useContext(ProductContext)

export function ProductProvider({ children }: { children: ReactNode }) {
  // 1. Initialize state with static products as the resilient fallback
  const [allProducts, setAllProducts] = useState<Product[]>(staticProducts)
  const [isLive, setIsLive] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    // 2. Establish single shared onSnapshot listener to 'products' collection
    const productsRef = collection(db, 'products')
    const unsubscribe = onSnapshot(
      productsRef,
      snapshot => {
        if (!isMounted) return

        if (!snapshot.empty) {
          const liveProducts: Product[] = snapshot.docs.map(docSnap => {
            const data = docSnap.data()
            const primaryImage = String(data.image || `/images/${docSnap.id}.jpg`)
            return {
              id: docSnap.id,
              name: String(data.name || docSnap.id),
              category: String(data.category || 'Living Room'),
              style: String(data.style || 'Modern'),
              color: String(data.color || ''),
              material: String(data.material || ''),
              price: Number(data.price || 0),
              compareAt:
                typeof data.compareAt === 'number' && data.compareAt > 0
                  ? Number(data.compareAt)
                  : undefined,
              stock: Number(data.stock ?? 0),
              width: Number(data.width || 0),
              depth: Number(data.depth || 0),
              height: Number(data.height || 0),
              description: String(data.description || ''),
              image: primaryImage,
              images:
                Array.isArray(data.images) && data.images.length > 0
                  ? data.images.map(String)
                  : [primaryImage],
              isPopular: Boolean(data.isPopular),
              // Products without an explicit archived flag are treated as active
              archived: Boolean(data.archived),
            }
          })

          setAllProducts(liveProducts)
          setIsLive(true)
          setError(null)
        } else {
          // If Firestore collection has not yet been seeded, retain static catalog fallback
          setAllProducts(staticProducts)
          setIsLive(false)
        }
        setLoading(false)
      },
      err => {
        if (!isMounted) return
        console.warn('Firestore onSnapshot listener notice:', err.message)
        // CRUCIAL: Retain the last valid product data! Never replace with an empty array.
        setError(err.message || 'Live product synchronization notice. Displaying cached catalogue.')
        setLoading(false)
      }
    )

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [])

  const products = useMemo(() => allProducts.filter(p => !p.archived), [allProducts])

  const getProductById = (id: string): Product | undefined => {
    return products.find(p => p.id === id)
  }

  return (
    <ProductContext.Provider
      value={{
        products,
        allProducts,
        isLive,
        loading,
        error,
        getProductById,
        categories,
        categoryList,
      }}
    >
      {children}
    </ProductContext.Provider>
  )
}

