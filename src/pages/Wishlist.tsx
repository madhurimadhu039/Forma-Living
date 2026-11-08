import { Link } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useProducts, Product } from '../contexts/ProductContext'
import { ProductCard } from './Shop'

export default function Wishlist() {
  const { wishlist, toggleWish, add } = useCart()
  const { getProductById, loading } = useProducts()

  // Match saved wishlist IDs with live products from ProductContext
  const savedProducts = wishlist
    .map(id => getProductById(id))
    .filter((p): p is Product => Boolean(p))

  const handleAddAllToCart = () => {
    savedProducts.forEach(p => {
      if (p.stock > 0) {
        add(p.id)
      }
    })
  }

  const handleClearWishlist = () => {
    // Toggling each currently saved item removes it cleanly while syncing with localStorage & Firestore
    wishlist.forEach(id => toggleWish(id))
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-10">
      {/* Top Navigation & Breadcrumb */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#82756A] mb-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#EFE8DC] font-semibold text-[#2B231D] hover:bg-[#FCEEE2] hover:text-[#BD6024] hover:border-[#BD6024]/50 shadow-2xs transition group"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-3.5 h-3.5 text-[#BD6024] group-hover:-translate-x-1 transition-transform"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span>Back to Home</span>
          </Link>
          <span className="text-[#D7CDC1]">/</span>
          <span className="text-[#2B231D] font-bold">Wishlist</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EFE8DC]">
          <div>
            <h1 className="font-sans font-bold text-2xl sm:text-4xl text-[#2B231D] tracking-tight">
              Saved Wishlist
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#82756A]">
              {savedProducts.length} {savedProducts.length === 1 ? 'piece' : 'pieces'} saved for your space
            </p>
          </div>

          {savedProducts.length > 0 && (
            <div className="flex items-center gap-2.5 self-start sm:self-auto">
              <button
                type="button"
                onClick={handleAddAllToCart}
                className="px-4 py-2 rounded-xl bg-[#BD6024] hover:bg-[#a5511c] text-white text-xs font-semibold shadow-2xs transition"
              >
                Add All in Stock to Bag
              </button>
              <button
                type="button"
                onClick={handleClearWishlist}
                className="px-3 py-2 rounded-xl border border-[#EFE8DC] bg-white hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-[#82756A] text-xs font-semibold transition"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Loading Skeleton Placeholder */}
      {loading && savedProducts.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-[#EFE8DC] p-8">
          <p className="text-sm font-medium text-[#82756A] animate-pulse">Loading saved pieces…</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && savedProducts.length === 0 && (
        <div className="text-center py-16 sm:py-24 bg-white rounded-2xl sm:rounded-3xl border border-[#EFE8DC] p-6 sm:p-12 shadow-sm">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#FAF7F2] border border-[#EFE8DC] text-[#BD6024] flex items-center justify-center mx-auto mb-5 shadow-inner">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-8 h-8 sm:w-10 sm:h-10 text-[#BD6024]"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </div>
          <h2 className="font-sans font-bold text-xl sm:text-2xl text-[#2B231D]">
            Your wishlist is empty
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#82756A] max-w-md mx-auto leading-relaxed">
            Explore our handcrafted collections and click the heart icon on any piece to save your favorite designs for later.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/shop"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl sm:rounded-2xl bg-[#BD6024] hover:bg-[#a5511c] text-white font-semibold text-xs sm:text-sm transition shadow-sm"
            >
              Explore Furniture Catalog
            </Link>
            <Link
              to="/"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl sm:rounded-2xl border border-[#EFE8DC] bg-white hover:bg-[#FAF7F2] text-[#2B231D] font-semibold text-xs sm:text-sm transition"
            >
              Return Home
            </Link>
          </div>
        </div>
      )}

      {/* Populated Wishlist Products Grid */}
      {savedProducts.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {savedProducts.map(p => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      )}
    </div>
  )
}

