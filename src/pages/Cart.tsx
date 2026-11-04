import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { httpsCallable } from 'firebase/functions'
import { functions } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { products } from '../data/products'
import { formatPrice } from '../utils/format'

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function Cart() {
  const { lines, setQty, clear } = useCart()
  const { user } = useAuth()
  const nav = useNavigate()
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  const rows = lines
    .map(l => ({ l, p: products.find(p => p.id === l.productId)! }))
    .filter(r => Boolean(r.p))

  const subtotal = rows.reduce((s, r) => s + r.p.price * r.l.qty, 0)
  // Free delivery over $300 (or when empty)
  const shipping = subtotal >= 300 || !subtotal ? 0 : 25
  const total = subtotal + shipping

  async function checkout() {
    if (!user) {
      nav('/login')
      return
    }
    setBusy(true)
    setMsg('')
    try {
      const o: any = (await httpsCallable(functions, 'createOrder')({ items: lines })).data
      if (!window.Razorpay) {
        await new Promise<void>((res, rej) => {
          const s = document.createElement('script')
          s.src = 'https://checkout.razorpay.com/v1/checkout.js'
          s.onload = () => res()
          s.onerror = () => rej(new Error('Could not load payment gateway'))
          document.body.appendChild(s)
        })
      }
      new window.Razorpay({
        key: o.keyId,
        amount: o.amount,
        currency: 'USD',
        order_id: o.razorpayOrderId,
        name: 'Forma Living',
        handler: async (r: any) => {
          await httpsCallable(functions, 'verifyPayment')(r)
          clear()
          setMsg('Payment successful! Your order has been placed.')
        },
        modal: { ondismiss: () => setMsg('Payment was cancelled.') }
      }).open()
    } catch (e: any) {
      setMsg(e.message || 'Payment system error. Please configure your Firebase/Razorpay credentials.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
      <div className="flex items-center justify-between pb-6 border-b border-[#EFE8DC]">
        <div>
          <h1 className="font-sans font-bold text-3xl sm:text-4xl text-[#2B231D]">
            Shopping Bag
          </h1>
          <p className="mt-1 text-sm text-[#82756A]">
            {rows.length} {rows.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>
        {rows.length > 0 && (
          <button
            onClick={clear}
            className="text-xs font-semibold text-[#82756A] hover:text-red-700 transition"
          >
            Clear All
          </button>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-[#EFE8DC] mt-8 p-10">
          <div className="w-16 h-16 rounded-full bg-[#FAF7F2] text-[#BD6024] flex items-center justify-center mx-auto mb-4 text-2xl">
            🛒
          </div>
          <h2 className="text-xl font-bold text-[#2B231D]">Your cart is empty</h2>
          <p className="mt-2 text-sm text-[#82756A] max-w-sm mx-auto">
            Discover our stylish and comfortable designs to create your perfect space.
          </p>
          <Link
            to="/shop"
            className="mt-6 inline-flex items-center gap-2 px-8 py-3.5 bg-[#BD6024] hover:bg-[#a5511c] text-white rounded-2xl font-semibold text-sm transition"
          >
            <span>Start Shopping</span>
            <span>→</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          {/* Items List */}
          <div className="lg:col-span-7 space-y-4">
            {rows.map(({ l, p }) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl p-4 border border-[#EFE8DC] flex items-center gap-4 shadow-2xs"
              >
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#FAF7F2] shrink-0 border border-[#EFE8DC]">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 min-w-0">
                  <Link to={`/product/${p.id}`} className="font-semibold text-sm text-[#2B231D] hover:text-[#BD6024] line-clamp-1">
                    {p.name}
                  </Link>
                  <p className="text-xs text-[#82756A] mt-0.5">{p.material} · {p.color}</p>
                  <p className="text-sm font-bold text-[#BD6024] mt-1">{formatPrice(p.price)}</p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2 bg-[#FAF7F2] rounded-xl px-2 py-1 border border-[#EFE8DC]">
                  <button
                    onClick={() => setQty(p.id, l.qty - 1)}
                    className="w-6 h-6 flex items-center justify-center text-sm font-bold text-[#6E6359] hover:text-[#2B231D]"
                  >
                    −
                  </button>
                  <span className="text-xs font-semibold px-1">{l.qty}</span>
                  <button
                    disabled={l.qty >= p.stock}
                    onClick={() => setQty(p.id, l.qty + 1)}
                    className="w-6 h-6 flex items-center justify-center text-sm font-bold text-[#6E6359] hover:text-[#2B231D] disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-6 border border-[#EFE8DC] shadow-sm sticky top-24">
              <h2 className="font-sans font-bold text-lg text-[#2B231D] pb-4 border-b border-[#EFE8DC]">
                Order Summary
              </h2>

              <div className="space-y-3 py-4 text-sm border-b border-[#EFE8DC]">
                <div className="flex justify-between text-[#6E6359]">
                  <span>Subtotal</span>
                  <span className="font-medium text-[#2B231D]">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#6E6359]">
                  <span>Delivery</span>
                  <span className="font-medium text-[#2B231D]">
                    {shipping === 0 ? (
                      <span className="text-emerald-700 font-bold">Free</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-[11px] text-[#BD6024]">
                    Add {formatPrice(300 - subtotal)} more to qualify for Free Delivery!
                  </p>
                )}
              </div>

              <div className="flex justify-between py-4 text-base font-bold text-[#2B231D]">
                <span>Total Amount</span>
                <span className="text-xl text-[#BD6024]">{formatPrice(total)}</span>
              </div>

              <button
                disabled={busy}
                onClick={checkout}
                className="w-full mt-2 py-4 rounded-2xl bg-[#BD6024] hover:bg-[#a5511c] disabled:opacity-50 text-white font-semibold text-base shadow-sm hover:shadow transition"
              >
                {busy ? 'Processing Checkout…' : `Checkout (${formatPrice(total)})`}
              </button>

              {!user && (
                <p className="mt-3 text-center text-xs text-[#82756A]">
                  You can also <Link to="/login" className="text-[#BD6024] font-medium underline">sign in</Link> to save your cart.
                </p>
              )}

              {msg && (
                <div className="mt-4 p-3 rounded-xl bg-[#FCEEE2] border border-[#BD6024]/30 text-xs text-[#BD6024] text-center">
                  {msg}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
