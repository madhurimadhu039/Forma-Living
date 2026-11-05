import { Link, useSearchParams } from 'react-router-dom'
import { categories, products, Product } from '../data/products'
import { useCart } from '../contexts/CartContext'
import { formatPrice } from '../utils/format'

export function ProductCard({ p }: { p: Product }) {
  const { add, toggleWish, wishlist } = useCart()
  const inWish = wishlist.includes(p.id)

  return (
    <div className="group bg-white rounded-3xl p-3.5 shadow-sm border border-[#EFE8DC] hover:shadow-md transition-all duration-300 flex flex-col justify-between">
      <Link to={`/product/${p.id}`} className="block">
        <div className="aspect-[4/3.8] rounded-2xl overflow-hidden bg-[#F6F2EC]">
          <img
            src={p.image}
            alt={p.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            onError={e => {
              e.currentTarget.src = '/images/hero-living-room.jpg'
            }}
          />
        </div>

        <div className="mt-3.5">
          <p className="text-[11px] font-bold tracking-wider text-[#BD6024] uppercase">{p.category}</p>
          <h3 className="mt-1 font-semibold text-[#2B231D] text-base group-hover:text-[#BD6024] transition line-clamp-1">
            {p.name}
          </h3>
        </div>
      </Link>

      <div className="mt-2 pt-2 border-t border-[#F5EFE6] flex items-center justify-between">
        <div>
          <span className="font-bold text-[#BD6024] text-base">{formatPrice(p.price)}</span>
          {p.compareAt && (
            <s className="ml-1.5 text-xs text-[#A89C90]">{formatPrice(p.compareAt)}</s>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={p.stock < 1}
            onClick={() => add(p.id)}
            className="text-xs bg-[#FAF7F2] hover:bg-[#BD6024] text-[#2B231D] hover:text-white disabled:opacity-40 font-medium px-2.5 py-1.5 rounded-lg border border-[#EFE8DC] transition"
          >
            {p.stock < 1 ? 'Sold out' : '+ Cart'}
          </button>

          <button
            type="button"
            aria-label="Toggle wishlist"
            onClick={() => toggleWish(p.id)}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
              inWish
                ? 'bg-[#FCEEE2] text-[#BD6024]'
                : 'text-[#82756A] hover:bg-[#FAF7F2] hover:text-[#BD6024]'
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill={inWish ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Shop() {
  const [sp, setSp] = useSearchParams()
  const cat = sp.get('category') || ''
  const q = (sp.get('q') || '').toLowerCase()
  const sort = sp.get('sort') || ''
  const inStock = sp.get('stock') === '1'

  const set = (k: string, v: string) => {
    const n = new URLSearchParams(sp)
    if (v) n.set(k, v)
    else n.delete(k)
    setSp(n)
  }

  let list = products.filter(
    p =>
      (!cat || p.category === cat) &&
      (!q || `${p.name} ${p.material} ${p.style} ${p.color} ${p.category}`.toLowerCase().includes(q)) &&
      (!inStock || p.stock > 0)
  )

  if (sort === 'asc') list = [...list].sort((a, b) => a.price - b.price)
  if (sort === 'desc') list = [...list].sort((a, b) => b.price - a.price)

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      {/* Page Title & Breadcrumb */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-[#82756A] mb-2">
          <Link to="/" className="hover:text-[#BD6024]">Home</Link>
          <span>/</span>
          <span>Shop</span>
          {cat && (
            <>
              <span>/</span>
              <span className="text-[#2B231D] font-medium">{cat}</span>
            </>
          )}
        </div>
        <h1 className="font-sans font-bold text-3xl sm:text-4xl text-[#2B231D]">
          {cat || 'All Furniture Collections'}
        </h1>
        <p className="mt-2 text-sm text-[#6E6359]">
          Showing {list.length} {list.length === 1 ? 'piece' : 'distinct pieces'} curated for modern living.
        </p>
      </div>

      {/* Living Room Special Showcase Banner (Featured when viewing Living Room) */}
      {cat === 'Living Room' && (
        <div className="relative rounded-3xl overflow-hidden mb-10 h-64 sm:h-80 shadow-md border border-[#EFE8DC]">
          <img
            src="/images/living-room-banner.jpg"
            alt="Forma Living Room Collection"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent flex flex-col justify-center p-6 sm:p-12 text-white">
            <span className="text-xs font-bold tracking-[0.25em] text-[#F2DFCE] uppercase mb-2">
              Curated Living Sanctuary
            </span>
            <h2 className="font-sans font-bold text-3xl sm:text-4xl text-white max-w-lg leading-tight">
              Living Room Collection
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#E7DFD4] max-w-md leading-relaxed">
              Explore 16 handcrafted modern sofas, sculptural lounge chairs, fluted coffee tables, and contemporary consoles designed for elevated everyday comfort.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/25">16 Unique Pieces</span>
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/25">FSC Solid Timber</span>
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/25">Free Delivery Over $300</span>
            </div>
          </div>
        </div>
      )}

      {/* Bedroom Special Showcase Banner (Featured when viewing Bedroom) */}
      {cat === 'Bedroom' && (
        <div className="relative rounded-3xl overflow-hidden mb-10 h-64 sm:h-80 shadow-md border border-[#EFE8DC]">
          <img
            src="/images/bedroom-banner.jpg"
            alt="Forma Bedroom Collection"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent flex flex-col justify-center p-6 sm:p-12 text-white">
            <span className="text-xs font-bold tracking-[0.25em] text-[#F2DFCE] uppercase mb-2">
              Serene Sleep Sanctuary
            </span>
            <h2 className="font-sans font-bold text-3xl sm:text-4xl text-white max-w-lg leading-tight">
              Bedroom Collection
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#E7DFD4] max-w-md leading-relaxed">
              Discover 15 tranquil solid oak platform beds, Belgian linen upholstered headboards, fluted nightstands, and artisan dressers crafted for restful living.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/25">15 Unique Pieces</span>
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/25">Solid European Oak</span>
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/25">Hypoallergenic Materials</span>
            </div>
          </div>
        </div>
      )}

      {/* Dining Room Special Showcase Banner (Featured when viewing Dining Room) */}
      {cat === 'Dining Room' && (
        <div className="relative rounded-3xl overflow-hidden mb-10 h-64 sm:h-80 shadow-md border border-[#EFE8DC]">
          <img
            src="/images/dining-room-banner.jpg"
            alt="Forma Dining Room Collection"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent flex flex-col justify-center p-6 sm:p-12 text-white">
            <span className="text-xs font-bold tracking-[0.25em] text-[#F2DFCE] uppercase mb-2">
              Artisan Gathering &amp; Dining
            </span>
            <h2 className="font-sans font-bold text-3xl sm:text-4xl text-white max-w-lg leading-tight">
              Dining Room Collection
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#E7DFD4] max-w-md leading-relaxed">
              Elevate your dining space with 16 handcrafted solid oak pedestal tables, Italian Calacatta marble surfaces, woven cane dining chairs, and bespoke buffets.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/25">16 Unique Pieces</span>
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/25">FSC White Oak &amp; Marble</span>
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/25">Crafted for Gatherings</span>
            </div>
          </div>
        </div>
      )}

      {/* Lighting Special Showcase Banner (Featured when viewing Lighting) */}
      {cat === 'Lighting' && (
        <div className="relative rounded-3xl overflow-hidden mb-10 h-64 sm:h-80 shadow-md border border-[#EFE8DC]">
          <img
            src="/images/lighting-banner.jpg"
            alt="Forma Lighting Collection"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent flex flex-col justify-center p-6 sm:p-12 text-white">
            <span className="text-xs font-bold tracking-[0.25em] text-[#F2DFCE] uppercase mb-2">
              Illuminated Atmosphere
            </span>
            <h2 className="font-sans font-bold text-3xl sm:text-4xl text-white max-w-lg leading-tight">
              Lighting Collection
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#E7DFD4] max-w-md leading-relaxed">
              Transform mood and ambiance with 16 sculptural pendants, hand-finished brass floor lamps, carved travertine table lights, and articulating wall sconces.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/25">16 Unique Pieces</span>
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/25">Warm 2700K Glow</span>
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/25">Hand-Spun Brass &amp; Glass</span>
            </div>
          </div>
        </div>
      )}

      {/* Balcony Special Showcase Banner (Featured when viewing Balcony) */}
      {cat === 'Balcony' && (
        <div className="relative rounded-3xl overflow-hidden mb-10 h-64 sm:h-80 shadow-md border border-[#EFE8DC]">
          <img
            src="/images/balcony-banner.jpg"
            alt="Forma Balcony Collection"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent flex flex-col justify-center p-6 sm:p-12 text-white">
            <span className="text-xs font-bold tracking-[0.25em] text-[#F2DFCE] uppercase mb-2">
              Outdoor Sanctuary &amp; Fresh Air
            </span>
            <h2 className="font-sans font-bold text-3xl sm:text-4xl text-white max-w-lg leading-tight">
              Balcony Collection
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#E7DFD4] max-w-md leading-relaxed">
              Enjoy open-air living with 16 compact bistro tables, weather-resistant wicker egg swings, folding teak loungers, and vertical botanical planters.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/25">16 Unique Pieces</span>
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/25">All-Weather Teak &amp; Rattan</span>
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/25">Space-Smart Designs</span>
            </div>
          </div>
        </div>
      )}

      {/* Home Office Special Showcase Banner (Featured when viewing Home Office) */}
      {cat === 'Home Office' && (
        <div className="relative rounded-3xl overflow-hidden mb-10 h-64 sm:h-80 shadow-md border border-[#EFE8DC]">
          <img
            src="/images/home-office-banner.jpg"
            alt="Forma Home Office Collection"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent flex flex-col justify-center p-6 sm:p-12 text-white">
            <span className="text-xs font-bold tracking-[0.25em] text-[#F2DFCE] uppercase mb-2">
              Focus &amp; Ergonomics
            </span>
            <h2 className="font-sans font-bold text-3xl sm:text-4xl text-white max-w-lg leading-tight">
              Home Office Collection
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#E7DFD4] max-w-md leading-relaxed">
              Elevate productivity and daily comfort with 16 motorized standing desks, breathable ergonomic mesh chairs, walnut writing tables, and bespoke storage.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/25">16 Unique Pieces</span>
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/25">Ergonomic Precision</span>
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/25">Solid Oak &amp; Walnut</span>
            </div>
          </div>
        </div>
      )}

      {/* Storage Special Showcase Banner (Featured when viewing Storage) */}
      {cat === 'Storage' && (
        <div className="relative rounded-3xl overflow-hidden mb-10 h-64 sm:h-80 shadow-md border border-[#EFE8DC]">
          <img
            src="/images/storage-banner.jpg"
            alt="Forma Storage Collection"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent flex flex-col justify-center p-6 sm:p-12 text-white">
            <span className="text-xs font-bold tracking-[0.25em] text-[#F2DFCE] uppercase mb-2">
              Organized Simplicity
            </span>
            <h2 className="font-sans font-bold text-3xl sm:text-4xl text-white max-w-lg leading-tight">
              Storage Collection
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#E7DFD4] max-w-md leading-relaxed">
              Declutter gracefully with 16 architectural cane sideboards, fluted lowline credenzas, modular open bookcases, and entryway organizers.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/25">16 Unique Pieces</span>
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/25">Solid Oak &amp; Cane</span>
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/25">Modular Versatility</span>
            </div>
          </div>
        </div>
      )}

      {/* Decor Special Showcase Banner (Featured when viewing Decor) */}
      {cat === 'Decor' && (
        <div className="relative rounded-3xl overflow-hidden mb-10 h-64 sm:h-80 shadow-md border border-[#EFE8DC]">
          <img
            src="/images/decor-banner.jpg"
            alt="Forma Decor Collection"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent flex flex-col justify-center p-6 sm:p-12 text-white">
            <span className="text-xs font-bold tracking-[0.25em] text-[#F2DFCE] uppercase mb-2">
              Artisan Accents &amp; Soul
            </span>
            <h2 className="font-sans font-bold text-3xl sm:text-4xl text-white max-w-lg leading-tight">
              Decor &amp; Accents
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#E7DFD4] max-w-md leading-relaxed">
              Infuse tactile warmth with 16 hand-thrown ceramic urns, carved Roman travertine bowls, baby alpaca throws, and hand-knotted wool rugs.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/25">16 Unique Pieces</span>
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/25">Handcrafted Ceramics &amp; Travertine</span>
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/25">Artisan Textiles</span>
            </div>
          </div>
        </div>
      )}

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        <button
          onClick={() => set('category', '')}
          className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition ${
            !cat
              ? 'bg-[#2B231D] text-white shadow-xs'
              : 'bg-white border border-[#EFE8DC] text-[#6E6359] hover:bg-[#FAF7F2]'
          }`}
        >
          All Items
        </button>
        {categories.map(c => (
          <button
            key={c}
            onClick={() => set('category', c)}
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition ${
              cat === c
                ? 'bg-[#BD6024] text-white shadow-xs'
                : 'bg-white border border-[#EFE8DC] text-[#6E6359] hover:bg-[#FAF7F2]'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-[#EFE8DC] mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 text-sm flex-1">
          {/* Search Input */}
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <input
              className="w-full bg-[#FAF7F2] border border-[#EFE8DC] rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#BD6024]"
              placeholder="Search by keyword, style..."
              value={sp.get('q') || ''}
              onChange={e => set('q', e.target.value)}
            />
            <span className="absolute left-3 top-2.5 text-[#82756A] text-xs">🔍</span>
          </div>

          {/* Sort Dropdown */}
          <select
            className="bg-[#FAF7F2] border border-[#EFE8DC] rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#BD6024] text-[#2B231D]"
            value={sort}
            onChange={e => set('sort', e.target.value)}
          >
            <option value="">Featured</option>
            <option value="asc">Price: Low to High</option>
            <option value="desc">Price: High to Low</option>
          </select>

          {/* In-stock toggle */}
          <label className="flex items-center gap-2 text-xs sm:text-sm text-[#6E6359] cursor-pointer select-none">
            <input
              type="checkbox"
              className="accent-[#BD6024] rounded"
              checked={inStock}
              onChange={e => set('stock', e.target.checked ? '1' : '')}
            />
            In Stock Only
          </label>
        </div>

        {/* Clear Filters (if active) */}
        {(cat || q || sort || inStock) && (
          <button
            onClick={() => setSp(new URLSearchParams())}
            className="text-xs text-[#BD6024] hover:underline font-medium"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Product Grid */}
      {list.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {list.map(p => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-[#EFE8DC] p-8">
          <p className="text-4xl mb-3">🛋</p>
          <h3 className="text-lg font-bold text-[#2B231D]">No products found</h3>
          <p className="mt-1 text-sm text-[#82756A]">
            Try adjusting your search or category filter.
          </p>
          <button
            onClick={() => setSp(new URLSearchParams())}
            className="mt-5 px-5 py-2.5 rounded-xl bg-[#2B231D] text-white text-xs font-semibold hover:bg-[#3F332B] transition"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  )
}
