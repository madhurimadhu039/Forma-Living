import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { httpsCallable } from 'firebase/functions'
import { functions } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { useProducts, Product } from '../contexts/ProductContext'
import { formatPrice } from '../utils/format'

declare global {
  interface Window {
    Razorpay: any
  }
}

export const INDIAN_STATES_AND_UTS = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
] as const

export function normalizeIndianPhoneNumber(rawPhone: string | undefined | null): string | null {
  if (typeof rawPhone !== 'string') return null
  const cleaned = rawPhone.replace(/\s+/g, '')

  let candidate = cleaned
  if (cleaned.startsWith('+91') && cleaned.length === 13) {
    candidate = cleaned.slice(3)
  } else if (cleaned.startsWith('91') && cleaned.length === 12) {
    candidate = cleaned.slice(2)
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    candidate = cleaned.slice(1)
  }

  if (/^[6-9]\d{9}$/.test(candidate)) {
    return candidate
  }
  return null
}

interface AddressForm {
  recipientName: string
  phoneNumber: string
  streetAddress: string
  city: string
  state: string
  pinCode: string
  deliveryInstructions: string
}

interface AddressErrors {
  recipientName?: string
  phoneNumber?: string
  streetAddress?: string
  city?: string
  state?: string
  pinCode?: string
  deliveryInstructions?: string
}

