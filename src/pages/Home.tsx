import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { products, categoryList, Product } from '../data/products'
import { useCart } from '../contexts/CartContext'

export default function Home() {
  const { add, toggleWish, wishlist } = useCart()
  const [activeSlide, setActiveSlide] = useState(0)
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterSent, setNewsletterSent] = useState(false)

  // Grab the 4 popular products featured in the reference design
  const popularIds = ['cozy-armchair', 'modern-sofa', 'wooden-table', 'stylish-lamp']
  const popularProducts = popularIds
    .map(id => products.find(p => p.id === id))
    .filter((p): p is Product => Boolean(p))

  const handleNewsletter = (e: FormEvent) => {
    e.preventDefault()
    if (newsletterEmail.trim()) {
      setNewsletterSent(true)
      setNewsletterEmail('')
      setTimeout(() => setNewsletterSent(false), 4000)
    }
  }

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* 1. HERO SECTION */}
      <section className="pt-6 sm:pt-12 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Heading, Subtext, CTA Button & Slider Dots */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <h1 className="font-sans font-extrabold text-5xl sm:text-6xl lg:text-[68px] leading-[1.08] tracking-tight text-[#2B231D]">
              Stunning &<br />
              Modern<br />
              <span className="text-[#BD6024]">Furniture</span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-[#6E6359] max-w-md leading-relaxed font-normal">
              Create your perfect space with our stylish and comfortable designs.
            </p>

            <div className="mt-8">
              <Link
                to="/shop"
                className="inline-flex items-center gap-3 px-8 py-3.5 sm:py-4 rounded-2xl bg-[#BD6024] hover:bg-[#a5511c] text-white font-medium text-base shadow-sm hover:shadow-md transition active:scale-[0.99]"
              >
                <span>Shop Now</span>
                <span className="text-xl">→</span>
              </Link>
            </div>

            {/* Slider Dots Indicator */}
            <div className="mt-10 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveSlide(0)}
                aria-label="Slide 1"
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  activeSlide === 0 ? 'w-8 bg-[#BD6024]' : 'w-2.5 bg-[#D7CDC1] hover:bg-[#b0a496]'
                }`}
              />
              <button
                type="button"
                onClick={() => setActiveSlide(1)}
                aria-label="Slide 2"
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  activeSlide === 1 ? 'w-8 bg-[#BD6024]' : 'w-2.5 bg-[#D7CDC1] hover:bg-[#b0a496]'
                }`}
              />
              <button
                type="button"
                onClick={() => setActiveSlide(2)}
                aria-label="Slide 3"
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  activeSlide === 2 ? 'w-8 bg-[#BD6024]' : 'w-2.5 bg-[#D7CDC1] hover:bg-[#b0a496]'
                }`}
              />
            </div>
          </div>

          {/* Right Column: Hero Living Room Showcase with Arch Backdrop */}
          <div className="lg:col-span-7 relative flex justify-center">
            {/* Curved Arch Decorative Backdrop */}
            <div className="relative w-full max-w-lg lg:max-w-none">
              <div className="absolute inset-0 top-6 -bottom-6 bg-[#EFE8DC]/80 rounded-t-[180px] rounded-b-[40px] -z-10 translate-y-3 scale-[1.02]"></div>

              {/* Main Living Room Image */}
              <div className="relative overflow-hidden rounded-t-[160px] rounded-b-3xl shadow-lg border-4 border-white/80 bg-[#FAF7F2]">
                <img
                  src="/images/hero-living-room.jpg"
                  alt="Stunning & Modern Living Room with Cream Sofa, Armchair, and Coffee Table"
                  className="w-full h-[360px] sm:h-[460px] lg:h-[500px] object-cover hover:scale-105 transition duration-700"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. VALUE PROPOSITIONS / FEATURES BAR */}
      <section className="px-4 sm:px-6">
        <div className="mx-auto max-w-5xl bg-white rounded-3xl shadow-sm border border-[#EFE8DC] p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Feature 1: Free Delivery */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#FCEEE2] flex items-center justify-center shrink-0 text-[#BD6024]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                  <rect x="1" y="3" width="15" height="13" rx="2" />
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
              </div>
              <div>
                <h2 className="font-bold text-[#2B231D] text-base">Free Delivery</h2>
                <p className="text-xs sm:text-sm text-[#82756A] mt-0.5">Fast &amp; Safe</p>
              </div>
            </div>

            {/* Feature 2: High Quality */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#FCEEE2] flex items-center justify-center shrink-0 text-[#BD6024]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
              </div>
              <div>
                <h2 className="font-bold text-[#2B231D] text-base">High Quality</h2>
                <p className="text-xs sm:text-sm text-[#82756A] mt-0.5">Premium Materials</p>
              </div>
            </div>

            {/* Feature 3: Best Prices */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#FCEEE2] flex items-center justify-center shrink-0 text-[#BD6024]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
              </div>
              <div>
                <h2 className="font-bold text-[#2B231D] text-base">Best Prices</h2>
                <p className="text-xs sm:text-sm text-[#82756A] mt-0.5">Affordable Choices</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. POPULAR PRODUCTS SECTION */}
      <section className="px-4 sm:px-6">
        <div className="mx-auto max-w-6xl relative">
          {/* Section Header with Decorative Dots */}
          <div className="flex items-center justify-between mb-8">
            <div className="w-12 hidden sm:block"></div>
            <div className="text-center mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#2B231D] tracking-tight flex items-center justify-center gap-3">
                <span className="text-[#C7BCB0] font-light">—</span>
                Popular Products
                <span className="text-[#C7BCB0] font-light">—</span>
              </h2>
            </div>
            {/* Subtle decorative dot grid */}
            <div className="hidden sm:grid grid-cols-4 gap-1.5 opacity-25" aria-hidden="true">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2B231D]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#2B231D]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#2B231D]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#2B231D]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#2B231D]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#2B231D]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#2B231D]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#2B231D]"></span>
            </div>
          </div>

          {/* 4 Popular Product Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularProducts.map(product => {
              const inWish = wishlist.includes(product.id)
              return (
                <div
                  key={product.id}
                  className="group bg-white rounded-3xl p-3.5 shadow-sm border border-[#EFE8DC] hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                >
                  <Link to={`/product/${product.id}`} className="block">
                    <div className="aspect-[4/3.8] rounded-2xl overflow-hidden bg-[#F6F2EC]">
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        onError={e => {
                          e.currentTarget.src = '/images/hero-living-room.jpg'
                        }}
                      />
                    </div>

                    <h3 className="mt-4 font-semibold text-[#2B231D] text-base group-hover:text-[#BD6024] transition">
                      {product.name}
                    </h3>
                  </Link>

                  <div className="mt-2 pt-1 flex items-center justify-between">
                    <span className="font-bold text-[#BD6024] text-base">
                      ${product.price}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => add(product.id)}
                        className="text-xs bg-[#FAF7F2] hover:bg-[#BD6024] text-[#2B231D] hover:text-white font-medium px-2.5 py-1.5 rounded-lg border border-[#EFE8DC] transition"
                        title="Add to Cart"
                      >
                        + Cart
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleWish(product.id)}
                        aria-label={`Add ${product.name} to wishlist`}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition ${
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
                          className="w-5 h-5"
                        >
                          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* View All Products CTA Button */}
          <div className="mt-12 text-center">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#2B231D] hover:bg-[#3F332B] text-white text-sm font-semibold tracking-wide transition shadow-sm hover:shadow"
            >
              <span>View All Products</span>
              <span className="text-base">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. TRANSFORM YOUR HOME BANNER (DEEP FOREST GREEN) */}
      <section className="px-4 sm:px-6">
        <div className="mx-auto max-w-6xl rounded-3xl bg-[#344030] p-6 sm:p-10 lg:p-12 text-white shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Content */}
            <div className="lg:col-span-4 flex flex-col justify-center">
              <h2 className="text-3xl sm:text-4xl font-sans font-bold text-white tracking-tight leading-tight">
                Transform Your Home
              </h2>
              <p className="mt-4 text-[#CAD5C6] text-sm sm:text-base leading-relaxed">
                Explore our collections and find the perfect pieces to elevate your interior.
              </p>
              <div className="mt-6">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#F2DFCE] hover:text-white underline underline-offset-4 transition"
                >
                  Explore All Collections →
                </Link>
              </div>
            </div>

            {/* Right Collection Cards (3 Vertical Cards) */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
              {/* Card 1: New Arrivals */}
              <Link
                to="/shop?category=Living%20Room"
                className="group bg-white rounded-2xl p-2.5 sm:p-3 text-center flex flex-col items-center shadow-sm hover:shadow-md transition duration-300"
              >
                <div className="aspect-[3/3.8] w-full rounded-xl overflow-hidden bg-[#FAF7F2]">
                  <img
                    src="/images/collection-new-arrivals.jpg"
                    alt="New Arrivals Natural Rattan Chair"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>
                <div className="mt-3 mb-1 flex items-center justify-center gap-2 text-[#2B231D]">
                  <span className="w-6 h-6 rounded-full bg-[#344030] text-[#F2DFCE] flex items-center justify-center text-xs">
                    ★
                  </span>
                  <span className="font-semibold text-xs sm:text-sm">New Arrivals</span>
                </div>
              </Link>

              {/* Card 2: Minimalist Design */}
              <Link
                to="/shop?category=Storage"
                className="group bg-white rounded-2xl p-2.5 sm:p-3 text-center flex flex-col items-center shadow-sm hover:shadow-md transition duration-300"
              >
                <div className="aspect-[3/3.8] w-full rounded-xl overflow-hidden bg-[#FAF7F2]">
                  <img
                    src="/images/collection-minimalist.jpg"
                    alt="Minimalist Design White Display Shelving"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>
                <div className="mt-3 mb-1 flex items-center justify-center gap-2 text-[#2B231D]">
                  <span className="w-6 h-6 rounded-full bg-[#344030] text-[#F2DFCE] flex items-center justify-center text-xs">
                    🛋
                  </span>
                  <span className="font-semibold text-xs sm:text-sm">Minimalist Design</span>
                </div>
              </Link>

              {/* Card 3: Special Offers */}
              <Link
                to="/shop"
                className="group bg-white rounded-2xl p-2.5 sm:p-3 text-center flex flex-col items-center shadow-sm hover:shadow-md transition duration-300"
              >
                <div className="aspect-[3/3.8] w-full rounded-xl overflow-hidden bg-[#FAF7F2]">
                  <img
                    src="/images/collection-special-offers.jpg"
                    alt="Special Offers Warm Velvet Pouf"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>
                <div className="mt-3 mb-1 flex items-center justify-center gap-2 text-[#2B231D]">
                  <span className="w-6 h-6 rounded-full bg-[#344030] text-[#F2DFCE] flex items-center justify-center text-xs">
                    %
                  </span>
                  <span className="font-semibold text-xs sm:text-sm">Special Offers</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SHOP BY CATEGORY SECTION */}
      <section className="px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] text-[#BD6024] uppercase">Browse Collections</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#2B231D] tracking-tight mt-1">
                Shop by Category
              </h2>
            </div>
            <Link
              to="/shop"
              className="text-sm font-semibold text-[#BD6024] hover:text-[#a5511c] transition flex items-center gap-1"
            >
              <span>View full catalog</span>
              <span>→</span>
            </Link>
          </div>

          {/* Category Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-5">
            {categoryList.map(cat => (
              <Link
                key={cat.name}
                to={`/shop?category=${encodeURIComponent(cat.name)}`}
                className="group relative h-48 sm:h-56 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-end p-5"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-700 brightness-[0.88] group-hover:brightness-[0.8]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                <div className="relative z-10 text-white">
                  <h3 className="font-sans font-bold text-lg sm:text-xl leading-snug">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-white/80 mt-1 line-clamp-1">
                    {cat.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 6. COMPACT & PROFESSIONAL DARK FOOTER (ONLY ON HOME PAGE) */}
      <footer className="w-full bg-[#1E1914] text-[#FAF7F2] border-t border-[#332A22] shadow-lg pt-10 pb-8 px-6 sm:px-10 lg:px-16 xl:px-20 mt-16 sm:mt-24">
        <div className="w-full">
          {/* Main Grid: Balanced & Full Viewport Distribution */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 pb-8 border-b border-[#31271F] w-full">
            {/* Col 1: Brand & Tagline - Left */}
            <div className="sm:col-span-2 lg:col-span-4 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg border border-[#BD6024] bg-[#29221C] flex items-center justify-center p-1">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-[#BD6024]">
                    <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" />
                    <path d="M3 11a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5z" />
                    <path d="M6 18v2" />
                    <path d="M18 18v2" />
                  </svg>
                </div>
                <span className="font-sans font-bold text-xl tracking-tight text-white">
                  Forma Living
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#A89E93] leading-relaxed max-w-sm">
                Thoughtfully designed modern furniture &amp; decor crafted for beautiful, happier spaces.
              </p>

              {/* Social Icons */}
              <div className="flex items-center gap-2 pt-1">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="w-8 h-8 rounded-full bg-[#29221C] text-[#D8CEC4] border border-[#3D332B] flex items-center justify-center hover:bg-[#BD6024] hover:text-white hover:border-[#BD6024] transition shadow-xs"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="w-8 h-8 rounded-full bg-[#29221C] text-[#D8CEC4] border border-[#3D332B] flex items-center justify-center hover:bg-[#BD6024] hover:text-white hover:border-[#BD6024] transition shadow-xs"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
                <a
                  href="https://pinterest.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Pinterest"
                  className="w-8 h-8 rounded-full bg-[#29221C] text-[#D8CEC4] border border-[#3D332B] flex items-center justify-center hover:bg-[#BD6024] hover:text-white hover:border-[#BD6024] transition shadow-xs"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                    <path d="M12 0a12 12 0 0 0-4.37 23.18c-.03-.98-.05-2.5.05-3.58l.75-3.18s-.19-.38-.19-.94c0-.88.51-1.54 1.15-1.54.54 0 .8.41.8.9 0 .55-.35 1.36-.53 2.12-.15.64.32 1.16.95 1.16 1.14 0 2.02-1.2 2.02-2.93 0-1.53-1.1-2.6-2.67-2.6-1.95 0-3.09 1.46-3.09 2.97 0 .59.23 1.22.51 1.57.06.07.07.13.05.2l-.19.78c-.03.13-.1.16-.23.1-1.04-.48-1.69-2-1.69-3.22 0-2.62 1.9-5.03 5.49-5.03 2.88 0 5.12 2.05 5.12 4.8 0 2.86-1.8 5.16-4.3 5.16-.84 0-1.63-.44-1.9-.95l-.52 1.98c-.19.72-.7 1.62-1.04 2.18A12 12 0 1 0 12 0z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Col 2: Navigation Links - Middle */}
            <div className="lg:col-span-2">
              <p className="text-xs font-bold tracking-wider uppercase text-white mb-3">Shop</p>
              <ul className="space-y-1.5 text-xs text-[#A89E93]">
                <li><Link to="/shop" className="hover:text-white transition">All Products</Link></li>
                <li><Link to="/shop?category=Living%20Room" className="hover:text-white transition">Living Room</Link></li>
                <li><Link to="/shop?category=Dining%20Room" className="hover:text-white transition">Dining Room</Link></li>
                <li><Link to="/shop?category=Bedroom" className="hover:text-white transition">Bedroom</Link></li>
              </ul>
            </div>

            {/* Col 3: Company - Middle */}
            <div className="lg:col-span-2">
              <p className="text-xs font-bold tracking-wider uppercase text-white mb-3">Company</p>
              <ul className="space-y-1.5 text-xs text-[#A89E93]">
                <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-white transition">Contact Concierge</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition">Terms &amp; Conditions</Link></li>
              </ul>
            </div>

            {/* Col 4: Compact Newsletter - Right */}
            <div className="sm:col-span-2 lg:col-span-4">
              <p className="text-xs font-bold tracking-wider uppercase text-white mb-1">Stay Inspired</p>
              <p className="text-xs text-[#A89E93] mb-3">Subscribe for design updates and exclusive new arrivals.</p>
              {newsletterSent ? (
                <div className="p-2.5 rounded-xl bg-[#29221C] border border-[#BD6024]/50 text-xs text-[#BD6024] font-medium">
                  ✓ Thank you! You’re on the Forma list.
                </div>
              ) : (
                <form onSubmit={handleNewsletter} className="flex gap-2 max-w-md">
                  <input
                    type="email"
                    required
                    placeholder="Enter email address"
                    value={newsletterEmail}
                    onChange={e => setNewsletterEmail(e.target.value)}
                    className="flex-1 bg-[#29221C] border border-[#3D332B] rounded-xl px-3 py-2 text-xs text-white placeholder-[#786E64] focus:outline-none focus:ring-2 focus:ring-[#BD6024]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#BD6024] hover:bg-[#a5511c] text-white rounded-xl text-xs font-semibold transition shrink-0"
                  >
                    Join
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Bottom Bar: Copyright on Left & Payment Badges on Right */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 w-full text-xs text-[#7A7066]">
            <p className="text-left">© 2026 Forma Living — Shape Your Space. All rights reserved.</p>

            <div className="flex items-center gap-1.5 text-[10px] text-[#A89E93] sm:ml-auto">
              <span className="px-2 py-0.5 rounded bg-[#29221C] border border-[#3D332B]">VISA</span>
              <span className="px-2 py-0.5 rounded bg-[#29221C] border border-[#3D332B]">MC</span>
              <span className="px-2 py-0.5 rounded bg-[#29221C] border border-[#3D332B]">AMEX</span>
              <span className="px-2 py-0.5 rounded bg-[#29221C] border border-[#3D332B]">Apple Pay</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
