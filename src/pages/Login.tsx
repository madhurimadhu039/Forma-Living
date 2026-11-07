import { FormEvent, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { login, register, reset } = useAuth()
  const nav = useNavigate()
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setMsg('')
    setLoading(true)
    try {
      if (mode === 'in') await login(email, pw)
      else await register(email, pw)
      nav('/')
    } catch (err: any) {
      setMsg(String(err.code || err.message || 'Authentication error').replace('auth/', '').replace(/-/g, ' '))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8 sm:py-16">
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
        <div className="text-center mb-6 sm:mb-8">
          <Link to="/" className="inline-block mb-2 sm:mb-3 font-sans font-bold text-xl sm:text-2xl text-[#2B231D]">
            Forma Living
          </Link>
          <h1 className="font-sans font-bold text-xl sm:text-2xl text-[#2B231D]">
            {mode === 'in' ? 'Welcome back' : 'Create an account'}
          </h1>
          <p className="mt-1 text-xs text-[#82756A]">
            {mode === 'in'
              ? 'Sign in to access your saved cart and orders.'
              : 'Join to save favorite pieces and track purchases.'}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#6E6359] mb-1">Email Address</label>
            <input
              className="w-full bg-[#FAF7F2] border border-[#EFE8DC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#BD6024]"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6E6359] mb-1">Password</label>
            <input
              className="w-full bg-[#FAF7F2] border border-[#EFE8DC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#BD6024]"
              type="password"
              required
              minLength={8}
              placeholder="8+ characters"
              value={pw}
              onChange={e => setPw(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#BD6024] hover:bg-[#a5511c] disabled:opacity-50 text-white font-semibold text-sm shadow-sm transition mt-2"
          >
            {loading ? 'Please wait…' : mode === 'in' ? 'Sign In' : 'Register Account'}
          </button>

          {msg && (
            <p className="p-3 rounded-xl bg-red-50 text-xs text-red-700 text-center capitalize" role="alert">
              {msg}
            </p>
          )}

          <div className="pt-4 border-t border-[#EFE8DC] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'in' ? 'up' : 'in')
                setMsg('')
              }}
              className="text-[#BD6024] font-medium hover:underline"
            >
              {mode === 'in' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>

            {mode === 'in' && (
              <button
                type="button"
                onClick={() => {
                  if (!email) {
                    setMsg('Please enter your email above to reset your password.')
                    return
                  }
                  reset(email)
                    .then(() => setMsg('Password reset email sent! Check your inbox.'))
                    .catch(e => setMsg(e.message))
                }}
                className="text-[#82756A] hover:underline"
              >
                Forgot password?
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