export default function Cart() {
  const { lines, setQty, clear } = useCart()
  const { getProductById, loading } = useProducts()
  const { user } = useAuth()
  const nav = useNavigate()
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  // Controlled shipping address state - strictly in-memory, never persisted to localStorage or users/{uid}
  const [address, setAddress] = useState<AddressForm>({
    recipientName: user?.displayName || '',
    phoneNumber: '',
    streetAddress: '',
    city: '',
    state: '',
    pinCode: '',
    deliveryInstructions: '',
  })
  const [errors, setErrors] = useState<AddressErrors>({})

  useEffect(() => {
    if (user?.displayName && !address.recipientName) {
      setAddress(prev => ({ ...prev, recipientName: user.displayName || '' }))
    }
  }, [user])

  const handleFieldChange = (field: keyof AddressForm, val: string) => {
    setAddress(prev => ({ ...prev, [field]: val }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  // Map lines to products; never silently discard items even if temporarily unlisted
  const rows = lines.map(l => {
    const found = getProductById(l.productId)
    if (found) {
      return { l, p: found, isUnavailable: false }
    }
    return {
      l,
      p: {
        id: l.productId,
        name: 'Catalogue Item',
        category: 'Catalogue',
        style: '',
        color: '',
        material: '',
        price: 0,
        stock: 0,
        width: 0,
        depth: 0,
        height: 0,
        description: 'This item is currently being synchronized with our catalogue.',
        image: '/images/hero-living-room.jpg',
        images: ['/images/hero-living-room.jpg'],
      } as Product,
      isUnavailable: true,
    }
  })

  const subtotal = rows
    .filter(r => !r.isUnavailable)
    .reduce((s, r) => s + r.p.price * r.l.qty, 0)

  // Standardized shipping calculation: Free delivery over ₹5,000 (or when empty)
  const SHIPPING_FREE_THRESHOLD = 5000
  const STANDARD_SHIPPING_FEE = 499
  const shipping = subtotal >= SHIPPING_FREE_THRESHOLD || !subtotal ? 0 : STANDARD_SHIPPING_FEE
  const total = subtotal + shipping

  function validateAddressForm(form: AddressForm): AddressErrors {
    const errs: AddressErrors = {}
    const name = form.recipientName.trim()
    const phone = form.phoneNumber.replace(/\s+/g, '')
    const street = form.streetAddress.trim()
    const city = form.city.trim()
    const state = form.state.trim()
    const pin = form.pinCode.replace(/\s+/g, '')
    const instructions = form.deliveryInstructions.trim()

    if (!name) {
      errs.recipientName = 'Recipient name is required'
    } else if (name.length < 2 || name.length > 60 || !/^[a-zA-Z\s.'-]+$/.test(name)) {
      errs.recipientName = 'Enter a valid name (2-60 alphabetic characters)'
    }

    if (!phone) {
      errs.phoneNumber = 'Mobile number is required'
    } else if (!normalizeIndianPhoneNumber(form.phoneNumber)) {
      errs.phoneNumber = 'Enter a valid 10-digit Indian mobile number (e.g. 9876543210)'
    }

    if (!street) {
      errs.streetAddress = 'Street address is required'
    } else if (street.length < 5 || street.length > 150) {
      errs.streetAddress = 'Address must be between 5 and 150 characters'
    }

    if (!city) {
      errs.city = 'City is required'
    } else if (city.length < 2 || city.length > 50 || !/^[a-zA-Z\s.'-]+$/.test(city)) {
      errs.city = 'Enter a valid city name'
    }

    if (!state) {
      errs.state = 'Please select a state or union territory'
    } else if (!INDIAN_STATES_AND_UTS.includes(state as any)) {
      errs.state = 'Select a valid Indian state or union territory'
    }

    if (!pin) {
      errs.pinCode = 'PIN code is required'
    } else if (!/^[1-9][0-9]{5}$/.test(pin)) {
      errs.pinCode = 'Enter a valid 6-digit Indian PIN code (e.g. 560001)'
    }

    if (instructions.length > 250) {
      errs.deliveryInstructions = 'Delivery instructions cannot exceed 250 characters'
    }

    return errs
  }

  async function checkout() {
    if (!user) {
      nav('/login')
      return
    }

    const hasUnavailable = rows.some(r => r.isUnavailable)
    if (hasUnavailable) {
      setMsg('Please remove temporarily unavailable items from your bag before proceeding to checkout.')
      return
    }

    // Validate shipping address before initiating order
    const validationErrors = validateAddressForm(address)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      setMsg('Please fill in all required shipping address fields before checking out.')
      return
    }
    setErrors({})

    setBusy(true)
    setMsg('')

    const normalizedPhone = normalizeIndianPhoneNumber(address.phoneNumber)
    if (!normalizedPhone) {
      setErrors({ phoneNumber: 'Enter a valid 10-digit Indian mobile number (e.g. 9876543210)' })
      setMsg('Please fill in all required shipping address fields before checking out.')
      setBusy(false)
      return
    }

    const sanitizedAddress = {
      recipientName: address.recipientName.trim(),
      phoneNumber: normalizedPhone,
      streetAddress: address.streetAddress.trim(),
      city: address.city.trim(),
      state: address.state.trim(),
      pinCode: address.pinCode.replace(/\s+/g, ''),
      ...(address.deliveryInstructions.trim() ? { deliveryInstructions: address.deliveryInstructions.trim() } : {}),
    }

    try {
      const o: any = (await httpsCallable(functions, 'createOrder')({
        items: lines,
        shippingAddress: sanitizedAddress,
      })).data

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
        currency: 'INR',
        order_id: o.razorpayOrderId,
        name: 'Forma Living',
        description: 'Handcrafted Furniture & Decor Order',
        prefill: {
          email: user?.email || '',
          name: sanitizedAddress.recipientName,
          contact: sanitizedAddress.phoneNumber,
        },
        theme: {
          color: '#BD6024',
        },
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
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-12">
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

      <div className="flex items-center justify-between pb-4 sm:pb-6 border-b border-[#EFE8DC]">
        <div>
          <h1 className="font-sans font-bold text-2xl sm:text-4xl text-[#2B231D]">
            Shopping Bag
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#82756A]">
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
        <div className="text-center py-12 sm:py-20 bg-white rounded-2xl sm:rounded-3xl border border-[#EFE8DC] mt-6 sm:mt-8 p-6 sm:p-10">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#FAF7F2] text-[#BD6024] flex items-center justify-center mx-auto mb-4 text-2xl">
            🛒
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[#2B231D]">Your cart is empty</h2>
          <p className="mt-2 text-xs sm:text-sm text-[#82756A] max-w-sm mx-auto">
            Discover our stylish and comfortable designs to create your perfect space.
          </p>
          <Link
            to="/shop"
            className="mt-6 inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-[#BD6024] hover:bg-[#a5511c] text-white rounded-xl sm:rounded-2xl font-semibold text-xs sm:text-sm transition"
          >
            <span>Start Shopping</span>
            <span>→</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 mt-6 sm:mt-8">
          {/* Left Column: Items List & Shipping Address Form */}
          <div className="lg:col-span-7 space-y-6">
            {/* Items List */}
            <div className="space-y-3 sm:space-y-4">
              <h2 className="font-sans font-bold text-sm sm:text-base text-[#2B231D] flex items-center gap-2">
                <span>Items in Order</span>
                <span className="text-xs font-semibold text-[#82756A] bg-[#FAF7F2] px-2 py-0.5 rounded-full border border-[#EFE8DC]">
                  {rows.length}
                </span>
              </h2>

              {rows.map(({ l, p, isUnavailable }) => (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl p-3 sm:p-4 border border-[#EFE8DC] flex items-center gap-3 sm:gap-4 shadow-2xs"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-[#FAF7F2] shrink-0 border border-[#EFE8DC]">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 min-w-0">
                    {isUnavailable ? (
                      <>
                        <span className="font-semibold text-xs sm:text-sm text-[#82756A] line-clamp-1">
                          {p.name} ({p.id})
                        </span>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-semibold">
                          {loading ? 'Synchronizing…' : 'Temporarily Unavailable'}
                        </span>
                      </>
                    ) : (
                      <>
                        <Link to={`/product/${p.id}`} className="font-semibold text-xs sm:text-sm text-[#2B231D] hover:text-[#BD6024] line-clamp-1">
                          {p.name}
                        </Link>
                        <p className="text-[11px] sm:text-xs text-[#82756A] mt-0.5 truncate">{p.material} · {p.color}</p>
                        <p className="text-xs sm:text-sm font-bold text-[#BD6024] mt-0.5 sm:mt-1">{formatPrice(p.price)}</p>
                      </>
                    )}
                  </div>

                  {/* Quantity Controls / Remove Button */}
                  {isUnavailable ? (
                    <button
                      onClick={() => setQty(p.id, 0)}
                      className="text-xs text-red-600 hover:text-red-700 font-semibold px-2 py-1 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 transition shrink-0"
                    >
                      Remove
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 sm:gap-2 bg-[#FAF7F2] rounded-xl px-1.5 sm:px-2 py-1 border border-[#EFE8DC] shrink-0">
                      <button
                        onClick={() => setQty(p.id, l.qty - 1)}
                        className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs sm:text-sm font-bold text-[#6E6359] hover:text-[#2B231D]"
                      >
                        −
                      </button>
                      <span className="text-xs font-semibold px-0.5 sm:px-1">{l.qty}</span>
                      <button
                        disabled={l.qty >= p.stock}
                        onClick={() => setQty(p.id, l.qty + 1)}
                        className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs sm:text-sm font-bold text-[#6E6359] hover:text-[#2B231D] disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Responsive Shipping Address Form */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-[#EFE8DC] shadow-sm">
              <div className="flex items-center gap-2.5 pb-4 border-b border-[#EFE8DC]">
                <div className="w-8 h-8 rounded-xl bg-[#FAF7F2] text-[#BD6024] flex items-center justify-center text-sm border border-[#EFE8DC] shrink-0 font-bold">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-sans font-bold text-base sm:text-lg text-[#2B231D]">
                    Shipping &amp; Delivery Address
                  </h2>
                  <p className="text-[11px] sm:text-xs text-[#82756A]">
                    Enter the delivery destination for your furniture order
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 mt-4">
                {/* Recipient Name */}
                <div>
                  <label htmlFor="recipientName" className="block text-xs font-semibold text-[#2B231D] mb-1">
                    Recipient Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="recipientName"
                    type="text"
                    placeholder="e.g. Aditi Sharma"
                    value={address.recipientName}
                    onChange={e => handleFieldChange('recipientName', e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border text-xs sm:text-sm text-[#2B231D] placeholder-[#82756A]/60 focus:outline-none focus:ring-2 transition ${
                      errors.recipientName
                        ? 'border-red-400 bg-red-50/30 focus:ring-red-200 focus:border-red-500'
                        : 'border-[#EFE8DC] focus:ring-[#BD6024]/20 focus:border-[#BD6024]'
                    }`}
                  />
                  {errors.recipientName && (
                    <p className="mt-1 text-[11px] text-red-600 font-medium">{errors.recipientName}</p>
                  )}
                </div>

                {/* Mobile Number */}
                <div>
                  <label htmlFor="phoneNumber" className="block text-xs font-semibold text-[#2B231D] mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs text-[#82756A] font-semibold pointer-events-none">
                      +91
                    </span>
                    <input
                      id="phoneNumber"
                      type="tel"
                      maxLength={10}
                      placeholder="9876543210"
                      value={address.phoneNumber}
                      onChange={e => handleFieldChange('phoneNumber', e.target.value)}
                      className={`w-full pl-12 pr-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border text-xs sm:text-sm text-[#2B231D] placeholder-[#82756A]/60 focus:outline-none focus:ring-2 transition ${
                        errors.phoneNumber
                          ? 'border-red-400 bg-red-50/30 focus:ring-red-200 focus:border-red-500'
                          : 'border-[#EFE8DC] focus:ring-[#BD6024]/20 focus:border-[#BD6024]'
                      }`}
                    />
                  </div>
                  {errors.phoneNumber && (
                    <p className="mt-1 text-[11px] text-red-600 font-medium">{errors.phoneNumber}</p>
                  )}
                </div>

                {/* Street Address */}
                <div className="sm:col-span-2">
                  <label htmlFor="streetAddress" className="block text-xs font-semibold text-[#2B231D] mb-1">
                    House / Flat No., Building, Street &amp; Locality <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="streetAddress"
                    type="text"
                    placeholder="e.g. Flat 402, Oakwood Heights, 14th Main Road, Indiranagar"
                    value={address.streetAddress}
                    onChange={e => handleFieldChange('streetAddress', e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border text-xs sm:text-sm text-[#2B231D] placeholder-[#82756A]/60 focus:outline-none focus:ring-2 transition ${
                      errors.streetAddress
                        ? 'border-red-400 bg-red-50/30 focus:ring-red-200 focus:border-red-500'
                        : 'border-[#EFE8DC] focus:ring-[#BD6024]/20 focus:border-[#BD6024]'
                    }`}
                  />
                  {errors.streetAddress && (
                    <p className="mt-1 text-[11px] text-red-600 font-medium">{errors.streetAddress}</p>
                  )}
                </div>

                {/* City */}
                <div>
                  <label htmlFor="city" className="block text-xs font-semibold text-[#2B231D] mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="city"
                    type="text"
                    placeholder="e.g. Bengaluru"
                    value={address.city}
                    onChange={e => handleFieldChange('city', e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border text-xs sm:text-sm text-[#2B231D] placeholder-[#82756A]/60 focus:outline-none focus:ring-2 transition ${
                      errors.city
                        ? 'border-red-400 bg-red-50/30 focus:ring-red-200 focus:border-red-500'
                        : 'border-[#EFE8DC] focus:ring-[#BD6024]/20 focus:border-[#BD6024]'
                    }`}
                  />
                  {errors.city && (
                    <p className="mt-1 text-[11px] text-red-600 font-medium">{errors.city}</p>
                  )}
                </div>

                {/* State / UT */}
                <div>
                  <label htmlFor="state" className="block text-xs font-semibold text-[#2B231D] mb-1">
                    State / Union Territory <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="state"
                    value={address.state}
                    onChange={e => handleFieldChange('state', e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border text-xs sm:text-sm text-[#2B231D] focus:outline-none focus:ring-2 transition ${
                      errors.state
                        ? 'border-red-400 bg-red-50/30 focus:ring-red-200 focus:border-red-500'
                        : 'border-[#EFE8DC] focus:ring-[#BD6024]/20 focus:border-[#BD6024]'
                    }`}
                  >
                    <option value="">Select State / UT</option>
                    {INDIAN_STATES_AND_UTS.map(st => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                  {errors.state && (
                    <p className="mt-1 text-[11px] text-red-600 font-medium">{errors.state}</p>
                  )}
                </div>

                {/* PIN Code */}
                <div>
                  <label htmlFor="pinCode" className="block text-xs font-semibold text-[#2B231D] mb-1">
                    PIN Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="pinCode"
                    type="text"
                    maxLength={6}
                    placeholder="e.g. 560038"
                    value={address.pinCode}
                    onChange={e => handleFieldChange('pinCode', e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border text-xs sm:text-sm text-[#2B231D] placeholder-[#82756A]/60 focus:outline-none focus:ring-2 transition ${
                      errors.pinCode
                        ? 'border-red-400 bg-red-50/30 focus:ring-red-200 focus:border-red-500'
                        : 'border-[#EFE8DC] focus:ring-[#BD6024]/20 focus:border-[#BD6024]'
                    }`}
                  />
                  {errors.pinCode && (
                    <p className="mt-1 text-[11px] text-red-600 font-medium">{errors.pinCode}</p>
                  )}
                </div>

                {/* Delivery Instructions */}
                <div className="sm:col-span-2">
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="deliveryInstructions" className="block text-xs font-semibold text-[#2B231D]">
                      Delivery Instructions <span className="text-[11px] font-normal text-[#82756A]">(Optional)</span>
                    </label>
                    <span className="text-[10px] text-[#82756A]">
                      {address.deliveryInstructions.length}/250
                    </span>
                  </div>
                  <textarea
                    id="deliveryInstructions"
                    rows={2}
                    maxLength={250}
                    placeholder="e.g. Ring the bell at gate #2, call before arrival, deliver to security if unavailable"
                    value={address.deliveryInstructions}
                    onChange={e => handleFieldChange('deliveryInstructions', e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border text-xs sm:text-sm text-[#2B231D] placeholder-[#82756A]/60 focus:outline-none focus:ring-2 transition ${
                      errors.deliveryInstructions
                        ? 'border-red-400 bg-red-50/30 focus:ring-red-200 focus:border-red-500'
                        : 'border-[#EFE8DC] focus:ring-[#BD6024]/20 focus:border-[#BD6024]'
                    }`}
                  />
                  {errors.deliveryInstructions && (
                    <p className="mt-1 text-[11px] text-red-600 font-medium">{errors.deliveryInstructions}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-[#EFE8DC] shadow-sm sticky top-24">
              <h2 className="font-sans font-bold text-base sm:text-lg text-[#2B231D] pb-3 sm:pb-4 border-b border-[#EFE8DC]">
                Order Summary
              </h2>

              <div className="space-y-2.5 sm:space-y-3 py-3 sm:py-4 text-xs sm:text-sm border-b border-[#EFE8DC]">
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
                    Add {formatPrice(SHIPPING_FREE_THRESHOLD - subtotal)} more to qualify for Free Delivery!
                  </p>
                )}
              </div>

              <div className="flex justify-between py-3 sm:py-4 text-sm sm:text-base font-bold text-[#2B231D]">
                <span>Total Amount</span>
                <span className="text-lg sm:text-xl text-[#BD6024]">{formatPrice(total)}</span>
              </div>

              <button
                disabled={busy}
                onClick={checkout}
                className="w-full mt-2 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-[#BD6024] hover:bg-[#a5511c] disabled:opacity-50 text-white font-semibold text-sm sm:text-base shadow-sm hover:shadow transition"
              >
                {busy ? 'Processing Checkout…' : `Proceed to Payment (${formatPrice(total)})`}
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
