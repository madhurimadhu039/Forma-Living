import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useProducts } from '../contexts/ProductContext'
import { useCart } from '../contexts/CartContext'
import { ProductCard } from './Shop'
import { formatPrice } from '../utils/format'
import { normalizeProductImages } from '../services/adminProducts'

export default function ProductPage() {
  const { id } = useParams()
  const { getProductById, products, loading } = useProducts()
  const p = getProductById(id || '')
  const { add, toggleWish, wishlist } = useCart()
  const [addedNote, setAddedNote] = useState(false)
  const rawGalleryKey = p
    ? `${p.image}::${Array.isArray(p.images) ? p.images.join('|') : ''}`
    : ''

  const gallery = useMemo(() => {
    if (!p) return []
    return normalizeProductImages(p.image, p.images && p.images.length > 0 ? p.images : [p.image])
      .images
  }, [p?.id, rawGalleryKey])
  const [selectedImage, setSelectedImage] = useState('')

  useEffect(() => {
    setSelectedImage(gallery[0] || '')
  }, [p?.id, rawGalleryKey])

  if (!p) {
    if (loading) {
      return (
        <div className="mx-auto max-w-4xl px-4 py-24 text-center">
          <p className="text-sm font-medium text-[#82756A] animate-pulse">Loading piece details…</p>
        </div>
      )
    }
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center">
        <h1 className="text-3xl font-bold text-[#2B231D]">Product not found</h1>
        <p className="mt-2 text-[#82756A]">The furniture item you are looking for does not exist or has been moved.</p>
        <Link to="/shop" className="mt-6 inline-block px-6 py-3 bg-[#BD6024] text-white rounded-xl font-medium">
          Browse Catalog
        </Link>
      </div>
    )
  }

  const inWish = wishlist.includes(p.id)
  const related = products.filter(x => x.category === p.category && x.id !== p.id).slice(0, 4)

  const handleAdd = () => {
    const success = add(p.id, p.name, p.stock)
    if (success) {
      setAddedNote(true)
      setTimeout(() => setAddedNote(false), 2500)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-5 sm:py-10">
      {/* Breadcrumbs */}
      <nav className="flex flex-wrap items-center gap-2 text-xs text-[#82756A] mb-5 sm:mb-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#EFE8DC] font-semibold text-[#2B231D] hover:bg-[#FCEEE2] hover:text-[#BD6024] hover:border-[#BD6024]/50 shadow-2xs transition group"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-[#BD6024] group-hover:-translate-x-1 transition-transform">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Back to Home</span>
        </Link>
        <span className="text-[#D7CDC1]">/</span>
        <Link to="/shop" className="hover:text-[#BD6024]">Shop</Link>
        <span>/</span>
        <Link to={`/shop?category=${encodeURIComponent(p.category)}`} className="hover:text-[#BD6024]">
          {p.category}
        </Link>
        <span>/</span>
        <span className="text-[#2B231D] font-medium max-w-[140px] sm:max-w-none truncate">{p.name}</span>
      </nav>

      {/* Product Main Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 lg:gap-14">
        {/* Left: Product Image Gallery */}
        <div className="lg:col-span-7 space-y-3">
          <div className="aspect-[4/3] sm:aspect-[4/3.5] rounded-2xl sm:rounded-3xl overflow-hidden bg-white shadow-sm border border-[#EFE8DC]">
            <img
              src={
                selectedImage && gallery.includes(selectedImage)
                  ? selectedImage
                  : gallery[0] || p.image
              }
              alt={p.name}
              className="w-full h-full object-cover"
              onError={e => {
                e.currentTarget.src = '/images/hero-living-room.jpg'
              }}
            />
          </div>

          {gallery.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5 sm:gap-3">
              {gallery.map((imgUrl, idx) => {
                const isSelected =
                  (selectedImage && gallery.includes(selectedImage)
                    ? selectedImage
                    : gallery[0]) === imgUrl
                return (
                  <button
                    key={`${imgUrl}-${idx}`}
                    type="button"
                    onClick={() => setSelectedImage(imgUrl)}
                    aria-label={`View image ${idx + 1} of ${p.name}`}
                    className={`aspect-[4/3] rounded-xl overflow-hidden bg-white border transition ${
                      isSelected
                        ? 'border-[#BD6024] ring-2 ring-[#BD6024]/30'
                        : 'border-[#EFE8DC] hover:border-[#BD6024]/60 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`${p.name} thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={e => {
                        e.currentTarget.src = '/images/hero-living-room.jpg'
                      }}
                    />
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Right: Info & Purchase Controls */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <p className="text-xs font-bold tracking-widest text-[#BD6024] uppercase">{p.category}</p>
          <h1 className="mt-1.5 sm:mt-2 font-sans font-bold text-2xl sm:text-4xl text-[#2B231D] tracking-tight">
            {p.name}
          </h1>

          {/* Price */}
          <div className="mt-3 sm:mt-4 flex items-center gap-3">
            <span className="text-2xl sm:text-3xl font-bold text-[#BD6024]">{formatPrice(p.price)}</span>
            {p.compareAt && (
              <s className="text-base sm:text-lg text-[#A89C90]">{formatPrice(p.compareAt)}</s>
            )}
          </div>

          <p className="mt-3 sm:mt-5 text-[#6E6359] text-sm sm:text-base leading-relaxed">
            {p.description}
          </p>

          {/* Action Buttons */}
          <div className="mt-6 sm:mt-8 flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={handleAdd}
              disabled={p.stock < 1}
              className="flex-1 py-3.5 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl bg-[#BD6024] hover:bg-[#a5511c] disabled:opacity-50 text-white font-semibold text-sm sm:text-base shadow-sm hover:shadow transition active:scale-[0.99]"
            >
              {p.stock < 1 ? 'Out of Stock' : addedNote ? '✓ Added to Cart!' : 'Add to Cart'}
            </button>

            <button
              onClick={() => toggleWish(p.id)}
              aria-label="Wishlist"
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl border flex items-center justify-center shrink-0 transition ${
                inWish
                  ? 'border-[#BD6024] bg-[#FCEEE2] text-[#BD6024]'
                  : 'border-[#EFE8DC] bg-white text-[#82756A] hover:text-[#BD6024] hover:bg-[#FAF7F2]'
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                fill={inWish ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 sm:w-6 sm:h-6"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </button>
          </div>

          {/* Specifications Table */}
          <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-[#EFE8DC]">
            <h2 className="text-xs font-bold tracking-widest uppercase text-[#2B231D] mb-3 sm:mb-4">
              Specifications &amp; Dimensions
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
              <div className="p-2.5 rounded-xl bg-white border border-[#EFE8DC]/70">
                <dt className="text-[#82756A] text-[11px]">Material</dt>
                <dd className="font-semibold text-[#2B231D] mt-0.5">{p.material}</dd>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-[#EFE8DC]/70">
                <dt className="text-[#82756A] text-[11px]">Design Style</dt>
                <dd className="font-semibold text-[#2B231D] mt-0.5">{p.style}</dd>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-[#EFE8DC]/70">
                <dt className="text-[#82756A] text-[11px]">Colour</dt>
                <dd className="font-semibold text-[#2B231D] mt-0.5">{p.color}</dd>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-[#EFE8DC]/70">
                <dt className="text-[#82756A] text-[11px]">Dimensions (W×D×H)</dt>
                <dd className="font-semibold text-[#2B231D] mt-0.5">{p.width} × {p.depth} × {p.height} cm</dd>
              </div>
              <div className="sm:col-span-2 p-2.5 rounded-xl bg-white border border-[#EFE8DC]/70 flex items-center justify-between">
                <div>
                  <dt className="text-[#82756A] text-[11px]">Availability Status</dt>
                  <dd className="font-semibold text-[#2B231D] mt-0.5">
                    {p.stock > 0 ? `${p.stock} units ready to ship` : 'Currently out of stock'}
                  </dd>
                </div>
                <span className={`w-3 h-3 rounded-full ${p.stock > 0 ? 'bg-emerald-500' : 'bg-red-400'}`}></span>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="mt-12 sm:mt-20 pt-8 sm:pt-12 border-t border-[#EFE8DC]">
          <div className="flex items-center justify-between mb-5 sm:mb-8">
            <h2 className="font-sans font-bold text-xl sm:text-2xl text-[#2B231D]">
              More for {p.category}
            </h2>
            <Link
              to={`/shop?category=${encodeURIComponent(p.category)}`}
              className="text-xs sm:text-sm font-semibold text-[#BD6024] hover:text-[#a5511c]"
            >
              View category →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {related.map(item => (
              <ProductCard key={item.id} p={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
