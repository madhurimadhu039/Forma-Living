import { FormEvent, useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth, formatAuthError } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { useProducts } from '../contexts/ProductContext'

export default function Login() {
  const {
    user,
    isAdmin,
    login,
    register,
    reset,
    logout,
    resendVerificationEmail,
    reloadUser,
    updateUserProfile,
    sendPasswordResetForUser
  } = useAuth()
  const { lines, wishlist } = useCart()
  const { getProductById } = useProducts()
  const nav = useNavigate()
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [msg, setMsg] = useState('')
  const [msgType, setMsgType] = useState<'error' | 'success'>('error')
  const [loading, setLoading] = useState(false)

  // Email verification resend & refresh state
  const [resendLoading, setResendLoading] = useState(false)
  const [resendNotice, setResendNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [checkingVerification, setCheckingVerification] = useState(false)

  // Profile Edit State
  const [isEditingName, setIsEditingName] = useState(false)
  const [profileName, setProfileName] = useState(user?.displayName || '')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileNotice, setProfileNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Password Reset State
  const [resetSending, setResetSending] = useState(false)
  const [resetNotice, setResetNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    if (user?.displayName) {
      setProfileName(user.displayName)
    }
  }, [user?.displayName])

  useEffect(() => {
    if (user && !user.emailVerified) {
      reloadUser().catch(() => {})
    }
  }, [user?.uid])

  async function handleResendVerification() {
    if (resendLoading || checkingVerification) return
    setResendLoading(true)
    setResendNotice(null)
    try {
      await resendVerificationEmail()
      setResendNotice({
        type: 'success',
        message: 'Verification email sent! Please check your inbox and Spam/Junk folder.',
      })
    } catch (err: any) {
      setResendNotice({
        type: 'error',
        message: formatAuthError(err),
      })
    } finally {
      setResendLoading(false)
    }
  }

  async function handleRefreshVerification() {
    if (checkingVerification || resendLoading) return
    setCheckingVerification(true)
    setResendNotice(null)
    try {
      const isVerified = await reloadUser()
      if (isVerified) {
        setResendNotice({
          type: 'success',
          message: 'Your email address is verified!',
        })
      } else {
        setResendNotice({
          type: 'error',
          message: 'Email is still not verified. Please click the link sent to your inbox.',
        })
      }
    } catch {
      setResendNotice({
        type: 'error',
        message: 'Unable to refresh verification status. Please check your connection and try again.',
      })
    } finally {
      setCheckingVerification(false)
    }
  }

  const totalCartCount = lines.reduce((s, l) => s + l.qty, 0)
  const totalWishCount = wishlist.filter(id => Boolean(getProductById(id))).length

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
              {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            {/* Authentication and Verification Status Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                Signed In
              </span>
              {user.emailVerified ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-emerald-600">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Email Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-amber-600">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  Email Not Verified
                </span>
              )}
            </div>

            <h1 className="font-sans font-bold text-xl sm:text-2xl text-[#2B231D]">
              {user.displayName ? `Welcome, ${user.displayName}` : 'Account Overview'}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#82756A] font-medium">
              {user.email}
            </p>

            {/* Unverified Email Warning Card & Resend Trigger */}
            {!user.emailVerified && (
              <div className="mt-4 p-3.5 sm:p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-left text-xs text-[#2B231D]">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5 text-amber-800">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-amber-900 text-xs sm:text-sm">
                      Please verify your email address
                    </p>
                    <p className="mt-0.5 text-[11px] sm:text-xs text-amber-800/90 leading-relaxed">
                      Verify your account to protect your orders. If you haven't received a link, check your spam folder or request a new email below.
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        disabled={resendLoading || checkingVerification}
                        onClick={handleResendVerification}
                        className="px-3 py-1.5 rounded-lg bg-[#BD6024] hover:bg-[#a5511c] disabled:opacity-50 text-white font-semibold text-xs transition shadow-2xs flex items-center gap-1.5"
                      >
                        {resendLoading ? (
                          <>
                            <svg className="animate-spin -ml-0.5 h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                              <line x1="22" y1="2" x2="11" y2="13" />
                              <polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                            <span>Resend Verification Email</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        disabled={resendLoading || checkingVerification}
                        onClick={handleRefreshVerification}
                        className="px-2.5 py-1.5 rounded-lg border border-amber-300 bg-white hover:bg-amber-100/50 disabled:opacity-50 text-amber-900 font-semibold text-xs transition flex items-center gap-1"
                        title="Check if email was verified in another tab"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-3.5 h-3.5 ${checkingVerification ? 'animate-spin' : ''}`}>
                          <polyline points="23 4 23 10 17 10" />
                          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                        </svg>
                        <span>{checkingVerification ? 'Checking...' : 'Check Status'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Resend Notice Feedback */}
                {resendNotice && (
                  <div
                    className={`mt-3 p-2.5 rounded-lg text-xs flex items-start gap-2 ${
                      resendNotice.type === 'success'
                        ? 'bg-emerald-100/90 border border-emerald-300 text-emerald-900'
                        : 'bg-red-100/90 border border-red-300 text-red-900'
                    }`}
                  >
                    <span className="font-bold shrink-0 mt-0.5">
                      {resendNotice.type === 'success' ? '✓' : '⚠️'}
                    </span>
                    <span className="leading-snug">{resendNotice.message}</span>
                  </div>
                )}
              </div>
            )}

            {/* Customer Profile & Security Card */}
            <div className="mt-5 p-4 rounded-2xl bg-[#FAF7F2] border border-[#EFE8DC] text-left">
              <div className="flex items-center justify-between pb-3 border-b border-[#EFE8DC]">
                <div>
                  <h3 className="font-sans font-bold text-sm text-[#2B231D]">Customer Profile</h3>
                  <p className="text-[11px] text-[#82756A]">Manage your display name and credentials</p>
                </div>
                {!isEditingName && (
                  <button
                    type="button"
                    onClick={() => {
                      setProfileName(user.displayName || '')
                      setProfileNotice(null)
                      setIsEditingName(true)
                    }}
                    className="px-2.5 py-1 rounded-lg border border-[#E7DFD5] bg-white hover:bg-[#FCEEE2] hover:border-[#BD6024]/40 text-[#BD6024] font-semibold text-xs transition shadow-2xs flex items-center gap-1"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    <span>Edit Name</span>
                  </button>
                )}
              </div>

              {/* Profile Notice Feedback */}
              {profileNotice && (
                <div
                  className={`mt-3 p-2.5 rounded-xl text-xs flex items-start gap-2 ${
                    profileNotice.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                      : 'bg-red-50 border border-red-200 text-red-900'
                  }`}
                >
                  <span className="font-bold shrink-0 mt-0.5">
                    {profileNotice.type === 'success' ? '✓' : '⚠️'}
                  </span>
                  <span className="leading-snug">{profileNotice.message}</span>
                </div>
              )}

              {isEditingName ? (
                <form
                  onSubmit={async e => {
                    e.preventDefault()
                    const trimmed = profileName.trim()
                    if (trimmed.length < 2 || trimmed.length > 100) {
                      setProfileNotice({
                        type: 'error',
                        message: 'Full Name must be between 2 and 100 characters.',
                      })
                      return
                    }

                    setProfileSaving(true)
                    setProfileNotice(null)

                    try {
                      await updateUserProfile(trimmed)
                      setProfileNotice({
                        type: 'success',
                        message: 'Your profile name has been updated successfully.',
                      })
                      setIsEditingName(false)
                    } catch (err: any) {
                      setProfileNotice({
                        type: 'error',
                        message: err?.message || 'Failed to update profile name. Please try again.',
                      })
                    } finally {
                      setProfileSaving(false)
                    }
                  }}
                  className="mt-3 space-y-3"
                >
                  <div>
                    <label htmlFor="account-full-name" className="block text-xs font-semibold text-[#2B231D] mb-1">
                      Full Name
                    </label>
                    <input
                      id="account-full-name"
                      type="text"
                      required
                      minLength={2}
                      maxLength={100}
                      value={profileName}
                      onChange={e => setProfileName(e.target.value)}
                      placeholder="e.g. Eleanor Vance"
                      disabled={profileSaving}
                      className="w-full px-3 py-2 rounded-xl border border-[#EFE8DC] bg-white text-xs sm:text-sm text-[#2B231D] focus:outline-none focus:border-[#BD6024] focus:ring-1 focus:ring-[#BD6024]"
                    />
                    <div className="flex justify-between text-[11px] text-[#82756A] mt-1">
                      <span>2–100 characters</span>
                      <span>{profileName.trim().length}/100</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={profileSaving}
                      className="px-3.5 py-1.5 rounded-lg bg-[#BD6024] hover:bg-[#a5511c] disabled:opacity-50 text-white font-semibold text-xs transition shadow-2xs flex items-center gap-1.5"
                    >
                      {profileSaving ? (
                        <>
                          <svg className="animate-spin -ml-0.5 h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          <span>Saving…</span>
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                    <button
                      type="button"
                      disabled={profileSaving}
                      onClick={() => {
                        setProfileName(user.displayName || '')
                        setProfileNotice(null)
                        setIsEditingName(false)
                      }}
                      className="px-3 py-1.5 rounded-lg border border-[#E7DFD5] bg-white hover:bg-[#FAF7F2] text-[#6E6359] font-medium text-xs transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-[#82756A]">Full Name</span>
                    <span className="font-semibold text-[#2B231D]">{user.displayName || 'Not set'}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-t border-[#EFE8DC]/60">
                    <span className="text-[#82756A]">Email Address</span>
                    <span className="font-semibold text-[#2B231D] truncate max-w-[180px] sm:max-w-none">{user.email}</span>
                  </div>
                </div>
              )}

              {/* Password Reset Action */}
              <div className="mt-4 pt-3 border-t border-[#EFE8DC]">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-xs text-[#2B231D]">Account Security</p>
                    <p className="text-[11px] text-[#82756A]">Need to change your login credentials?</p>
                  </div>
                  <button
                    type="button"
                    disabled={resetSending}
                    onClick={async () => {
                      setResetSending(true)
                      setResetNotice(null)
                      try {
                        await sendPasswordResetForUser()
                        setResetNotice({
                          type: 'success',
                          message: `Password reset link sent to ${user.email}. Check your inbox or spam folder.`,
                        })
                      } catch (err: any) {
                        setResetNotice({
                          type: 'error',
                          message: err?.message || 'Failed to send password reset email. Please try again later.',
                        })
                      } finally {
                        setResetSending(false)
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg border border-[#E7DFD5] bg-white hover:bg-[#FCEEE2] hover:border-[#BD6024]/40 text-[#2B231D] hover:text-[#BD6024] font-semibold text-xs transition shadow-2xs flex items-center gap-1.5 shrink-0"
                  >
                    {resetSending ? (
                      <>
                        <svg className="animate-spin -ml-0.5 h-3 w-3 text-[#BD6024]" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        <span>Sending…</span>
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-[#BD6024]">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        <span>Reset Password</span>
                      </>
                    )}
                  </button>
                </div>

                {resetNotice && (
                  <div
                    className={`mt-2.5 p-2.5 rounded-xl text-xs flex items-start gap-2 ${
                      resetNotice.type === 'success'
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                        : 'bg-red-50 border border-red-200 text-red-900'
                    }`}
                  >
                    <span className="font-bold shrink-0 mt-0.5">
                      {resetNotice.type === 'success' ? '✓' : '⚠️'}
                    </span>
                    <span className="leading-snug">{resetNotice.message}</span>
                  </div>
                )}
              </div>
            </div>

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
              {isAdmin && (
                <Link
                  to="/admin"
                  className="w-full py-2.5 rounded-xl border border-[#BD6024]/40 bg-[#FCEEE2] hover:bg-[#f7dec8] text-[#BD6024] font-semibold text-xs sm:text-sm transition"
                >
                  Open Admin Dashboard
                </Link>
              )}
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
