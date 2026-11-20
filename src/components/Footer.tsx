import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../config/firebase'

const SUBSCRIBED_KEY = 'forma_newsletter_subscribers'

const getSubscribedEmails = (): string[] => {
  try {
    const raw = localStorage.getItem(SUBSCRIBED_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const markEmailSubscribed = (email: string) => {
  try {
    const list = getSubscribedEmails()
    if (!list.includes(email)) {
      list.push(email)
      localStorage.setItem(SUBSCRIBED_KEY, JSON.stringify(list))
    }
  } catch {}
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'already-subscribed' | 'error'
  >('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleNewsletter = async (e: FormEvent) => {
    e.preventDefault()
    if (status === 'loading') return
    setErrorMessage('')

    // Anti-bot honeypot check: silently accept without writing to Firestore
    if (honeypot && honeypot.trim() !== '') {
      setStatus('success')
      setNewsletterEmail('')
      setHoneypot('')
      return
    }

    const trimmed = newsletterEmail.trim()
    if (!trimmed) {
      setStatus('error')
      setErrorMessage('Please enter your email address.')
      return
    }

    const normalizedEmail = trimmed.toLowerCase()

    if (
      normalizedEmail.length < 5 ||
      normalizedEmail.length > 120 ||
      !EMAIL_REGEX.test(normalizedEmail)
    ) {
      setStatus('error')
      setErrorMessage('Please enter a valid email address (5–120 characters).')
      return
    }

    // Check client-side deduplication cache first
    if (getSubscribedEmails().includes(normalizedEmail)) {
      setStatus('already-subscribed')
      return
    }

    setStatus('loading')

    try {
      await setDoc(doc(db, 'subscribers', normalizedEmail), {
        email: normalizedEmail,
        status: 'subscribed',
        createdAt: serverTimestamp(),
      })

      markEmailSubscribed(normalizedEmail)
      setStatus('success')
      setNewsletterEmail('')
      setHoneypot('')
    } catch (err: any) {
      console.error('Newsletter subscription error:', err)
      const code = err?.code || ''
      if (getSubscribedEmails().includes(normalizedEmail)) {
        setStatus('already-subscribed')
      } else if (code === 'permission-denied') {
        setStatus('error')
        setErrorMessage('Unable to complete subscription at this time. Please try again later.')
      } else {
        setStatus('error')
        setErrorMessage('Unable to subscribe at this moment. Please try again.')
      }
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

            {status === 'success' ? (
              <div className="p-3 rounded-xl bg-[#29221C] border border-[#BD6024]/50 text-xs text-[#E89258] font-medium flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[#BD6024] font-bold text-sm">✓</span>
                  <span>Thank you! You’re on the Forma list.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setStatus('idle')}
                  className="text-[#A89E93] hover:text-white text-xs underline shrink-0"
                >
                  Done
                </button>
              </div>
            ) : status === 'already-subscribed' ? (
              <div className="p-3 rounded-xl bg-[#29221C] border border-amber-500/40 text-xs text-amber-200/90 font-medium flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-bold text-sm">ⓘ</span>
                  <span>This email is already subscribed.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setStatus('idle')}
                  className="text-[#A89E93] hover:text-white text-xs underline shrink-0"
                >
                  Close
                </button>
              </div>
            ) : (
              <div>
                {status === 'error' && errorMessage && (
                  <div className="mb-2 p-2.5 rounded-xl bg-[#3B1E19] border border-rose-500/40 text-xs text-rose-200 flex items-center justify-between gap-2">
                    <span>{errorMessage}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setStatus('idle')
                        setErrorMessage('')
                      }}
                      className="text-rose-300 hover:text-white text-xs font-bold px-1"
                      aria-label="Dismiss error"
                    >
                      ×
                    </button>
                  </div>
                )}

                <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-2 max-w-md">
                  {/* Anti-bot honeypot field */}
                  <div className="hidden" aria-hidden="true" style={{ display: 'none' }}>
                    <label htmlFor="footer-newsletter-hp">Do not fill this</label>
                    <input
                      id="footer-newsletter-hp"
                      type="text"
                      name="hp_company_field"
                      value={honeypot}
                      onChange={e => setHoneypot(e.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  <input
                    type="email"
                    required
                    placeholder="Enter email address"
                    value={newsletterEmail}
                    onChange={e => {
                      setNewsletterEmail(e.target.value)
                      if (status === 'error') {
                        setStatus('idle')
                        setErrorMessage('')
                      }
                    }}
                    disabled={status === 'loading'}
                    className="flex-1 bg-[#29221C] border border-[#3D332B] rounded-xl px-3 py-2 text-xs text-white placeholder-[#786E64] focus:outline-none focus:ring-2 focus:ring-[#BD6024] disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="px-4 py-2 bg-[#BD6024] hover:bg-[#a5511c] disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition shrink-0 flex items-center justify-center gap-1.5 min-w-[70px]"
                  >
                    {status === 'loading' ? (
                      <>
                        <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        <span>Joining…</span>
                      </>
                    ) : (
                      'Join'
                    )}
                  </button>
                </form>
              </div>
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
