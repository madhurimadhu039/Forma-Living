import { useState } from 'react'
import { Link, Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { useProducts } from '../contexts/ProductContext'

export function Layout() {
  const { user, logout } = useAuth()
  const { lines, wishlist, toast, dismissToast, cartAnimating } = useCart()
  const { getProductById } = useProducts()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  const totalCartCount = lines.reduce((s, l) => s + l.qty, 0)
  const totalWishCount = wishlist.filter(id => Boolean(getProductById(id))).length

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
    }
  }

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#2B231D] selection:bg-[#F2DFCE] selection:text-[#BD6024]">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#EFE8DC]/90 transition">
        <div className="mx-auto max-w-6xl px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo with "Forma Living" */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl border-2 border-[#2B231D] flex items-center justify-center p-1 sm:p-1.5 transition group-hover:border-[#BD6024]">
              {/* Armchair Icon */}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 sm:w-5 sm:h-5 text-[#2B231D] group-hover:text-[#BD6024] transition">
                <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" />
                <path d="M3 11a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5z" />
                <path d="M6 18v2" />
                <path d="M18 18v2" />
                <path d="M4 12v3" />
                <path d="M20 12v3" />
              </svg>
            </div>
            <span className="font-sans font-bold text-lg sm:text-2xl tracking-tight text-[#2B231D]">
              Forma Living
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#6E6359]">
            <Link to="/" className={`transition ${isActive('/') ? 'text-[#BD6024] font-semibold' : 'hover:text-[#2B231D]'}`}>Home</Link>
            <Link to="/shop" className={`transition ${isActive('/shop') ? 'text-[#BD6024] font-semibold' : 'hover:text-[#2B231D]'}`}>Shop</Link>
            <Link to="/about" className={`transition ${isActive('/about') ? 'text-[#BD6024] font-semibold' : 'hover:text-[#2B231D]'}`}>About Us</Link>
            <Link to="/contact" className={`transition ${isActive('/contact') ? 'text-[#BD6024] font-semibold' : 'hover:text-[#2B231D]'}`}>Contact</Link>
          </nav>

          {/* Action Buttons: Search, Wishlist, Cart, Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Button (Desktop only; accessible via bottom bar on mobile) */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Search"
              className={`hidden md:flex w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-[#E7DFD5] bg-white items-center justify-center text-[#2B231D] hover:bg-[#FCEEE2] hover:border-[#BD6024]/40 transition shadow-2xs ${
                searchOpen ? 'bg-[#FCEEE2] border-[#BD6024]/60 text-[#BD6024]' : ''
              }`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>

            {/* Wishlist Link (Desktop only; accessible via bottom bar on mobile) */}
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className={`hidden md:flex w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-[#E7DFD5] bg-white items-center justify-center text-[#2B231D] hover:bg-[#FCEEE2] hover:border-[#BD6024]/40 transition relative shadow-2xs ${
                isActive('/wishlist') ? 'bg-[#FCEEE2] border-[#BD6024]/60 text-[#BD6024]' : ''
              }`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
              {totalWishCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] sm:min-w-[18px] sm:h-[18px] px-1 bg-[#BD6024] text-white rounded-full text-[9px] sm:text-[10px] font-bold flex items-center justify-center shadow-xs">
                  {totalWishCount}
                </span>
              )}
            </Link>

            {/* Cart Button (Desktop only; accessible via bottom bar on mobile) */}
            <Link
              to="/cart"
              aria-label="Cart"
              className={`hidden md:flex w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-[#E7DFD5] bg-white items-center justify-center text-[#2B231D] hover:bg-[#FCEEE2] hover:border-[#BD6024]/40 transition relative shadow-2xs ${
                cartAnimating ? 'animate-cart-bump border-[#BD6024] text-[#BD6024]' : ''
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`w-4 h-4 transition-colors ${cartAnimating ? 'text-[#BD6024]' : ''}`}
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {totalCartCount > 0 && (
                <span
                  key={totalCartCount}
                  className={`absolute -top-1 -right-1 min-w-[16px] h-[16px] sm:min-w-[18px] sm:h-[18px] px-1 bg-[#BD6024] text-white rounded-full text-[9px] sm:text-[10px] font-bold flex items-center justify-center shadow-xs ${
                    cartAnimating ? 'animate-badge-pop scale-110' : ''
                  }`}
                >
                  {totalCartCount}
                </span>
              )}
            </Link>

            {/* Sign In Navigation Link */}
            {user ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  to="/login"
                  aria-label="Account Overview"
                  className={`h-9 sm:h-10 px-2.5 sm:px-3 rounded-full border border-[#E7DFD5] bg-white flex items-center gap-1.5 text-[#2B231D] hover:bg-[#FCEEE2] hover:border-[#BD6024]/40 transition shadow-2xs ${
                    isActive('/login') ? 'bg-[#FCEEE2] border-[#BD6024]/60 text-[#BD6024]' : ''
                  }`}
                  title={user.email || 'Account'}
                >
                  <div className="w-5 h-5 rounded-full bg-[#BD6024] text-white flex items-center justify-center text-[10px] font-bold">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-xs font-semibold text-[#2B231D] hidden min-[520px]:inline truncate max-w-[110px]">
                    {user.email?.split('@')[0]}
                  </span>
                </Link>
                <button
                  onClick={() => logout()}
                  aria-label="Sign Out"
                  className="h-9 sm:h-10 px-2.5 sm:px-3 rounded-full border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold transition shadow-2xs flex items-center gap-1"
                  title="Sign Out"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  <span className="hidden min-[600px]:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                aria-label="Sign In"
                className={`h-9 sm:h-10 px-2.5 sm:px-3.5 rounded-full border border-[#E7DFD5] bg-white flex items-center gap-1.5 text-[#2B231D] hover:bg-[#FCEEE2] hover:border-[#BD6024]/40 transition shadow-2xs ${
                  isActive('/login') ? 'bg-[#FCEEE2] border-[#BD6024]/60 text-[#BD6024]' : ''
                }`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-[#BD6024]">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span className="text-xs font-semibold text-[#2B231D] hidden min-[440px]:inline">
                  Sign In
                </span>
              </Link>
            )}
          </div>
        </div>

        {/* Search Bar Dropdown */}
        {searchOpen && (
          <div className="border-t border-[#EFE8DC] bg-white px-3 sm:px-4 py-3 shadow-md animate-in fade-in duration-150">
            <form onSubmit={handleSearchSubmit} className="mx-auto max-w-2xl flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  autoFocus
                  placeholder="Search sofas, tables, lighting..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#E7DFD5] rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#BD6024]"
                />
                <span className="absolute left-3 top-3 text-[#82756A] text-xs">🔍</span>
              </div>
              <button
                type="submit"
                className="px-4 sm:px-5 py-2.5 bg-[#BD6024] text-white rounded-xl text-xs sm:text-sm font-medium hover:bg-[#a7521c] transition shrink-0"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-2 text-sm text-[#82756A] hover:text-[#2B231D]"
                aria-label="Close search"
              >
                ✕
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Main Content View with padding-bottom on mobile for bottom bar and iOS home indicator */}
      <main className="flex-1 pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:pb-0">
        <Outlet />
      </main>

      {/* Mobile Sticky Bottom Navigation Bar (Visible only on mobile screens < 768px, with iOS safe-area inset) */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-t border-[#EFE8DC] px-2 pt-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom,0px))] flex items-center justify-around shadow-lg"
      >
        {/* Home */}
        <Link
          to="/"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
            isActive('/') ? 'text-[#BD6024]' : 'text-[#82756A] hover:text-[#2B231D]'
          }`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span className="text-[10px] font-medium mt-0.5">Home</span>
        </Link>

        {/* Shop */}
        <Link
          to="/shop"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
            isActive('/shop') ? 'text-[#BD6024]' : 'text-[#82756A] hover:text-[#2B231D]'
          }`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
          <span className="text-[10px] font-medium mt-0.5">Catalog</span>
        </Link>

        {/* Search */}
        <button
          type="button"
          onClick={() => {
            setSearchOpen(true)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[#82756A] hover:text-[#2B231D] transition"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span className="text-[10px] font-medium mt-0.5">Search</span>
        </button>

        {/* Wishlist */}
        <Link
          to="/wishlist"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl relative transition ${
            isActive('/wishlist') ? 'text-[#BD6024]' : 'text-[#82756A] hover:text-[#2B231D]'
          }`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
          {totalWishCount > 0 && (
            <span className="absolute top-0.5 right-2 min-w-[14px] h-[14px] px-0.5 bg-[#BD6024] text-white rounded-full text-[8px] font-bold flex items-center justify-center">
              {totalWishCount}
            </span>
          )}
          <span className="text-[10px] font-medium mt-0.5">Wishlist</span>
        </Link>

        {/* Cart */}
        <Link
          to="/cart"
          aria-label="Cart"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl relative transition ${
            isActive('/cart') ? 'text-[#BD6024]' : 'text-[#82756A] hover:text-[#2B231D]'
          } ${cartAnimating ? 'animate-cart-bump' : ''}`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`w-5 h-5 transition-colors ${cartAnimating ? 'text-[#BD6024]' : ''}`}
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          {totalCartCount > 0 && (
            <span
              key={totalCartCount}
              className={`absolute top-0.5 right-2 min-w-[14px] h-[14px] px-0.5 bg-[#BD6024] text-white rounded-full text-[8px] font-bold flex items-center justify-center ${
                cartAnimating ? 'animate-badge-pop scale-110' : ''
              }`}
            >
              {totalCartCount}
            </span>
          )}
          <span className="text-[10px] font-medium mt-0.5">Cart</span>
        </Link>
      </nav>

      {/* Floating Success Toast Notification */}
      {toast && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed top-16 sm:top-20 right-3 sm:right-6 left-3 sm:left-auto sm:max-w-md z-50 pointer-events-auto"
        >
          <div className="bg-[#2B231D] text-white p-3 sm:p-4 rounded-2xl shadow-2xl border border-[#43372E] flex items-center justify-between gap-3 backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#BD6024] text-white flex items-center justify-center shrink-0">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-white truncate">
                  <span className="font-bold text-[#F2DFCE]">{toast.productName}</span> added to your cart
                </p>
                <p className="text-[10px] sm:text-[11px] text-[#D7CDC1]">
                  Ready for checkout
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <Link
                to="/cart"
                onClick={dismissToast}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#BD6024] hover:bg-[#a5511c] text-white text-xs font-semibold transition shadow-xs flex items-center gap-1"
              >
                <span>View Bag</span>
                <span className="text-[10px]">→</span>
              </Link>
              <button
                type="button"
                onClick={dismissToast}
                aria-label="Close notification"
                className="p-1 rounded-lg text-[#D7CDC1] hover:text-white hover:bg-white/10 transition"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 sm:w-4 sm:h-4">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </aside>
      )}
    </div>
  )
}

export function Protected({ admin, children }: { admin?: boolean; children: JSX.Element }) {
  const { user, isAdmin, loading } = useAuth()
  if (loading) return <p className="p-10 text-center text-[#82756A]">Loading…</p>
  if (!user || (admin && !isAdmin)) return <Navigate to="/login" replace />
  return children
}
