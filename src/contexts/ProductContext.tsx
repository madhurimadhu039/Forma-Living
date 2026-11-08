import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../config/firebase'
import { products as staticProducts, categoryList, categories, Product, CategoryInfo } from '../data/products'

export type { Product, CategoryInfo }
export { categoryList, categories }

interface ProductContextValue {
  products: Product[]
  loading: boolean
  error: string | null
  getProductById: (id: string) => Product | undefined
  categories: string[]
  categoryList: CategoryInfo[]
}

const ProductContext = createContext<ProductContextValue>({
  products: staticProducts,
  loading: false,
  error: null,
  getProductById: (id: string) => staticProducts.find(p => p.id === id),
  categories,
  categoryList,
})

export const useProducts = () => useContext(ProductContext)

export function ProductProvider({ children }: { children: ReactNode }) {
  // 1. Initialize state with static products as the resilient fallback
  const [products, setProducts] = useState<Product[]>(staticProducts)
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
            return {
              id: docSnap.id,
              name: String(data.name || docSnap.id),
              category: String(data.category || 'Living Room'),
              style: String(data.style || 'Modern'),
              color: String(data.color || ''),
              material: String(data.material || ''),
              price: Number(data.price || 0),
              compareAt: data.compareAt ? Number(data.compareAt) : undefined,
              stock: Number(data.stock ?? 0),
              width: Number(data.width || 0),
              depth: Number(data.depth || 0),
              height: Number(data.height || 0),
              description: String(data.description || ''),
              image: String(data.image || `/images/${docSnap.id}.jpg`),
              images:
                Array.isArray(data.images) && data.images.length > 0
                  ? data.images.map(String)
                  : [String(data.image || `/images/${docSnap.id}.jpg`)],
              isPopular: Boolean(data.isPopular),
            }
          })

          setProducts(liveProducts)
          setError(null)
        } else {
          // If Firestore collection has not yet been seeded, retain static catalog fallback
          setProducts(staticProducts)
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

  const getProductById = (id: string): Product | undefined => {
    return products.find(p => p.id === id)
  }

  return (
    <ProductContext.Provider
      value={{
        products,
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

