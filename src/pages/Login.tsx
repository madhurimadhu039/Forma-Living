import { FormEvent, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'

export default function Login() {
  const { user, login, register, reset, logout } = useAuth()
  const { lines, wishlist } = useCart()
  const nav = useNavigate()
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [msg, setMsg] = useState('')
  const [msgType, setMsgType] = useState<'error' | 'success'>('error')
  const [loading, setLoading] = useState(false)

  const totalCartCount = lines.reduce((s, l) => s + l.qty, 0)
  const totalWishCount = wishlist.length

  async function submit(e: FormEvent) {
    e.preventDefault()
    setMsg('')
    setLoading(true)
    try {
      if (mode === 'in') {
        await login(email, pw)
      } else {
        await register(email, pw, name)
      }
      nav('/')
    } catch (err: any) {
      setMsgType('error')
      setMsg(String(err.code || err.message || 'Authentication error').replace('auth/', '').replace(/-/g, ' '))
    } finally {
      setLoading(false)
    }
  }

  async function handleResetPassword() {
    if (!email.trim()) {
      setMsgType('error')
      setMsg('Please enter your email above to reset your password.')
      return
    }
    setLoading(true)
    setMsg('')
    try {
      await reset(email.trim())
      setMsgType('success')
      setMsg('Password reset link sent! Please check your email inbox.')
    } catch (err: any) {
      setMsgType('error')
      setMsg(String(err.code || err.message || 'Failed to send reset email').replace('auth/', '').replace(/-/g, ' '))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8 sm:py-16">
      {/* Top Left Navigation: Back to Home */}
      <div className="mb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#EFE8DC] text-xs font-semibold text-[#2B231D] hover:bg-[#FCEEE2] hover:text-[#BD6024] hover:border-[#BD6024]/50 shadow-2xs transition group"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-[#BD6024] group-hover:-translate-x-1 transition-transform">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-[#EFE8DC] shadow-sm">
        {user ? (
          /* User Profile & Account Overview (When already logged in) */
          <div className="text-center py-2 sm:py-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FCEEE2] text-[#BD6024] font-bold flex items-center justify-center text-2xl border-2 border-[#BD6024]/20 shadow-xs">
              {user.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold mb-2">
              Signed In
            </span>
            <h1 className="font-sans font-bold text-xl sm:text-2xl text-[#2B231D]">
              Account Overview
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#82756A] font-medium">
              {user.email}
            </p>

            <div className="grid grid-cols-2 gap-3 my-6 text-xs">
              <Link
                to="/cart"
                className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#EFE8DC] hover:border-[#BD6024]/40 hover:bg-[#FCEEE2] transition flex flex-col items-center justify-center gap-1 group"
              >
                <span className="font-bold text-base sm:text-lg text-[#BD6024]">{totalCartCount}</span>
                <span className="font-semibold text-[#2B231D] group-hover:text-[#BD6024]">Shopping Bag</span>
              </Link>
              <Link
                to="/wishlist"
                className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#EFE8DC] hover:border-[#BD6024]/40 hover:bg-[#FCEEE2] transition flex flex-col items-center justify-center gap-1 group"
              >
                <span className="font-bold text-base sm:text-lg text-[#BD6024]">{totalWishCount}</span>
                <span className="font-semibold text-[#2B231D] group-hover:text-[#BD6024]">Saved Wishlist</span>
              </Link>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <Link
                to="/shop"
                className="w-full py-3 rounded-xl bg-[#BD6024] hover:bg-[#a5511c] text-white font-semibold text-xs sm:text-sm transition shadow-sm"
              >
                Continue Shopping
              </Link>
              <button
                onClick={() => logout()}
                className="w-full py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-xs transition"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          /* Sign In & Registration Form */
          <div>
            {/* Header Brand & Heading */}
            <div className="text-center mb-6">
              <Link to="/" className="inline-flex items-center justify-center gap-2 mb-3 group">
                <div className="w-9 h-9 rounded-xl border-2 border-[#2B231D] flex items-center justify-center p-1 group-hover:border-[#BD6024] transition">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-[#2B231D] group-hover:text-[#BD6024] transition">
                    <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" />
                    <path d="M3 11a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5z" />
                    <path d="M6 18v2" />
                    <path d="M18 18v2" />
                    <path d="M4 12v3" />
                    <path d="M20 12v3" />
                  </svg>
                </div>
                <span className="font-sans font-bold text-xl sm:text-2xl text-[#2B231D]">
                  Forma Living
                </span>
              </Link>
              <h1 className="font-sans font-bold text-xl sm:text-2xl text-[#2B231D]">
                {mode === 'in' ? 'Welcome Back' : 'Create an Account'}
              </h1>
              <p className="mt-1 text-xs text-[#82756A]">
                {mode === 'in'
                  ? 'Sign in to access your saved cart, orders, and wishlist.'
                  : 'Join Forma Living to save favorite designer pieces.'}
              </p>
            </div>

            {/* Mode Switch Tabs */}
            <div className="flex rounded-xl bg-[#FAF7F2] p-1 mb-5 border border-[#EFE8DC]">
              <button
                type="button"
                onClick={() => {
                  setMode('in')
                  setMsg('')
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
                  mode === 'in'
                    ? 'bg-white text-[#2B231D] shadow-xs'
                    : 'text-[#82756A] hover:text-[#2B231D]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('up')
                  setMsg('')
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
                  mode === 'up'
                    ? 'bg-white text-[#2B231D] shadow-xs'
                    : 'text-[#82756A] hover:text-[#2B231D]'
                }`}
              >
                Register
              </button>
            </div>

            <form onSubmit={submit} className="space-y-4">
              {mode === 'up' && (
                <div>
                  <label className="block text-xs font-semibold text-[#6E6359] mb-1.5">Full Name</label>
                  <div className="relative">
                    <input
                      className="w-full bg-[#FAF7F2] border border-[#EFE8DC] rounded-xl pl-9 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#BD6024]"
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={name}
                      onChange={e => setName(e.target.value)}
                    />
                    <span className="absolute left-3 top-3 text-[#82756A] text-xs">👤</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#6E6359] mb-1.5">Email Address</label>
                <div className="relative">
                  <input
                    className="w-full bg-[#FAF7F2] border border-[#EFE8DC] rounded-xl pl-9 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#BD6024]"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                  <span className="absolute left-3 top-3 text-[#82756A] text-xs">✉</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[#6E6359]">Password</label>
                  {mode === 'in' && (
                    <button
                      type="button"
                      onClick={handleResetPassword}
                      className="text-[11px] text-[#BD6024] hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    className="w-full bg-[#FAF7F2] border border-[#EFE8DC] rounded-xl pl-9 pr-10 py-2.5 sm:py-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#BD6024]"
                    type={showPw ? 'text' : 'password'}
                    required
                    minLength={8}
                    placeholder="8+ characters"
                    value={pw}
                    onChange={e => setPw(e.target.value)}
                  />
                  <span className="absolute left-3 top-3 text-[#82756A] text-xs">🔒</span>
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-3 text-[11px] text-[#82756A] hover:text-[#2B231D]"
                    tabIndex={-1}
                  >
                    {showPw ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {msg && (
                <div
                  className={`p-3 rounded-xl text-xs text-center capitalize ${
                    msgType === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                  role="alert"
                >
                  {msg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 sm:py-3.5 rounded-xl bg-[#BD6024] hover:bg-[#a5511c] disabled:opacity-50 text-white font-semibold text-xs sm:text-sm shadow-sm transition mt-2"
              >
                {loading ? 'Please wait…' : mode === 'in' ? 'Sign In to Account' : 'Create My Account'}
              </button>

              <div className="pt-4 border-t border-[#EFE8DC] text-center text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === 'in' ? 'up' : 'in')
                    setMsg('')
                  }}
                  className="text-[#82756A] hover:text-[#2B231D] transition"
                >
                  {mode === 'in' ? (
                    <>
                      Don&apos;t have an account yet?{' '}
                      <span className="text-[#BD6024] font-semibold underline">Register here</span>
                    </>
                  ) : (
                    <>
                      Already have an account?{' '}
                      <span className="text-[#BD6024] font-semibold underline">Sign in here</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
