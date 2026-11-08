import { Link, useSearchParams } from 'react-router-dom'
import { useProducts, Product, categories } from '../contexts/ProductContext'
import { useCart } from '../contexts/CartContext'
import { formatPrice } from '../utils/format'

export function ProductCard({ p }: { p: Product }) {
  const { add, toggleWish, wishlist } = useCart()
  const inWish = wishlist.includes(p.id)

  return (
    <div className="group bg-white rounded-2xl sm:rounded-3xl p-2.5 sm:p-3.5 shadow-sm border border-[#EFE8DC] hover:shadow-md transition-all duration-300 flex flex-col justify-between">
      <Link to={`/product/${p.id}`} className="block">
        <div className="aspect-[4/3.8] rounded-xl sm:rounded-2xl overflow-hidden bg-[#F6F2EC]">
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

        <div className="mt-2.5 sm:mt-3.5">
          <p className="text-[10px] sm:text-[11px] font-bold tracking-wider text-[#BD6024] uppercase">{p.category}</p>
          <h3 className="mt-0.5 sm:mt-1 font-semibold text-[#2B231D] text-xs sm:text-base group-hover:text-[#BD6024] transition line-clamp-1">
            {p.name}
          </h3>
        </div>
      </Link>

      <div className="mt-2 pt-2 border-t border-[#F5EFE6] flex items-center justify-between gap-1">
        <div className="min-w-0">
          <span className="font-bold text-[#BD6024] text-xs sm:text-base">{formatPrice(p.price)}</span>
          {p.compareAt && (
            <s className="ml-1 sm:ml-1.5 text-[10px] sm:text-xs text-[#A89C90] hidden xs:inline">{formatPrice(p.compareAt)}</s>
          )}
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <button
            type="button"
            disabled={p.stock < 1}
            onClick={() => add(p.id)}
            className="text-[10px] sm:text-xs bg-[#FAF7F2] hover:bg-[#BD6024] text-[#2B231D] hover:text-white disabled:opacity-40 font-medium px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg border border-[#EFE8DC] transition"
          >
            {p.stock < 1 ? 'Sold' : '+ Cart'}
          </button>

          <button
            type="button"
            aria-label="Toggle wishlist"
            onClick={() => toggleWish(p.id)}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition shrink-0 ${
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
              className="w-3.5 h-3.5 sm:w-4 sm:h-4"
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
  const { products, loading, error } = useProducts()
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
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-10">
      {/* Page Title & Breadcrumb */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#82756A] mb-3">
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
          <Link to="/shop" className="hover:text-[#BD6024] font-medium">Shop</Link>
          {cat && (
            <>
              <span className="text-[#D7CDC1]">/</span>
              <span className="text-[#2B231D] font-bold">{cat}</span>
            </>
          )}
        </div>
        <h1 className="font-sans font-bold text-2xl sm:text-4xl text-[#2B231D]">
          {cat || 'All Furniture Collections'}
        </h1>
        <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-[#6E6359]">
          Showing {list.length} {list.length === 1 ? 'piece' : 'distinct pieces'} curated for modern living.
        </p>
      </div>

      {/* Living Room Special Showcase Banner (Featured when viewing Living Room) */}
      {cat === 'Living Room' && (
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden mb-6 sm:mb-10 min-h-[250px] sm:h-80 shadow-md border border-[#EFE8DC]">
          <img
            src="/images/living-room-banner.jpg"
            alt="Forma Living Room Collection"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-transparent flex flex-col justify-center p-4 sm:p-8 lg:p-12 text-white">
            <span className="text-[10px] sm:text-xs font-bold tracking-[0.25em] text-[#F2DFCE] uppercase mb-1.5 sm:mb-2">
              Curated Living Sanctuary
            </span>
            <h2 className="font-sans font-bold text-2xl sm:text-4xl text-white max-w-lg leading-tight">
              Living Room Collection
            </h2>
            <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-[#E7DFD4] max-w-md leading-relaxed line-clamp-3 sm:line-clamp-none">
              Explore 16 handcrafted modern sofas, sculptural lounge chairs, fluted coffee tables, and contemporary consoles designed for elevated everyday comfort.
            </p>
            <div className="mt-3 sm:mt-4 flex flex-wrap gap-1.5 sm:gap-2 text-[10px] sm:text-[11px]">
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/25">16 Unique Pieces</span>
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/25">FSC Solid Timber</span>
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/25">Free Delivery Over ₹5,000</span>
            </div>
          </div>
        </div>
      )}

      {/* Bedroom Special Showcase Banner (Featured when viewing Bedroom) */}
      {cat === 'Bedroom' && (
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden mb-6 sm:mb-10 min-h-[250px] sm:h-80 shadow-md border border-[#EFE8DC]">
          <img
            src="/images/bedroom-banner.jpg"
            alt="Forma Bedroom Collection"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-transparent flex flex-col justify-center p-4 sm:p-8 lg:p-12 text-white">
            <span className="text-[10px] sm:text-xs font-bold tracking-[0.25em] text-[#F2DFCE] uppercase mb-1.5 sm:mb-2">
              Serene Sleep Sanctuary
            </span>
            <h2 className="font-sans font-bold text-2xl sm:text-4xl text-white max-w-lg leading-tight">
              Bedroom Collection
            </h2>
            <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-[#E7DFD4] max-w-md leading-relaxed line-clamp-3 sm:line-clamp-none">
              Discover 15 tranquil solid oak platform beds, Belgian linen upholstered headboards, fluted nightstands, and artisan dressers crafted for restful living.
            </p>
            <div className="mt-3 sm:mt-4 flex flex-wrap gap-1.5 sm:gap-2 text-[10px] sm:text-[11px]">
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/25">15 Unique Pieces</span>
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/25">Solid European Oak</span>
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/25">Hypoallergenic Materials</span>
            </div>
          </div>
        </div>
      )}

      {/* Dining Room Special Showcase Banner (Featured when viewing Dining Room) */}
      {cat === 'Dining Room' && (
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden mb-6 sm:mb-10 min-h-[250px] sm:h-80 shadow-md border border-[#EFE8DC]">
          <img
            src="/images/dining-room-banner.jpg"
            alt="Forma Dining Room Collection"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-transparent flex flex-col justify-center p-4 sm:p-8 lg:p-12 text-white">
            <span className="text-[10px] sm:text-xs font-bold tracking-[0.25em] text-[#F2DFCE] uppercase mb-1.5 sm:mb-2">
              Artisan Gathering &amp; Dining
            </span>
            <h2 className="font-sans font-bold text-2xl sm:text-4xl text-white max-w-lg leading-tight">
              Dining Room Collection
            </h2>
            <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-[#E7DFD4] max-w-md leading-relaxed line-clamp-3 sm:line-clamp-none">
              Elevate your dining space with 16 handcrafted solid oak pedestal tables, Italian Calacatta marble surfaces, woven cane dining chairs, and bespoke buffets.
            </p>
            <div className="mt-3 sm:mt-4 flex flex-wrap gap-1.5 sm:gap-2 text-[10px] sm:text-[11px]">
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/25">16 Unique Pieces</span>
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/25">FSC White Oak &amp; Marble</span>
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/25">Crafted for Gatherings</span>
            </div>
          </div>
        </div>
      )}

      {/* Lighting Special Showcase Banner (Featured when viewing Lighting) */}
      {cat === 'Lighting' && (
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden mb-6 sm:mb-10 min-h-[250px] sm:h-80 shadow-md border border-[#EFE8DC]">
          <img
            src="/images/lighting-banner.jpg"
            alt="Forma Lighting Collection"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-transparent flex flex-col justify-center p-4 sm:p-8 lg:p-12 text-white">
            <span className="text-[10px] sm:text-xs font-bold tracking-[0.25em] text-[#F2DFCE] uppercase mb-1.5 sm:mb-2">
              Illuminated Atmosphere
            </span>
            <h2 className="font-sans font-bold text-2xl sm:text-4xl text-white max-w-lg leading-tight">
              Lighting Collection
            </h2>
            <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-[#E7DFD4] max-w-md leading-relaxed line-clamp-3 sm:line-clamp-none">
              Transform mood and ambiance with 16 sculptural pendants, hand-finished brass floor lamps, carved travertine table lights, and articulating wall sconces.
            </p>
            <div className="mt-3 sm:mt-4 flex flex-wrap gap-1.5 sm:gap-2 text-[10px] sm:text-[11px]">
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/25">16 Unique Pieces</span>
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/25">Warm 2700K Glow</span>
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/25">Hand-Spun Brass &amp; Glass</span>
            </div>
          </div>
        </div>
      )}

      {/* Balcony Special Showcase Banner (Featured when viewing Balcony) */}
      {cat === 'Balcony' && (
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden mb-6 sm:mb-10 min-h-[250px] sm:h-80 shadow-md border border-[#EFE8DC]">
          <img
            src="/images/balcony-banner.jpg"
            alt="Forma Balcony Collection"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-transparent flex flex-col justify-center p-4 sm:p-8 lg:p-12 text-white">
            <span className="text-[10px] sm:text-xs font-bold tracking-[0.25em] text-[#F2DFCE] uppercase mb-1.5 sm:mb-2">
              Outdoor Sanctuary &amp; Fresh Air
            </span>
            <h2 className="font-sans font-bold text-2xl sm:text-4xl text-white max-w-lg leading-tight">
              Balcony Collection
            </h2>
            <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-[#E7DFD4] max-w-md leading-relaxed line-clamp-3 sm:line-clamp-none">
              Enjoy open-air living with 16 compact bistro tables, weather-resistant wicker egg swings, folding teak loungers, and vertical botanical planters.
            </p>
            <div className="mt-3 sm:mt-4 flex flex-wrap gap-1.5 sm:gap-2 text-[10px] sm:text-[11px]">
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/25">16 Unique Pieces</span>
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/25">All-Weather Teak &amp; Rattan</span>
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/25">Space-Smart Designs</span>
            </div>
          </div>
        </div>
      )}

      {/* Home Office Special Showcase Banner (Featured when viewing Home Office) */}
      {cat === 'Home Office' && (
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden mb-6 sm:mb-10 min-h-[250px] sm:h-80 shadow-md border border-[#EFE8DC]">
          <img
            src="/images/home-office-banner.jpg"
            alt="Forma Home Office Collection"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-transparent flex flex-col justify-center p-4 sm:p-8 lg:p-12 text-white">
            <span className="text-[10px] sm:text-xs font-bold tracking-[0.25em] text-[#F2DFCE] uppercase mb-1.5 sm:mb-2">
              Focus &amp; Ergonomics
            </span>
            <h2 className="font-sans font-bold text-2xl sm:text-4xl text-white max-w-lg leading-tight">
              Home Office Collection
            </h2>
            <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-[#E7DFD4] max-w-md leading-relaxed line-clamp-3 sm:line-clamp-none">
              Elevate productivity and daily comfort with 16 motorized standing desks, breathable ergonomic mesh chairs, walnut writing tables, and bespoke storage.
            </p>
            <div className="mt-3 sm:mt-4 flex flex-wrap gap-1.5 sm:gap-2 text-[10px] sm:text-[11px]">
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/25">16 Unique Pieces</span>
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/25">Ergonomic Precision</span>
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/25">Solid Oak &amp; Walnut</span>
            </div>
          </div>
        </div>
      )}

      {/* Storage Special Showcase Banner (Featured when viewing Storage) */}
      {cat === 'Storage' && (
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden mb-6 sm:mb-10 min-h-[250px] sm:h-80 shadow-md border border-[#EFE8DC]">
          <img
            src="/images/storage-banner.jpg"
            alt="Forma Storage Collection"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-transparent flex flex-col justify-center p-4 sm:p-8 lg:p-12 text-white">
            <span className="text-[10px] sm:text-xs font-bold tracking-[0.25em] text-[#F2DFCE] uppercase mb-1.5 sm:mb-2">
              Organized Simplicity
            </span>
            <h2 className="font-sans font-bold text-2xl sm:text-4xl text-white max-w-lg leading-tight">
              Storage Collection
            </h2>
            <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-[#E7DFD4] max-w-md leading-relaxed line-clamp-3 sm:line-clamp-none">
              Declutter gracefully with 16 architectural cane sideboards, fluted lowline credenzas, modular open bookcases, and entryway organizers.
            </p>
            <div className="mt-3 sm:mt-4 flex flex-wrap gap-1.5 sm:gap-2 text-[10px] sm:text-[11px]">
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/25">16 Unique Pieces</span>
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/25">Solid Oak &amp; Cane</span>
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/25">Modular Versatility</span>
            </div>
          </div>
        </div>
      )}

      {/* Decor Special Showcase Banner (Featured when viewing Decor) */}
      {cat === 'Decor' && (
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden mb-6 sm:mb-10 min-h-[250px] sm:h-80 shadow-md border border-[#EFE8DC]">
          <img
            src="/images/decor-banner.jpg"
            alt="Forma Decor Collection"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-transparent flex flex-col justify-center p-4 sm:p-8 lg:p-12 text-white">
            <span className="text-[10px] sm:text-xs font-bold tracking-[0.25em] text-[#F2DFCE] uppercase mb-1.5 sm:mb-2">
              Artisan Accents &amp; Soul
            </span>
            <h2 className="font-sans font-bold text-2xl sm:text-4xl text-white max-w-lg leading-tight">
              Decor &amp; Accents
            </h2>
            <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-[#E7DFD4] max-w-md leading-relaxed line-clamp-3 sm:line-clamp-none">
              Infuse tactile warmth with 16 hand-thrown ceramic urns, carved Roman travertine bowls, baby alpaca throws, and hand-knotted wool rugs.
            </p>
            <div className="mt-3 sm:mt-4 flex flex-wrap gap-1.5 sm:gap-2 text-[10px] sm:text-[11px]">
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/25">16 Unique Pieces</span>
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/25">Handcrafted Ceramics &amp; Travertine</span>
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/25">Artisan Textiles</span>
            </div>
          </div>
        </div>
      )}

      {/* Outdoor Furniture Special Showcase Banner (Featured when viewing Outdoor Furniture) */}
      {cat === 'Outdoor Furniture' && (
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden mb-6 sm:mb-10 min-h-[250px] sm:h-80 shadow-md border border-[#EFE8DC]">
          <img
            src="/images/outdoor-banner.jpg"
            alt="Forma Outdoor Living Collection"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-transparent flex flex-col justify-center p-4 sm:p-8 lg:p-12 text-white">
            <span className="text-[10px] sm:text-xs font-bold tracking-[0.25em] text-[#F2DFCE] uppercase mb-1.5 sm:mb-2">
              Resort Living &amp; Al Fresco
            </span>
            <h2 className="font-sans font-bold text-2xl sm:text-4xl text-white max-w-lg leading-tight">
              Outdoor Furniture Collection
            </h2>
            <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-[#E7DFD4] max-w-md leading-relaxed line-clamp-3 sm:line-clamp-none">
              Transform your garden, deck, and poolside into a luxury retreat with 16 solid teak sectionals, round canopy daybeds, concrete dining tables, and gas fire bowls.
            </p>
            <div className="mt-3 sm:mt-4 flex flex-wrap gap-1.5 sm:gap-2 text-[10px] sm:text-[11px]">
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/25">16 Unique Pieces</span>
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/25">Grade-A Plantation Teak</span>
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/25">All-Weather Sunbrella Fabric</span>
            </div>
          </div>
        </div>
      )}

      {/* Category Pills Slider */}
      <div className="-mx-4 sm:mx-0 px-4 sm:px-0 flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2.5 mb-5 sm:mb-6 scrollbar-none">
        <button
          onClick={() => set('category', '')}
          className={`shrink-0 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-semibold transition ${
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
            className={`shrink-0 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-semibold transition ${
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
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-[#EFE8DC] mb-6 sm:mb-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 text-sm flex-1">
          {/* Search Input */}
          <div className="relative w-full sm:w-auto sm:min-w-[220px] sm:max-w-xs">
            <input
              className="w-full bg-[#FAF7F2] border border-[#EFE8DC] rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#BD6024]"
              placeholder="Search by keyword, style..."
              value={sp.get('q') || ''}
              onChange={e => set('q', e.target.value)}
            />
            <span className="absolute left-3 top-2.5 text-[#82756A] text-xs">🔍</span>
          </div>

          {/* Sort Dropdown & in-stock toggle */}
          <div className="flex items-center justify-between sm:justify-start gap-2.5 sm:gap-3">
            <select
              className="bg-[#FAF7F2] border border-[#EFE8DC] rounded-xl px-2.5 sm:px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#BD6024] text-[#2B231D]"
              value={sort}
              onChange={e => set('sort', e.target.value)}
            >
              <option value="">Featured</option>
              <option value="asc">Price: Low to High</option>
              <option value="desc">Price: High to Low</option>
            </select>

            <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-[#6E6359] cursor-pointer select-none">
              <input
                type="checkbox"
                className="accent-[#BD6024] rounded"
                checked={inStock}
                onChange={e => set('stock', e.target.checked ? '1' : '')}
              />
              In Stock Only
            </label>

            {(cat || q || sort || inStock) && (
              <button
                onClick={() => setSp(new URLSearchParams())}
                className="text-xs text-[#BD6024] hover:underline font-medium ml-auto sm:ml-0"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {list.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
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
