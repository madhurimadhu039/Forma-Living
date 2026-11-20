import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterSent, setNewsletterSent] = useState(false)

  const handleNewsletter = (e: FormEvent) => {
    e.preventDefault()
    if (newsletterEmail.trim()) {
      setNewsletterSent(true)
      setNewsletterEmail('')
      setTimeout(() => setNewsletterSent(false), 4000)
    }
  }

  return (
    <footer className="w-full bg-[#1E1914] text-[#FAF7F2] border-t border-[#332A22] shadow-lg pt-8 sm:pt-10 pb-20 md:pb-8 px-4 sm:px-10 lg:px-16 xl:px-20 mt-12 sm:mt-24">
      <div className="w-full">
        {/* Main Grid: Balanced & Full Viewport Distribution */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 pb-6 sm:pb-8 border-b border-[#31271F] w-full">
          {/* Col 1: Brand & Tagline - Left */}
          <div className="sm:col-span-2 lg:col-span-4 space-y-2.5 sm:space-y-3">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-[#BD6024] bg-[#29221C] flex items-center justify-center p-1">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 sm:w-5 sm:h-5 text-[#BD6024]"
                >
                  <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" />
                  <path d="M3 11a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5z" />
                  <path d="M6 18v2" />
                  <path d="M18 18v2" />
                </svg>
              </div>
              <span className="font-sans font-bold text-lg sm:text-xl tracking-tight text-white">
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
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-3.5 h-3.5"
                >
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
            </div>
          </div>

          {/* Col 2 & 3: Navigation Links - 2 Columns on mobile */}
          <div className="grid grid-cols-2 gap-4 sm:col-span-2 lg:col-span-4">
            <div>
              <p className="text-xs font-bold tracking-wider uppercase text-white mb-2 sm:mb-3">
                Shop
              </p>
              <ul className="space-y-1.5 text-xs text-[#A89E93]">
                <li>
                  <Link to="/shop" className="hover:text-white transition">
                    All Products
                  </Link>
                </li>
                <li>
                  <Link to="/shop?category=Living%20Room" className="hover:text-white transition">
                    Living Room
                  </Link>
                </li>
                <li>
                  <Link to="/shop?category=Dining%20Room" className="hover:text-white transition">
                    Dining Room
                  </Link>
                </li>
                <li>
                  <Link to="/shop?category=Bedroom" className="hover:text-white transition">
                    Bedroom
                  </Link>
                </li>
                <li>
                  <Link
                    to="/shop?category=Outdoor%20Furniture"
                    className="hover:text-white transition"
                  >
                    Outdoor
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-bold tracking-wider uppercase text-white mb-2 sm:mb-3">
                Company
              </p>
              <ul className="space-y-1.5 text-xs text-[#A89E93]">
                <li>
                  <Link to="/about" className="hover:text-white transition">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-white transition">
                    Concierge
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-white transition">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-white transition">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Col 4: Compact Newsletter - Right */}
          <div className="sm:col-span-2 lg:col-span-4">
            <p className="text-xs font-bold tracking-wider uppercase text-white mb-1">
              Stay Inspired
            </p>
            <p className="text-xs text-[#A89E93] mb-3">
              Subscribe for design updates and exclusive new arrivals.
            </p>
            {newsletterSent ? (
              <div className="p-2.5 rounded-xl bg-[#29221C] border border-[#BD6024]/50 text-xs text-[#BD6024] font-medium">
                ✓ Thank you! You’re on the Forma list.
              </div>
            ) : (
              <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-2 max-w-md">
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
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 w-full text-xs text-[#7A7066] text-center sm:text-left">
          <p>© 2026 Forma Living — Shape Your Space. All rights reserved.</p>

          <div className="flex flex-wrap justify-center items-center gap-1.5 text-[10px] text-[#A89E93] sm:ml-auto">
            <span className="px-2 py-0.5 rounded bg-[#29221C] border border-[#3D332B]">VISA</span>
            <span className="px-2 py-0.5 rounded bg-[#29221C] border border-[#3D332B]">MC</span>
            <span className="px-2 py-0.5 rounded bg-[#29221C] border border-[#3D332B]">AMEX</span>
            <span className="px-2 py-0.5 rounded bg-[#29221C] border border-[#3D332B]">
              Apple Pay
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
