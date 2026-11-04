import { useState } from 'react'
import { Link, Outlet, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'

export function Layout() {
  const { user, logout } = useAuth()
  const { lines, wishlist } = useCart()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const totalCartCount = lines.reduce((s, l) => s + l.qty, 0)

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#2B231D] selection:bg-[#F2DFCE] selection:text-[#BD6024]">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#EFE8DC]/80">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          {/* Logo with "Forma Living" */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl border-2 border-[#2B231D] flex items-center justify-center p-1.5 transition group-hover:border-[#BD6024]">
              {/* Armchair Icon */}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-[#2B231D] group-hover:text-[#BD6024] transition">
                <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" />
                <path d="M3 11a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5z" />
                <path d="M6 18v2" />
                <path d="M18 18v2" />
                <path d="M4 12v3" />
                <path d="M20 12v3" />
              </svg>
            </div>
            <span className="font-sans font-bold text-xl sm:text-2xl tracking-tight text-[#2B231D]">
              Forma Living
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#6E6359]">
            <Link to="/" className="hover:text-[#2B231D] transition">Home</Link>
            <Link to="/shop" className="hover:text-[#2B231D] transition">Shop</Link>
            <Link to="/about" className="hover:text-[#2B231D] transition">About Us</Link>
            <Link to="/contact" className="hover:text-[#2B231D] transition">Contact</Link>
          </nav>

          {/* Action Buttons: Search, Cart, Menu */}
          <div className="flex items-center gap-3">
            {/* Search Button */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Search"
              className="w-10 h-10 rounded-full border border-[#E7DFD5] bg-white flex items-center justify-center text-[#2B231D] hover:bg-[#FCEEE2] hover:border-[#BD6024]/40 transition shadow-2xs"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>

            {/* Wishlist Link */}
            <Link
              to="/shop"
              aria-label="Wishlist"
              className="hidden sm:flex w-10 h-10 rounded-full border border-[#E7DFD5] bg-white items-center justify-center text-[#2B231D] hover:bg-[#FCEEE2] hover:border-[#BD6024]/40 transition relative shadow-2xs"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#BD6024] text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <Link
              to="/cart"
              aria-label="Cart"
              className="w-10 h-10 rounded-full border border-[#E7DFD5] bg-white flex items-center justify-center text-[#2B231D] hover:bg-[#FCEEE2] hover:border-[#BD6024]/40 transition relative shadow-2xs"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#BD6024] text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-xs">
                  {totalCartCount}
                </span>
              )}
            </Link>

            {/* Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Navigation Menu"
              className="w-10 h-10 rounded-full border border-[#E7DFD5] bg-white flex items-center justify-center text-[#2B231D] hover:bg-[#FCEEE2] hover:border-[#BD6024]/40 transition shadow-2xs"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search Bar Dropdown */}
        {searchOpen && (
          <div className="border-t border-[#EFE8DC] bg-white px-4 py-3 shadow-md animate-in fade-in duration-150">
            <form onSubmit={handleSearchSubmit} className="mx-auto max-w-2xl flex items-center gap-2">
              <input
                type="text"
                autoFocus
                placeholder="Search sofas, armchairs, lamps, tables..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#E7DFD5] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#BD6024]"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#BD6024] text-white rounded-xl text-sm font-medium hover:bg-[#a7521c] transition"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="px-3 py-2 text-xs text-[#82756A] hover:text-[#2B231D]"
              >
                ✕
              </button>
            </form>
          </div>
        )}

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="border-t border-[#EFE8DC] bg-white px-6 py-5 shadow-lg space-y-4">
            <div className="flex flex-col space-y-3 text-base font-medium">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#BD6024]">Home</Link>
              <Link to="/shop" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#BD6024]">Shop All Furniture</Link>
              <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#BD6024]">About Us</Link>
              <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#BD6024]">Contact</Link>
            </div>
            <div className="pt-4 border-t border-[#EFE8DC] flex items-center justify-between text-sm">
              {user ? (
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#82756A] truncate max-w-[160px]">{user.email}</span>
                  <button onClick={logout} className="text-red-700 font-semibold text-xs">Sign out</button>
                </div>
              ) : (
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-[#BD6024] font-semibold">
                  Sign in / Register
                </Link>
              )}
              <Link to="/cart" onClick={() => setMobileMenuOpen(false)} className="font-semibold text-[#2B231D]">
                Cart ({totalCartCount})
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content View (No footer on general layout) */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}

export function Protected({ admin, children }: { admin?: boolean; children: JSX.Element }) {
  const { user, isAdmin, loading } = useAuth()
  if (loading) return <p className="p-10 text-center text-[#82756A]">Loading…</p>
  if (!user || (admin && !isAdmin)) return <Navigate to="/login" replace />
  return children
}
