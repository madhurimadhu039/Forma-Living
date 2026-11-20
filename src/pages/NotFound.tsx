import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { applySeo } from '../utils/seo'

export default function NotFound() {
  useEffect(() => {
    applySeo({
      title: 'Page Not Found (404) | Forma Living',
      description:
        'The piece, collection, or room you’re looking for doesn’t exist or has found a new home in our catalog.',
      noIndex: true,
    })
  }, [])
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16 sm:py-28 flex flex-col items-center justify-center text-center">
      {/* Decorative Brand Accent */}
      <div className="relative mb-6">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#FCEEE2] border-2 border-[#BD6024]/20 flex items-center justify-center shadow-xs">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-10 h-10 sm:w-12 sm:h-12 text-[#BD6024]"
          >
            <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" />
            <path d="M3 11a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5z" />
            <path d="M6 18v2" />
            <path d="M18 18v2" />
            <path d="M4 12v3" />
            <path d="M20 12v3" />
          </svg>
        </div>
        <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-[#2B231D] text-white font-mono text-xs font-bold shadow-sm">
          404
        </span>
      </div>

      {/* Heading & Subtitle */}
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#BD6024]">
        Page Not Found
      </p>
      <h1 className="mt-2 font-sans font-extrabold text-3xl sm:text-5xl text-[#2B231D] tracking-tight">
        A Space Yet Unshaped
      </h1>
      <p className="mt-4 text-sm sm:text-base text-[#6E6359] max-w-md leading-relaxed">
        The piece, collection, or room you’re looking for doesn’t exist or has found a new home in our catalog.
      </p>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        <Link
          to="/"
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#2B231D] hover:bg-[#3F332B] text-white text-xs sm:text-sm font-semibold transition shadow-sm hover:shadow"
        >
          Return Home
        </Link>
        <Link
          to="/shop"
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#BD6024] hover:bg-[#a5511c] text-white text-xs sm:text-sm font-semibold transition shadow-sm hover:shadow"
        >
          Explore Catalog →
        </Link>
      </div>

      {/* Helpful Links */}
      <div className="mt-12 pt-8 border-t border-[#EFE8DC] w-full max-w-md flex flex-wrap items-center justify-center gap-4 text-xs text-[#82756A]">
        <span>Looking for assistance?</span>
        <Link to="/contact" className="text-[#BD6024] hover:underline font-semibold">
          Contact Concierge
        </Link>
        <span>•</span>
        <Link to="/about" className="text-[#BD6024] hover:underline font-semibold">
          About Forma Living
        </Link>
      </div>
    </div>
  )
}
