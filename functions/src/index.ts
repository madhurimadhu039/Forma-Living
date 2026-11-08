import { onCall, onRequest, HttpsError } from 'firebase-functions/v2/https'
import { onSchedule } from 'firebase-functions/v2/scheduler'
import { defineSecret } from 'firebase-functions/params'
import { initializeApp } from 'firebase-admin/app'
import { getFirestore, FieldValue, Timestamp, FieldPath } from 'firebase-admin/firestore'
import Razorpay from 'razorpay'
import crypto from 'crypto'

initializeApp()
const db = getFirestore()
const KEY_ID = defineSecret('RAZORPAY_KEY_ID')
const KEY_SECRET = defineSecret('RAZORPAY_KEY_SECRET')
const WEBHOOK_SECRET = defineSecret('RAZORPAY_WEBHOOK_SECRET')
const secrets = [KEY_ID, KEY_SECRET, WEBHOOK_SECRET]

// Standardized shipping calculation constants (in INR)
const SHIPPING_FREE_THRESHOLD = 5000 // Free delivery over ₹5,000
const STANDARD_SHIPPING_FEE = 499   // ₹499 standard delivery fee
const RESERVATION_TTL_MS = 15 * 60 * 1000 // 15-minute temporary inventory reservation
const REFUND_LOCK_TTL_MS = 5 * 60 * 1000 // 5-minute lease for refund processing lock
const WEBHOOK_TIMEOUT_SECONDS = 60 // Configured Cloud Function execution timeout
const WEBHOOK_LEASE_TTL_MS = (WEBHOOK_TIMEOUT_SECONDS + 10) * 1000 // 70-second lease tied to function timeout
const SAFE_EVENT_ID_REGEX = /^[a-zA-Z0-9_-]{1,128}$/ // Whitelist for safe Firestore document path identifiers

export interface ShippingAddressInput {
  recipientName: string
  phoneNumber: string
  streetAddress: string
  city: string
  state: string
  pinCode: string
  deliveryInstructions?: string
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

const ALLOWED_ADDRESS_FIELDS = new Set([
  'recipientName',
  'phoneNumber',
  'streetAddress',
  'city',
  'state',
  'pinCode',
  'deliveryInstructions',
])

export function validateShippingAddress(raw: any): ShippingAddressInput {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new HttpsError('invalid-argument', 'Missing or invalid shipping address')
  }

  // Reject unexpected fields explicitly to prevent property pollution or unvalidated data
  for (const key of Object.keys(raw)) {
    if (!ALLOWED_ADDRESS_FIELDS.has(key)) {
      throw new HttpsError('invalid-argument', `Unexpected field in shipping address: ${key}`)
    }
  }

  const recipientName = typeof raw.recipientName === 'string' ? raw.recipientName.trim() : ''
  const streetAddress = typeof raw.streetAddress === 'string' ? raw.streetAddress.trim() : ''
  const city = typeof raw.city === 'string' ? raw.city.trim() : ''
  const state = typeof raw.state === 'string' ? raw.state.trim() : ''
  const pinCode = typeof raw.pinCode === 'string' ? raw.pinCode.replace(/\s+/g, '') : ''
  const deliveryInstructions = typeof raw.deliveryInstructions === 'string'
    ? raw.deliveryInstructions.trim()
    : ''

  // Recipient name: 2-60 chars, letters, spaces, hyphens, periods, apostrophes
  if (recipientName.length < 2 || recipientName.length > 60 || !/^[a-zA-Z\s.'-]+$/.test(recipientName)) {
    throw new HttpsError('invalid-argument', 'Invalid recipient name (2-60 alphabetic characters required)')
  }

  // Indian mobile number: accepts exactly 10 digits starting with 6-9, optional +91, 91, or leading 0 (11 digits)
  const normalizedPhone = normalizeIndianPhoneNumber(raw.phoneNumber)
  if (!normalizedPhone) {
    throw new HttpsError('invalid-argument', 'Invalid mobile number. Please provide a valid 10-digit Indian mobile number.')
  }

  // Street address: 5-150 chars
  if (streetAddress.length < 5 || streetAddress.length > 150) {
    throw new HttpsError('invalid-argument', 'Invalid street address (5-150 characters required)')
  }

  // City: 2-50 chars
  if (city.length < 2 || city.length > 50 || !/^[a-zA-Z\s.'-]+$/.test(city)) {
    throw new HttpsError('invalid-argument', 'Invalid city name (2-50 alphabetic characters required)')
  }

  // State: Must match one of the Indian States / UTs
  if (!INDIAN_STATES_AND_UTS.includes(state as any)) {
    throw new HttpsError('invalid-argument', 'Invalid state or union territory selected')
  }

  // PIN code: Indian 6-digit postal code, cannot start with 0
  if (!/^[1-9][0-9]{5}$/.test(pinCode)) {
    throw new HttpsError('invalid-argument', 'Invalid 6-digit Indian postal PIN code')
  }

  // Delivery instructions: optional, max 250 chars
  if (deliveryInstructions.length > 250) {
    throw new HttpsError('invalid-argument', 'Delivery instructions must not exceed 250 characters')
  }

  return {
    recipientName,
    phoneNumber: normalizedPhone,
    streetAddress,
    city,
    state,
    pinCode,
    ...(deliveryInstructions ? { deliveryInstructions } : {}),
  }
}

// Timing-safe comparison to prevent side-channel timing attacks
function safeCompareSignatures(expected: string, actual: string | undefined | null): boolean {
  if (typeof actual !== 'string' || typeof expected !== 'string') return false
  const bufExpected = Buffer.from(expected, 'utf8')
  const bufActual = Buffer.from(actual, 'utf8')
  if (bufExpected.length !== bufActual.length) return false
  return crypto.timingSafeEqual(bufExpected, bufActual)
}

// Determines if an error from Razorpay order creation is a definite API rejection
function isDefiniteApiRejection(err: any): boolean {
  const status = err?.statusCode || err?.status || err?.error?.statusCode
  // 4xx errors (except 408 Request Timeout and 429 Rate Limit) indicate deterministic API rejections
  if (typeof status === 'number' && status >= 400 && status < 500 && status !== 408 && status !== 429) {
    return true
  }
  const code = err?.code || err?.error?.code
  if (code === 'BAD_REQUEST_ERROR' || code === 'UNAUTHORIZED_ERROR') {
    return true
  }
  return false
}

interface ValidatedPayment {
  id: string
  order_id: string
  amount: number
  currency: string
  status: string
  amount_refunded: number
}

// Validates the actual Razorpay payment status, amount, currency, and order ID directly with Razorpay
async function validateRazorpayPayment(
  rz: Razorpay,
  paymentId: string,
  expectedOrderId: string,
  expectedAmountPaise: number
): Promise<{ valid: boolean; payment?: ValidatedPayment; reason?: string }> {
  try {
    const p: any = await rz.payments.fetch(paymentId)
    if (!p || typeof p !== 'object') {
      return { valid: false, reason: 'Payment details could not be retrieved from Razorpay API' }
    }
    // Allow both 'captured' and 'refunded' so late payments and reconciliation can proceed safely
    if (p.status !== 'captured' && p.status !== 'refunded') {
      return { valid: false, reason: `Payment status is '${p.status}', expected 'captured' or 'refunded'` }
    }
    if (p.currency !== 'INR') {
      return { valid: false, reason: `Payment currency '${p.currency}' does not match expected 'INR'` }
    }
    if (p.order_id !== expectedOrderId) {
      return { valid: false, reason: `Payment order_id '${p.order_id}' does not match expected '${expectedOrderId}'` }
    }
    if (p.amount !== expectedAmountPaise) {
      return { valid: false, reason: `Payment amount ${p.amount} paise does not match expected ${expectedAmountPaise} paise` }
    }
    return {
      valid: true,
      payment: {
        id: p.id,
        order_id: p.order_id,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        amount_refunded: typeof p.amount_refunded === 'number' ? p.amount_refunded : 0,
      },
    }
  } catch (err: any) {
    return { valid: false, reason: `Error fetching payment from Razorpay: ${err?.message || String(err)}` }
  }
}

// 1. Atomically reserves stock using a Firestore transaction before creating the Razorpay order.
export const createOrder = onCall({ secrets }, async (req) => {
  if (!req.auth) throw new HttpsError('unauthenticated', 'Sign in required')
  const items = req.data?.items as { productId: string; qty: number }[]
  if (!Array.isArray(items) || !items.length) throw new HttpsError('invalid-argument', 'Empty cart')

  // Validate shipping address before reserving inventory or starting the database transaction
  const shippingAddress = validateShippingAddress(req.data?.shippingAddress)

  // Aggregate duplicate item IDs to prevent quantity check bypasses
  const itemMap = new Map<string, number>()
  for (const i of items) {
    if (!i || typeof i.productId !== 'string' || !i.productId.trim()) {
      throw new HttpsError('invalid-argument', 'Invalid product item in cart')
    }
    if (!Number.isInteger(i.qty) || i.qty < 1 || i.qty > 99) {
      throw new HttpsError('invalid-argument', `Invalid quantity for product: ${i.productId}`)
    }
    const current = itemMap.get(i.productId) || 0
    itemMap.set(i.productId, current + i.qty)
  }

  const orderRef = db.collection('orders').doc()
  const expiresAt = new Date(Date.now() + RESERVATION_TTL_MS)

  let subtotal = 0
  const lines: { productId: string; name: string; price: number; qty: number }[] = []

  // Atomic reservation: validate all products and reserve stock inside a single Firestore transaction
  await db.runTransaction(async (tx) => {
    // Phase 1: All reads before any writes
    const productReads: { ref: FirebaseFirestore.DocumentReference; currentStock: number; price: number; name: string; qty: number }[] = []
    for (const [productId, qty] of itemMap.entries()) {
      const pRef = db.doc(`products/${productId}`)
      const pDoc = await tx.get(pRef)
      if (!pDoc.exists) {
        throw new HttpsError('failed-precondition', `Product unavailable: ${productId}`)
      }
      const p = pDoc.data()
      if (!p || typeof p.price !== 'number' || p.price < 0 || typeof p.stock !== 'number' || p.stock < qty) {
        throw new HttpsError('failed-precondition', `Insufficient stock for product: ${productId}`)
      }
      productReads.push({
        ref: pRef,
        currentStock: p.stock,
        price: p.price,
        name: p.name || 'Catalogue Item',
        qty,
      })
    }

    // Phase 2: Compute totals and update stock (reserving it)
    for (const item of productReads) {
      subtotal += item.price * item.qty
      lines.push({ productId: item.ref.id, name: item.name, price: item.price, qty: item.qty })
      tx.update(item.ref, { stock: item.currentStock - item.qty })
    }

    const shipping = subtotal >= SHIPPING_FREE_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE
    const total = subtotal + shipping

    tx.set(orderRef, {
      uid: req.auth!.uid,
      items: lines,
      subtotal,
      shipping,
      total,
      currency: 'INR',
      shippingAddress,
      status: 'pending_payment',
      reservationStatus: 'reserved',
      reservationExpiresAt: Timestamp.fromDate(expiresAt),
      receipt: orderRef.id,
      createdAt: FieldValue.serverTimestamp(),
    })
  })

  const shipping = subtotal >= SHIPPING_FREE_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE
  const total = subtotal + shipping

  // Create Razorpay Order
  let rzOrder: any
  try {
    const rz = new Razorpay({ key_id: KEY_ID.value(), key_secret: KEY_SECRET.value() })
    rzOrder = await rz.orders.create({
      amount: total * 100,
      currency: 'INR',
      receipt: orderRef.id,
    })
  } catch (rzErr: any) {
    const isDefinite = isDefiniteApiRejection(rzErr)
    const rz = new Razorpay({ key_id: KEY_ID.value(), key_secret: KEY_SECRET.value() })

    if (isDefinite) {
      // Definite API rejection: Razorpay definitely did not create an order.
      // Safely release the reserved stock immediately.
      console.warn('Razorpay order creation rejected by gateway:', rzErr?.message)
      await db.runTransaction(async (tx) => {
        for (const l of lines) {
          tx.update(db.doc(`products/${l.productId}`), {
            stock: FieldValue.increment(l.qty),
          })
        }
        tx.update(orderRef, {
          status: 'cancelled',
          reservationStatus: 'released',
          cancellationReason: 'razorpay_order_rejected',
          updatedAt: FieldValue.serverTimestamp(),
        })
      }).catch(rollbackErr => {
        console.error('Failed to rollback reservation after rejection:', rollbackErr)
      })
      throw new HttpsError('invalid-argument', 'Unable to initiate order with payment gateway.')
    } else {
      // Uncertain network outcome (timeout, connection reset, 5xx):
      // Attempt immediate reconciliation by querying Razorpay orders by receipt.
      console.warn('Uncertain network outcome during Razorpay order creation. Reconciling by receipt:', rzErr?.message)
      let reconciled: any = null
      try {
        const orderList: any = await rz.orders.all({
          receipt: orderRef.id,
          count: 1,
        })
        if (orderList && Array.isArray(orderList.items) && orderList.items.length > 0) {
          reconciled = orderList.items[0]
        }
      } catch (fetchErr: any) {
        console.warn('Could not query orders by receipt during reconciliation:', fetchErr?.message)
      }

      if (reconciled && reconciled.id) {
        rzOrder = reconciled
      } else {
        // Still uncertain: DO NOT cancel or release stock while an order may be payable.
        // Keep reservationStatus: 'reserved' so the 15-minute TTL holds inventory safely.
        await orderRef.update({
          status: 'order_creation_uncertain',
          receipt: orderRef.id,
          orderCreationError: rzErr?.message || String(rzErr),
          updatedAt: FieldValue.serverTimestamp(),
        })
        await db.collection('admin_alerts').add({
          type: 'order_creation_uncertain',
          orderId: orderRef.id,
          receipt: orderRef.id,
          uid: req.auth!.uid,
          amount: total,
          reason: 'Network error during order creation; stock held until 15-minute expiry or webhook reconciliation',
          error: rzErr?.message || String(rzErr),
          resolved: false,
          createdAt: FieldValue.serverTimestamp(),
        }).catch(() => {})
        throw new HttpsError('unavailable', 'Network timeout while connecting to payment gateway. Please check your orders or try again.')
      }
    }
  }

  // Record the confirmed Razorpay Order ID on the order document
  await orderRef.update({
    razorpayOrderId: rzOrder.id,
    receipt: orderRef.id,
    updatedAt: FieldValue.serverTimestamp(),
  })

  return { orderId: orderRef.id, razorpayOrderId: rzOrder.id, amount: total * 100, keyId: KEY_ID.value() }
})

interface RefundResponse {
  ok: boolean
  status: number
  data?: any
  isTimeout?: boolean
  isConflict?: boolean
  error?: string
}

// Executes an idempotent refund via direct authenticated HTTP request passing the documented X-Refund-Idempotency header.
// This bypasses SDK limitations where custom headers are filtered by internal allowedHeaders,
// and ensures network timeouts and 409 conflicts are safely handled without throwing uncaught type errors.
export async function executeIdempotentRefund(
  keyId: string,
  keySecret: string,
  paymentId: string,
  payload: { amount: number; receipt?: string; notes?: Record<string, string> },
  idempotencyKey: string,
  customFetch: typeof fetch = fetch
): Promise<RefundResponse> {
  const url = `https://api.razorpay.com/v1/payments/${paymentId}/refund`
  const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString('base64')

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 20000) // 20s timeout

  try {
    const res = await customFetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/json',
        'X-Refund-Idempotency': idempotencyKey,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    const responseData = await res.json().catch(() => null)

    if (res.ok) {
      return { ok: true, status: res.status, data: responseData }
    }

    if (res.status === 409) {
      return {
        ok: false,
        status: 409,
        isConflict: true,
        data: responseData,
        error: 'Idempotency conflict / refund request in progress (HTTP 409)',
      }
    }

    const errDesc = responseData?.error?.description || responseData?.error?.message || `HTTP ${res.status}`
    return { ok: false, status: res.status, data: responseData, error: errDesc }
  } catch (err: any) {
    clearTimeout(timeoutId)
    const isTimeout =
      err.name === 'AbortError' ||
      err.code === 'ECONNABORTED' ||
      err.code === 'ETIMEDOUT' ||
      err.message?.toLowerCase().includes('timeout') ||
      err.message?.toLowerCase().includes('abort')

    return {
      ok: false,
      status: 0,
      isTimeout,
      error: err.message || String(err),
    }
  }
}

// Handles fulfilling the order or initiating/reconciling a refund if payment arrived after reservation expired.
async function markPaid(razorpayOrderId: string, paymentId: string, expectedUid?: string) {
  let q = await db.collection('orders').where('razorpayOrderId', '==', razorpayOrderId).limit(1).get()

  // Fallback reconciliation by order receipt if razorpayOrderId was not set (e.g. uncertain creation outcome)
  if (q.empty) {
    try {
      const rz = new Razorpay({ key_id: KEY_ID.value(), key_secret: KEY_SECRET.value() })
      const rzOrderDoc: any = await rz.orders.fetch(razorpayOrderId)
      if (rzOrderDoc && rzOrderDoc.receipt) {
        const receiptDoc = await db.doc(`orders/${rzOrderDoc.receipt}`).get()
        if (receiptDoc.exists) {
          await receiptDoc.ref.update({
            razorpayOrderId,
            updatedAt: FieldValue.serverTimestamp(),
          })
          q = await db.collection('orders').where('razorpayOrderId', '==', razorpayOrderId).limit(1).get()
        }
      }
    } catch (reconErr: any) {
      console.warn('Could not reconcile order by receipt:', reconErr?.message)
    }
  }

  if (q.empty) return
  const ref = q.docs[0].ref
  const initialOrderData = q.docs[0].data()

  // Validate actual Razorpay payment status, amount, and currency directly with Razorpay
  const rz = new Razorpay({ key_id: KEY_ID.value(), key_secret: KEY_SECRET.value() })
  const expectedAmountPaise = (initialOrderData.total || 0) * 100
  const validation = await validateRazorpayPayment(rz, paymentId, razorpayOrderId, expectedAmountPaise)

  if (!validation.valid) {
    console.error(`Payment validation failed for order ${ref.id}:`, validation.reason)
    await db.collection('admin_alerts').add({
      type: 'payment_validation_failed',
      orderId: ref.id,
      paymentId,
      razorpayOrderId,
      uid: initialOrderData.uid,
      reason: validation.reason,
      resolved: false,
      createdAt: FieldValue.serverTimestamp(),
    }).catch(() => {})
    throw new HttpsError('failed-precondition', `Payment validation rejected: ${validation.reason}`)
  }

  let needsRefund = false
  let orderDataForRefund: any = null

  await db.runTransaction(async (tx) => {
    const o = await tx.get(ref)
    if (!o.exists) return
    const orderData = o.data()!

    // Idempotency: if already processed as paid, fully refunded, or requiring manual review, exit safely
    if (
      orderData.status === 'paid' ||
      orderData.status === 'refunded' ||
      orderData.refundStatus === 'completed' ||
      orderData.refundStatus === 'manual_review_required'
    ) {
      return
    }

    // Verify order ownership if expectedUid is provided (e.g. from client verifyPayment)
    if (expectedUid && orderData.uid !== expectedUid) {
      throw new HttpsError('permission-denied', 'Unauthorized order access')
    }

    // Check if reservation expired or was already released back to inventory
    const nowMillis = Date.now()
    const expiresAtMillis = orderData.reservationExpiresAt?.toMillis ? orderData.reservationExpiresAt.toMillis() : 0
    const isExpired = orderData.status === 'expired' ||
      orderData.status === 'payment_received_after_expiry' ||
      orderData.reservationStatus === 'released' ||
      orderData.reservationStatus === 'expired' ||
      (expiresAtMillis > 0 && expiresAtMillis < nowMillis && orderData.reservationStatus !== 'consumed')

    if (isExpired) {
      // Recoverable refund locking with 5-minute lease:
      const claimedAtMillis = orderData.refundClaimedAt?.toMillis ? orderData.refundClaimedAt.toMillis() : 0
      const isLockHeld = orderData.refundStatus === 'processing' ||
        orderData.refundStatus === 'reconciliation_required' ||
        orderData.refundStatus === 'pending' ||
        orderData.refundStatus === 'partial_refund_pending'
      const isLockStale = claimedAtMillis <= 0 || (nowMillis - claimedAtMillis > REFUND_LOCK_TTL_MS)

      // A fresh lock (< 5 mins ago) must block concurrent attempts
      if (isLockHeld && !isLockStale) {
        return
      }

      needsRefund = true
      orderDataForRefund = orderData

      // Generate or establish stable idempotency key persisted in Firestore BEFORE sending the refund request
      const refundIdempotencyKey = orderData.refundIdempotencyKey || `rfnd_idemp_${ref.id}`

      tx.update(ref, {
        status: 'payment_received_after_expiry',
        reservationStatus: 'expired',
        refundStatus: 'processing', // Atomic claim or stale lock recovery
        refundIdempotencyKey,       // Persisted in Firestore BEFORE refund request
        refundClaimedAt: FieldValue.serverTimestamp(),
        paymentId,
        updatedAt: FieldValue.serverTimestamp(),
      })

      tx.set(db.doc(`payments/${paymentId}`), {
        uid: orderData.uid,
        orderId: ref.id,
        razorpayOrderId,
        currency: orderData.currency || 'INR',
        amount: expectedAmountPaise,
        status: 'needs_refund',
        createdAt: FieldValue.serverTimestamp(),
      }, { merge: true })
      return
    }

    // Normal fulfillment path:
    // If payment was already refunded in Razorpay, NEVER mark as paid!
    if (validation.payment?.status === 'refunded') {
      throw new HttpsError('failed-precondition', 'Payment was already refunded and cannot fulfill order.')
    }

    // Stock was already decremented during reservation in createOrder,
    // so we transition reservation to 'consumed' and do NOT decrement stock again.
    tx.update(ref, {
      status: 'paid',
      reservationStatus: 'consumed',
      paymentId,
      updatedAt: FieldValue.serverTimestamp(),
    })

    tx.set(db.doc(`payments/${paymentId}`), {
      uid: orderData.uid,
      orderId: ref.id,
      razorpayOrderId,
      currency: orderData.currency || 'INR',
      amount: expectedAmountPaise,
      status: 'captured',
      createdAt: FieldValue.serverTimestamp(),
    })
  })

  // Recovery process: if payment was received after reservation expired, execute or reconcile refund
  if (needsRefund && orderDataForRefund) {
    const idempotencyKey = orderDataForRefund.refundIdempotencyKey || `rfnd_idemp_${ref.id}`

    // Step A: Inspect current payment and refund state from Razorpay API before issuing any refund
    let pCheck: any = null
    let refundsList: any = null
    try {
      const [paymentRes, refundsRes] = await Promise.all([
        rz.payments.fetch(paymentId),
        rz.payments.fetchMultipleRefund(paymentId).catch((listErr: any) => {
          console.warn('Could not fetch multiple refunds for payment:', paymentId, listErr?.message)
          return null
        }),
      ])
      pCheck = paymentRes
      refundsList = refundsRes
    } catch (checkErr: any) {
      console.error('Could not fetch payment to determine refund state:', checkErr?.message)
      await db.collection('admin_alerts').add({
        type: 'refund_state_check_failed',
        orderId: ref.id,
        paymentId,
        razorpayOrderId,
        uid: orderDataForRefund.uid,
        amount: orderDataForRefund.total,
        refundIdempotencyKey: idempotencyKey,
        reason: 'Unable to determine payment refund state from Razorpay API. Refund withheld pending manual review.',
        error: checkErr?.message || String(checkErr),
        resolved: false,
        createdAt: FieldValue.serverTimestamp(),
      }).catch(() => {})
      await ref.update({
        refundStatus: 'reconciliation_required',
        lastRefundError: 'Unable to query payment refund state from payment gateway',
        updatedAt: FieldValue.serverTimestamp(),
      })
      return
    }

    // Tally existing refund records from rz.payments.fetchMultipleRefund and payment entity
    const refundItems: any[] = Array.isArray(refundsList?.items) ? refundsList.items : []
    let processedAmountPaise = 0
    let pendingAmountPaise = 0
    let processedRefundId: string | null = null
    let pendingRefundId: string | null = null

    for (const item of refundItems) {
      if (item.status === 'processed') {
        processedAmountPaise += typeof item.amount === 'number' ? item.amount : 0
        if (!processedRefundId) processedRefundId = item.id
      } else if (item.status === 'pending') {
        pendingAmountPaise += typeof item.amount === 'number' ? item.amount : 0
        if (!pendingRefundId) pendingRefundId = item.id
      }
    }

    const amountRefundedOnPayment = typeof pCheck?.amount_refunded === 'number' ? pCheck.amount_refunded : 0
    const totalProcessedPaise = Math.max(
      processedAmountPaise,
      pCheck?.status === 'refunded' ? expectedAmountPaise : amountRefundedOnPayment
    )

    // Case 1: Already fully refunded (reconciles crash after refund or dashboard refund)
    if (totalProcessedPaise === expectedAmountPaise) {
      await ref.update({
        status: 'refunded',
        refundStatus: 'completed',
        refundId: processedRefundId || FieldValue.delete(),
        refundedAmountPaise: totalProcessedPaise,
        updatedAt: FieldValue.serverTimestamp(),
      })
      await db.doc(`payments/${paymentId}`).update({
        status: 'refunded',
        refundId: processedRefundId || FieldValue.delete(),
        amountRefundedPaise: totalProcessedPaise,
        updatedAt: FieldValue.serverTimestamp(),
      })
      return
    }

    // Case 1B: Excessive refund detected (more refunded than order total)
    if (totalProcessedPaise > expectedAmountPaise) {
      console.error(`Excessive refund detected for order ${ref.id}: refunded ${totalProcessedPaise} of ${expectedAmountPaise} paise`)
      await db.collection('admin_alerts').add({
        type: 'excessive_refund_detected',
        orderId: ref.id,
        paymentId,
        razorpayOrderId,
        uid: orderDataForRefund.uid,
        totalAmountPaise: expectedAmountPaise,
        amountRefundedPaise: totalProcessedPaise,
        refundIdempotencyKey: idempotencyKey,
        reason: `Excessive refund detected: ${totalProcessedPaise} paise exceeds expected order total of ${expectedAmountPaise} paise.`,
        resolved: false,
        createdAt: FieldValue.serverTimestamp(),
      }).catch(() => {})
      await ref.update({
        refundStatus: 'manual_review_required',
        refundedAmountPaise: totalProcessedPaise,
        lastRefundError: `Excessive refund of ${totalProcessedPaise} paise exceeds order total ${expectedAmountPaise} paise`,
        updatedAt: FieldValue.serverTimestamp(),
      })
      await db.doc(`payments/${paymentId}`).update({
        status: 'manual_review_required',
        amountRefundedPaise: totalProcessedPaise,
        updatedAt: FieldValue.serverTimestamp(),
      })
      return
    }

    // Case 2: Partial refund exists - do NOT lock into terminal error; transition to partial_refund_pending
    if (totalProcessedPaise > 0 && totalProcessedPaise < expectedAmountPaise) {
      console.warn(`Partial refund detected for order ${ref.id}: refunded ${totalProcessedPaise} of ${expectedAmountPaise} paise`)
      await ref.update({
        refundStatus: 'partial_refund_pending',
        refundedAmountPaise: totalProcessedPaise,
        lastRefundError: `Partial refund of ${totalProcessedPaise} paise processed; awaiting remaining balance`,
        updatedAt: FieldValue.serverTimestamp(),
      })
      await db.doc(`payments/${paymentId}`).update({
        status: 'partial_refund_pending',
        refundId: processedRefundId || FieldValue.delete(),
        amountRefundedPaise: totalProcessedPaise,
        updatedAt: FieldValue.serverTimestamp(),
      })
      return
    }

    // Case 3: Refund is currently pending at the gateway - keep pending in Firestore, do not mark completed or issue duplicate
    if (pendingAmountPaise > 0) {
      console.warn(`Refund for order ${ref.id} is pending at payment gateway (${pendingAmountPaise} paise)`)
      await ref.update({
        refundStatus: 'pending',
        refundId: pendingRefundId || FieldValue.delete(),
        lastRefundError: 'Refund is currently pending processing at payment gateway',
        updatedAt: FieldValue.serverTimestamp(),
      })
      await db.doc(`payments/${paymentId}`).update({
        status: 'refund_pending',
        refundId: pendingRefundId || FieldValue.delete(),
        updatedAt: FieldValue.serverTimestamp(),
      })
      return
    }

    // Case 4: No existing completed or pending refund. Issue full refund with X-Refund-Idempotency header and stable receipt.
    const refundReceipt = `rfnd_${ref.id.slice(0, 30)}`
    const refundPayload = {
      amount: expectedAmountPaise,
      receipt: refundReceipt,
      notes: {
        reason: 'Reservation expired before payment completion',
        orderId: ref.id,
      },
    }

    const refundRes = await executeIdempotentRefund(
      KEY_ID.value(),
      KEY_SECRET.value(),
      paymentId,
      refundPayload,
      idempotencyKey
    )

    if (refundRes.ok) {
      const entity = refundRes.data
      if (entity?.status === 'processed') {
        // Verify payment ID and exact amount
        if (entity.payment_id === paymentId && entity.amount === expectedAmountPaise) {
          await ref.update({
            status: 'refunded',
            refundStatus: 'completed',
            refundId: entity.id,
            refundedAmountPaise: expectedAmountPaise,
            updatedAt: FieldValue.serverTimestamp(),
          })
          await db.doc(`payments/${paymentId}`).update({
            status: 'refunded',
            refundId: entity.id,
            amountRefundedPaise: expectedAmountPaise,
            updatedAt: FieldValue.serverTimestamp(),
          })
        } else {
          console.error(`Refund entity verification mismatch for order ${ref.id}:`, entity)
          await ref.update({
            refundStatus: 'manual_review_required',
            refundId: entity?.id,
            lastRefundError: `Gateway refund entity mismatch: amount ${entity?.amount}, payment ${entity?.payment_id}`,
            updatedAt: FieldValue.serverTimestamp(),
          })
        }
      } else if (entity?.status === 'pending') {
        // Gateway accepted refund, currently pending settlement
        await ref.update({
          refundStatus: 'pending',
          refundId: entity.id,
          lastRefundError: 'Refund created and pending processing at payment gateway',
          updatedAt: FieldValue.serverTimestamp(),
        })
        await db.doc(`payments/${paymentId}`).update({
          status: 'refund_pending',
          refundId: entity.id,
          updatedAt: FieldValue.serverTimestamp(),
        })
      } else if (entity?.status === 'failed') {
        // Record failure, allow safe retry using the same idempotency key
        await ref.update({
          refundStatus: 'failed',
          refundId: entity.id,
          lastRefundError: 'Gateway reported refund failed upon creation',
          updatedAt: FieldValue.serverTimestamp(),
        })
      } else {
        // Fallback for processed without status field
        await ref.update({
          status: 'refunded',
          refundStatus: 'completed',
          refundId: entity?.id,
          refundedAmountPaise: expectedAmountPaise,
          updatedAt: FieldValue.serverTimestamp(),
        })
        await db.doc(`payments/${paymentId}`).update({
          status: 'refunded',
          refundId: entity?.id,
          amountRefundedPaise: expectedAmountPaise,
          updatedAt: FieldValue.serverTimestamp(),
        })
      }
    } else if (refundRes.isConflict) {
      // HTTP 409 Conflict: Refund request with this idempotency key is actively being processed by Razorpay
      console.warn(`Refund request conflict (HTTP 409) for order ${ref.id}. Retrying reconciliation with same key.`)
      await ref.update({
        refundStatus: 'reconciliation_required',
        lastRefundError: 'Payment gateway reported refund request in-progress (HTTP 409 Conflict)',
        updatedAt: FieldValue.serverTimestamp(),
      })
    } else if (refundRes.isTimeout) {
      // Ambiguous network timeout: preserve idempotency key and set reconciliation_required
      console.warn(`Ambiguous network timeout during refund request for order ${ref.id}.`)
      await db.collection('admin_alerts').add({
        type: 'refund_timeout_reconciliation_required',
        orderId: ref.id,
        paymentId,
        razorpayOrderId,
        uid: orderDataForRefund.uid,
        amount: orderDataForRefund.total,
        refundIdempotencyKey: idempotencyKey,
        reason: 'Network timeout during refund request. Idempotency key preserved; reconciliation required before any new disbursement.',
        error: refundRes.error,
        resolved: false,
        createdAt: FieldValue.serverTimestamp(),
      }).catch(() => {})
      await ref.update({
        refundStatus: 'reconciliation_required',
        lastRefundError: `Network timeout during refund: ${refundRes.error}`,
        updatedAt: FieldValue.serverTimestamp(),
      })
    } else {
      const errMsg = refundRes.error || 'Refund request failed'
      if (errMsg.toLowerCase().includes('already been fully refunded') || errMsg.toLowerCase().includes('already refunded')) {
        await ref.update({
          status: 'refunded',
          refundStatus: 'completed',
          updatedAt: FieldValue.serverTimestamp(),
        })
        await db.doc(`payments/${paymentId}`).update({
          status: 'refunded',
          updatedAt: FieldValue.serverTimestamp(),
        })
      } else {
        console.error('Automatic refund failed for late payment:', paymentId, errMsg)
        await db.collection('admin_alerts').add({
          type: 'refund_execution_failed',
          orderId: ref.id,
          paymentId,
          razorpayOrderId,
          uid: orderDataForRefund.uid,
          amount: orderDataForRefund.total,
          refundIdempotencyKey: idempotencyKey,
          reason: 'Payment captured after reservation expired, but automated refund request failed',
          error: errMsg,
          resolved: false,
          createdAt: FieldValue.serverTimestamp(),
        }).catch(() => {})
        await ref.update({
          refundStatus: 'failed',
          lastRefundError: errMsg,
          updatedAt: FieldValue.serverTimestamp(),
        })
      }
    }
  }
}

// 2. Scheduled task to identify expired unpaid reservations and release stock safely and idempotently.
export const releaseExpiredReservations = onSchedule('every 5 minutes', async () => {
  const q = await db.collection('orders')
    .where('reservationStatus', '==', 'reserved')
    .limit(100)
    .get()

  const nowMillis = Date.now()
  for (const doc of q.docs) {
    const data = doc.data()
    // Process pending or uncertain reservations that have passed their TTL
    if (data.status !== 'pending_payment' && data.status !== 'order_creation_uncertain') continue
    const expiresAtMillis = data.reservationExpiresAt?.toMillis ? data.reservationExpiresAt.toMillis() : 0
    if (expiresAtMillis > 0 && expiresAtMillis <= nowMillis) {
      let missingProducts: string[] = []

      await db.runTransaction(async (tx) => {
        const o = await tx.get(doc.ref)
        if (!o.exists) return
        const orderData = o.data()!

        // Never release stock belonging to a successfully paid order
        if (orderData.status === 'paid' || orderData.reservationStatus !== 'reserved') {
          return
        }

        // Phase 1: All reads before any writes
        const productReads: { ref: FirebaseFirestore.DocumentReference; productId: string; exists: boolean; currentStock: number; qty: number }[] = []
        for (const item of orderData.items || []) {
          const pRef = db.doc(`products/${item.productId}`)
          const pDoc = await tx.get(pRef)
          if (pDoc.exists) {
            const stock = typeof pDoc.data()?.stock === 'number' ? pDoc.data()!.stock : 0
            productReads.push({ ref: pRef, productId: item.productId, exists: true, currentStock: stock, qty: item.qty })
          } else {
            productReads.push({ ref: pRef, productId: item.productId, exists: false, currentStock: 0, qty: item.qty })
          }
        }

        // Phase 2: Perform all writes
        const missing: string[] = []
        for (const p of productReads) {
          if (p.exists) {
            tx.update(p.ref, { stock: FieldValue.increment(p.qty) })
          } else {
            missing.push(p.productId)
          }
        }

        missingProducts = missing

        // Transition order status to 'expired' and release reservation
        tx.update(doc.ref, {
          status: 'expired',
          reservationStatus: 'released',
          missingProductRestorations: missing.length > 0 ? missing : FieldValue.delete(),
          releasedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        })
      }).catch(err => {
        console.error(`Error releasing expired reservation for order ${doc.id}:`, err)
      })

      // If any product document was deleted, alert admins without leaving the order permanently reserved
      if (missingProducts.length > 0) {
        await db.collection('admin_alerts').add({
          type: 'inventory_restoration_warning',
          orderId: doc.id,
          missingProductIds: missingProducts,
          reason: 'Some products could not be restored to inventory during expired reservation cleanup because their product documents were deleted from Firestore.',
          resolved: false,
          createdAt: FieldValue.serverTimestamp(),
        }).catch(() => {})
      }
    }
  }
})

// 3. Scheduled task to reconcile orders with refundStatus = 'pending', 'reconciliation_required', or 'partial_refund_pending'.
// Uses fair cursor rotation over FieldPath.documentId() to ensure orders beyond 50 are never starved.
// Strictly inspects gateway state via fetchMultipleRefund; never issues new refunds.
export const reconcileRefunds = onSchedule({ schedule: 'every 10 minutes', secrets }, async () => {
  const cursorDocRef = db.doc('admin_meta/refund_reconciliation_cursor')
  const cursorDoc = await cursorDocRef.get().catch(() => null)
  const cursorData: Record<string, string> = cursorDoc?.data()?.lastDocIdByStatus || {}

  const statusesToReconcile = ['pending', 'reconciliation_required', 'partial_refund_pending'] as const
  const eligibleDocs: FirebaseFirestore.QueryDocumentSnapshot[] = []

  for (const status of statusesToReconcile) {
    const cursorId = cursorData[status]
    let q = db.collection('orders')
      .where('refundStatus', '==', status)
      .orderBy(FieldPath.documentId())

    if (cursorId && typeof cursorId === 'string') {
      q = q.startAfter(cursorId)
    }

    let snap = await q.limit(25).get()

    // If no more docs after cursor, wrap around to the beginning for fair rotation
    if (snap.empty && cursorId) {
      snap = await db.collection('orders')
        .where('refundStatus', '==', status)
        .orderBy(FieldPath.documentId())
        .limit(25)
        .get()
    }

    if (!snap.empty) {
      cursorData[status] = snap.docs[snap.docs.length - 1].id
      for (const d of snap.docs) {
        eligibleDocs.push(d)
      }
    } else {
      delete cursorData[status]
    }
  }

  // Persist updated cursor safely
  await cursorDocRef.set({
    lastDocIdByStatus: cursorData,
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true }).catch(() => {})

  if (eligibleDocs.length === 0) return

  const rz = new Razorpay({ key_id: KEY_ID.value(), key_secret: KEY_SECRET.value() })

  for (const doc of eligibleDocs) {
    const orderData = doc.data()
    const paymentId = orderData.paymentId
    if (!paymentId || typeof paymentId !== 'string') continue

    const expectedAmountPaise = (orderData.total || 0) * 100

    try {
      const [paymentRes, refundsRes] = await Promise.all([
        rz.payments.fetch(paymentId).catch((err: any) => {
          console.warn(`reconcileRefunds: Could not fetch payment ${paymentId}:`, err?.message)
          return null
        }),
        rz.payments.fetchMultipleRefund(paymentId).catch((err: any) => {
          console.warn(`reconcileRefunds: Could not fetch multiple refunds for ${paymentId}:`, err?.message)
          return null
        }),
      ])

      const refundItems: any[] = Array.isArray(refundsRes?.items) ? refundsRes.items : []
      let processedAmountPaise = 0
      let pendingAmountPaise = 0
      let failedRefundsCount = 0
      let processedRefundId: string | null = null
      let pendingRefundId: string | null = null
      let failedRefundId: string | null = null

      for (const item of refundItems) {
        if (item.payment_id === paymentId && item.currency === 'INR') {
          const itemAmt = typeof item.amount === 'number' ? item.amount : 0
          if (item.status === 'processed') {
            processedAmountPaise += itemAmt
            if (!processedRefundId) processedRefundId = item.id
          } else if (item.status === 'pending') {
            pendingAmountPaise += itemAmt
            if (!pendingRefundId) pendingRefundId = item.id
          } else if (item.status === 'failed') {
            failedRefundsCount++
            if (!failedRefundId) failedRefundId = item.id
          }
        }
      }

      const amountRefundedOnPayment = typeof paymentRes?.amount_refunded === 'number' ? paymentRes.amount_refunded : 0
      const totalProcessedPaise = Math.max(
        processedAmountPaise,
        paymentRes?.status === 'refunded' ? expectedAmountPaise : amountRefundedOnPayment
      )

      let alertType: string | null = null
      let alertReason: string | null = null

      await db.runTransaction(async (tx) => {
        const o = await tx.get(doc.ref)
        if (!o.exists) return
        const currentOrder = o.data()!

        // Terminal states must not be overwritten
        if (
          currentOrder.status === 'refunded' ||
          currentOrder.refundStatus === 'completed' ||
          currentOrder.refundStatus === 'manual_review_required'
        ) {
          return
        }

        // Case 1: Full refund processed
        if (totalProcessedPaise === expectedAmountPaise) {
          tx.update(doc.ref, {
            status: 'refunded',
            refundStatus: 'completed',
            refundId: processedRefundId || FieldValue.delete(),
            refundedAmountPaise: totalProcessedPaise,
            lastReconciledAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          })
          tx.set(db.doc(`payments/${paymentId}`), {
            status: 'refunded',
            refundId: processedRefundId || FieldValue.delete(),
            amountRefundedPaise: totalProcessedPaise,
            updatedAt: FieldValue.serverTimestamp(),
          }, { merge: true })
          return
        }

        // Case 1B: Excessive refund detected (more refunded than order total)
        if (totalProcessedPaise > expectedAmountPaise) {
          alertType = 'excessive_refund_detected'
          alertReason = `Excessive refund detected: ${totalProcessedPaise} paise exceeds expected ${expectedAmountPaise} paise`
          tx.update(doc.ref, {
            refundStatus: 'manual_review_required',
            refundedAmountPaise: totalProcessedPaise,
            lastRefundError: alertReason,
            lastReconciledAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          })
          tx.set(db.doc(`payments/${paymentId}`), {
            status: 'manual_review_required',
            amountRefundedPaise: totalProcessedPaise,
            updatedAt: FieldValue.serverTimestamp(),
          }, { merge: true })
          return
        }

        // Case 2: Partial refund detected - transition to non-terminal partial_refund_pending
        if (totalProcessedPaise > 0 && totalProcessedPaise < expectedAmountPaise) {
          tx.update(doc.ref, {
            refundStatus: 'partial_refund_pending',
            refundedAmountPaise: totalProcessedPaise,
            lastRefundError: `Partial refund of ${totalProcessedPaise} paise detected during scheduled reconciliation`,
            lastReconciledAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          })
          tx.set(db.doc(`payments/${paymentId}`), {
            status: 'partial_refund_pending',
            amountRefundedPaise: totalProcessedPaise,
            updatedAt: FieldValue.serverTimestamp(),
          }, { merge: true })
          return
        }

        // Case 3: Pending refund in-flight
        if (pendingAmountPaise > 0) {
          tx.update(doc.ref, {
            refundStatus: 'pending',
            refundId: pendingRefundId || FieldValue.delete(),
            lastRefundError: 'Refund is currently pending processing at payment gateway',
            lastReconciledAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          })
          tx.set(db.doc(`payments/${paymentId}`), {
            status: 'refund_pending',
            refundId: pendingRefundId || FieldValue.delete(),
            updatedAt: FieldValue.serverTimestamp(),
          }, { merge: true })
          return
        }

        // Case 4: Gateway reported failed refund
        if (failedRefundsCount > 0 && processedAmountPaise === 0 && pendingAmountPaise === 0) {
          alertType = 'refund_reconciliation_failed'
          alertReason = 'Gateway reported refund failed during reconciliation'
          tx.update(doc.ref, {
            refundStatus: 'failed',
            refundId: failedRefundId || FieldValue.delete(),
            lastRefundError: alertReason,
            lastReconciledAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          })
          tx.set(db.doc(`payments/${paymentId}`), {
            status: 'refund_failed',
            refundId: failedRefundId || FieldValue.delete(),
            updatedAt: FieldValue.serverTimestamp(),
          }, { merge: true })
          return
        }

        // Case 5: No refund record on gateway yet (e.g. request timed out before reaching gateway)
        tx.update(doc.ref, {
          lastReconciledAt: FieldValue.serverTimestamp(),
        })
      })

      if (alertType && alertReason) {
        await db.collection('admin_alerts').add({
          type: alertType,
          orderId: doc.id,
          paymentId,
          refundId: failedRefundId,
          uid: orderData.uid,
          totalAmountPaise: expectedAmountPaise,
          amountRefundedPaise: totalProcessedPaise,
          reason: alertReason,
          resolved: false,
          createdAt: FieldValue.serverTimestamp(),
        }).catch(() => {})
      }
    } catch (docErr: any) {
      console.error(`Error reconciling refund for order ${doc.id}:`, docErr?.message)
    }
  }
})

// 3. Verifies payment signature and order ownership for user-initiated client completion.
export const verifyPayment = onCall({ secrets }, async (req) => {
  if (!req.auth) throw new HttpsError('unauthenticated', 'Sign in required')
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.data ?? {}

  if (
    typeof razorpay_order_id !== 'string' ||
    typeof razorpay_payment_id !== 'string' ||
    typeof razorpay_signature !== 'string' ||
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature
  ) {
    throw new HttpsError('invalid-argument', 'Missing or invalid payment verification parameters')
  }

  const expectedSig = crypto
    .createHmac('sha256', KEY_SECRET.value())
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')

  if (!safeCompareSignatures(expectedSig, razorpay_signature)) {
    throw new HttpsError('permission-denied', 'Invalid payment signature')
  }

  // Verify that the authenticated caller owns this order before processing
  const q = await db.collection('orders').where('razorpayOrderId', '==', razorpay_order_id).limit(1).get()
  if (q.empty) {
    throw new HttpsError('not-found', 'Order not found')
  }
  if (q.docs[0].data()?.uid !== req.auth.uid) {
    throw new HttpsError('permission-denied', 'Unauthorized order access')
  }

  await markPaid(razorpay_order_id, razorpay_payment_id, req.auth.uid)
  return { ok: true }
})

// 5. Webhook listener with payload identification, deduplication, failure isolation, and refund lifecycle handling.
export const razorpayWebhook = onRequest({ secrets, timeoutSeconds: WEBHOOK_TIMEOUT_SECONDS }, async (req, res) => {
  let eventId = ''
  let currentClaimId = ''
  let eventRef: FirebaseFirestore.DocumentReference | null = null

  try {
    const sig = req.get('x-razorpay-signature') ?? ''
    const rawBody = req.rawBody ? req.rawBody.toString('utf8') : ''
    const expectedSig = crypto
      .createHmac('sha256', WEBHOOK_SECRET.value())
      .update(rawBody)
      .digest('hex')

    if (!safeCompareSignatures(expectedSig, sig)) {
      res.status(400).send('bad signature')
      return
    }

    const ev = req.body
    if (!ev || typeof ev !== 'object') {
      res.status(400).send('invalid payload')
      return
    }

    // 1 & 3: Webhook event deduplication state machine & sanitization
    const rawHeaderId = req.get('x-razorpay-event-id')
    const rawPayloadId = typeof ev.id === 'string' ? ev.id : null
    const candidateId = rawHeaderId || rawPayloadId
    eventId = (typeof candidateId === 'string' && SAFE_EVENT_ID_REGEX.test(candidateId))
      ? candidateId
      : `evt_hash_${crypto.createHash('sha256').update(rawBody).digest('hex')}`

    currentClaimId = crypto.randomUUID()
    eventRef = db.doc(`webhook_events/${eventId}`)
    const nowMillis = Date.now()

    let shouldProcess = false
    let isDuplicateActive = false
    let isAlreadyProcessed = false

    await db.runTransaction(async (tx) => {
      const doc = await tx.get(eventRef!)
      if (!doc.exists) {
        // Initial claim
        tx.set(eventRef!, {
          eventId,
          event: ev.event,
          status: 'processing',
          claimId: currentClaimId,
          claimedAt: FieldValue.serverTimestamp(),
          claimedAtMillis: nowMillis,
          attemptCount: 1,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        })
        shouldProcess = true
        return
      }

      const data = doc.data()!
      if (data.status === 'processed') {
        isAlreadyProcessed = true
        return
      }

      const claimedAtMillis = typeof data.claimedAtMillis === 'number'
        ? data.claimedAtMillis
        : (data.claimedAt?.toMillis ? data.claimedAt.toMillis() : 0)
      const isLeaseActive = data.status === 'processing' && claimedAtMillis > 0 && (nowMillis - claimedAtMillis < WEBHOOK_LEASE_TTL_MS)

      if (isLeaseActive) {
        // Active lease held by another execution: do NOT process concurrently; return retryable non-2xx
        isDuplicateActive = true
        return
      }

      // Stale lease or previously failed event: reclaim lease safely
      tx.update(eventRef!, {
        status: 'processing',
        claimId: currentClaimId,
        claimedAt: FieldValue.serverTimestamp(),
        claimedAtMillis: nowMillis,
        attemptCount: FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp(),
      })
      shouldProcess = true
    })

    if (isAlreadyProcessed) {
      console.log(`Webhook event ${eventId} already processed. Acknowledging with HTTP 200.`)
      res.status(200).send('already processed')
      return
    }

    if (isDuplicateActive) {
      console.warn(`Webhook event ${eventId} is currently processing under an active lease. Returning retryable HTTP 429.`)
      res.status(429).send('event in-progress')
      return
    }

    if (!shouldProcess) {
      res.status(500).send('unable to acquire event processing lease')
      return
    }

    if (ev.event === 'payment.captured' || ev.event === 'order.paid') {
      let razorpayOrderId: string | undefined = ev.payload?.order?.entity?.id || ev.payload?.payment?.entity?.order_id
      let paymentId: string | undefined = ev.payload?.payment?.entity?.id

      // If paymentId is missing from payload, fetch payments directly from Razorpay API
      if (!paymentId && razorpayOrderId) {
        try {
          const rz = new Razorpay({ key_id: KEY_ID.value(), key_secret: KEY_SECRET.value() })
          const paymentsRes: any = await rz.orders.fetchPayments(razorpayOrderId)
          if (paymentsRes && Array.isArray(paymentsRes.items) && paymentsRes.items.length > 0) {
            const captured = paymentsRes.items.find((p: any) => p.status === 'captured')
            if (captured) {
              paymentId = captured.id
            }
          }
        } catch (apiErr: any) {
          console.error('Failed to fetch payments from Razorpay API for order:', razorpayOrderId, apiErr?.message)
        }
      }

      if (!razorpayOrderId || !paymentId) {
        console.error('Unable to reliably identify captured payment for webhook event:', ev.event)
        res.status(422).send('Unable to identify order or captured payment in payload')
        return
      }

      await markPaid(razorpayOrderId, paymentId)
    } else if (ev.event === 'payment.failed') {
      const paymentEntity = ev.payload?.payment?.entity
      const razorpayOrderId = paymentEntity?.order_id
      if (typeof razorpayOrderId === 'string') {
        const q = await db.collection('orders').where('razorpayOrderId', '==', razorpayOrderId).limit(1).get()
        if (!q.empty) {
          const orderRef = q.docs[0].ref
          await db.runTransaction(async (tx) => {
            const o = await tx.get(orderRef)
            if (!o.exists) return
            const orderData = o.data()!
            if (orderData.status !== 'pending_payment' && orderData.status !== 'order_creation_uncertain') {
              return
            }
            tx.update(orderRef, {
              status: 'payment_failed',
              lastPaymentError: paymentEntity?.error_description || 'Payment failed',
              updatedAt: FieldValue.serverTimestamp(),
            })
          })
        }
      }
    } else if (ev.event === 'refund.created' || ev.event === 'refund.processed' || ev.event === 'refund.failed') {
      const refundEntity = ev.payload?.refund?.entity
      const paymentEntity = ev.payload?.payment?.entity

      const refundPaymentId: string | undefined = refundEntity?.payment_id || paymentEntity?.id
      const refundId: string | undefined = refundEntity?.id
      const refundAmount: number | undefined = refundEntity?.amount
      const refundCurrency: string | undefined = refundEntity?.currency
      const razorpayOrderId: string | undefined = paymentEntity?.order_id

      if (
        typeof refundPaymentId !== 'string' || !refundPaymentId ||
        typeof refundId !== 'string' || !refundId ||
        typeof refundAmount !== 'number' || refundAmount <= 0 ||
        refundCurrency !== 'INR'
      ) {
        console.error('Invalid refund webhook parameters:', { refundPaymentId, refundId, refundAmount, refundCurrency })
        res.status(422).send('Invalid refund webhook payload parameters')
        return
      }

      let q = razorpayOrderId
        ? await db.collection('orders').where('razorpayOrderId', '==', razorpayOrderId).limit(1).get()
        : await db.collection('orders').where('paymentId', '==', refundPaymentId).limit(1).get()

      if (q.empty && razorpayOrderId) {
        q = await db.collection('orders').where('paymentId', '==', refundPaymentId).limit(1).get()
      }

      if (q.empty) {
        console.warn(`Refund webhook: order not found for payment ${refundPaymentId} / order ${razorpayOrderId}`)
      } else {
        const orderRef = q.docs[0].ref
        const orderData = q.docs[0].data()
        const expectedAmountPaise = (orderData.total || 0) * 100

        let alertType: string | null = null
        let alertReason: string | null = null

        if (ev.event === 'refund.processed') {
          // 2. Cumulative refund aggregation via rz.payments.fetchMultipleRefund
          const rz = new Razorpay({ key_id: KEY_ID.value(), key_secret: KEY_SECRET.value() })
          const [refundsRes, paymentRes] = await Promise.all([
            rz.payments.fetchMultipleRefund(refundPaymentId).catch((err: any) => {
              console.warn('Could not fetch multiple refunds for payment in webhook:', refundPaymentId, err?.message)
              return null
            }),
            rz.payments.fetch(refundPaymentId).catch(() => null),
          ])

          const refundItems: any[] = Array.isArray(refundsRes?.items) ? refundsRes.items : []
          let processedAmountPaise = 0
          let latestProcessedRefundId: string | null = refundId

          for (const item of refundItems) {
            if (item.payment_id === refundPaymentId && item.currency === 'INR' && item.status === 'processed') {
              const itemAmt = typeof item.amount === 'number' ? item.amount : 0
              processedAmountPaise += itemAmt
              latestProcessedRefundId = item.id
            }
          }

          if (processedAmountPaise === 0) {
            processedAmountPaise = refundAmount
          }

          const paymentAmountRefunded = typeof paymentRes?.amount_refunded === 'number' ? paymentRes.amount_refunded : 0
          const cumulativeProcessedPaise = Math.max(
            processedAmountPaise,
            paymentRes?.status === 'refunded' ? expectedAmountPaise : paymentAmountRefunded
          )

          await db.runTransaction(async (tx) => {
            const o = await tx.get(orderRef)
            if (!o.exists) return
            const currentOrder = o.data()!

            // Terminal state protection: Completed or manual review orders must not be overwritten
            if (
              currentOrder.status === 'refunded' ||
              currentOrder.refundStatus === 'completed' ||
              currentOrder.refundStatus === 'manual_review_required'
            ) {
              return
            }

            if (cumulativeProcessedPaise === expectedAmountPaise) {
              // Full refund processed successfully
              tx.update(orderRef, {
                status: 'refunded',
                refundStatus: 'completed',
                refundId: latestProcessedRefundId || refundId,
                refundedAmountPaise: cumulativeProcessedPaise,
                updatedAt: FieldValue.serverTimestamp(),
              })
              tx.set(db.doc(`payments/${refundPaymentId}`), {
                status: 'refunded',
                refundId: latestProcessedRefundId || refundId,
                amountRefundedPaise: cumulativeProcessedPaise,
                updatedAt: FieldValue.serverTimestamp(),
              }, { merge: true })
            } else if (cumulativeProcessedPaise > expectedAmountPaise) {
              // Excessive refund situation: requires manual review
              alertType = 'excessive_refund_detected'
              alertReason = `Excessive refund detected: ${cumulativeProcessedPaise} paise exceeds order total ${expectedAmountPaise} paise`
              tx.update(orderRef, {
                refundStatus: 'manual_review_required',
                refundId: latestProcessedRefundId || refundId,
                refundedAmountPaise: cumulativeProcessedPaise,
                lastRefundError: alertReason,
                updatedAt: FieldValue.serverTimestamp(),
              })
              tx.set(db.doc(`payments/${refundPaymentId}`), {
                status: 'manual_review_required',
                amountRefundedPaise: cumulativeProcessedPaise,
                updatedAt: FieldValue.serverTimestamp(),
              }, { merge: true })
            } else if (cumulativeProcessedPaise > 0 && cumulativeProcessedPaise < expectedAmountPaise) {
              // Partial refund processed: intermediate non-terminal state partial_refund_pending
              tx.update(orderRef, {
                refundStatus: 'partial_refund_pending',
                refundId: latestProcessedRefundId || refundId,
                refundedAmountPaise: cumulativeProcessedPaise,
                lastRefundError: `Partial refund of ${cumulativeProcessedPaise} paise processed; awaiting remaining balance`,
                updatedAt: FieldValue.serverTimestamp(),
              })
              tx.set(db.doc(`payments/${refundPaymentId}`), {
                status: 'partial_refund_pending',
                refundId: latestProcessedRefundId || refundId,
                amountRefundedPaise: cumulativeProcessedPaise,
                updatedAt: FieldValue.serverTimestamp(),
              }, { merge: true })
            }
          })
        } else if (ev.event === 'refund.created') {
          await db.runTransaction(async (tx) => {
            const o = await tx.get(orderRef)
            if (!o.exists) return
            const currentOrder = o.data()!

            // Terminal state protection
            if (
              currentOrder.status === 'refunded' ||
              currentOrder.refundStatus === 'completed' ||
              currentOrder.refundStatus === 'manual_review_required'
            ) {
              return
            }

            // If already in partial_refund_pending, do not downgrade to pending
            if (currentOrder.refundStatus === 'partial_refund_pending') {
              return
            }

            tx.update(orderRef, {
              refundStatus: 'pending',
              refundId,
              refundedAmountPaise: refundAmount,
              lastRefundError: 'Refund created and awaiting gateway settlement',
              updatedAt: FieldValue.serverTimestamp(),
            })
            tx.set(db.doc(`payments/${refundPaymentId}`), {
              status: 'refund_pending',
              refundId,
              updatedAt: FieldValue.serverTimestamp(),
            }, { merge: true })
          })
        } else if (ev.event === 'refund.failed') {
          await db.runTransaction(async (tx) => {
            const o = await tx.get(orderRef)
            if (!o.exists) return
            const currentOrder = o.data()!

            // Terminal state protection
            if (
              currentOrder.status === 'refunded' ||
              currentOrder.refundStatus === 'completed' ||
              currentOrder.refundStatus === 'manual_review_required'
            ) {
              return
            }

            if (currentOrder.refundStatus === 'partial_refund_pending') {
              alertType = 'partial_refund_failed'
              alertReason = refundEntity?.error_description || 'Secondary refund attempt failed after partial refund processed'
              tx.update(orderRef, {
                refundStatus: 'manual_review_required',
                refundId,
                lastRefundError: alertReason,
                updatedAt: FieldValue.serverTimestamp(),
              })
              tx.set(db.doc(`payments/${refundPaymentId}`), {
                status: 'manual_review_required',
                refundId,
                updatedAt: FieldValue.serverTimestamp(),
              }, { merge: true })
            } else {
              alertType = 'refund_webhook_failed'
              alertReason = refundEntity?.error_description || 'Gateway reported refund failed via webhook'
              tx.update(orderRef, {
                refundStatus: 'failed',
                refundId,
                lastRefundError: alertReason,
                updatedAt: FieldValue.serverTimestamp(),
              })
              tx.set(db.doc(`payments/${refundPaymentId}`), {
                status: 'refund_failed',
                refundId,
                updatedAt: FieldValue.serverTimestamp(),
              }, { merge: true })
            }
          })
        }

        if (alertType && alertReason) {
          await db.collection('admin_alerts').add({
            type: alertType,
            orderId: orderRef.id,
            paymentId: refundPaymentId,
            refundId,
            totalAmountPaise: expectedAmountPaise,
            reason: alertReason,
            resolved: false,
            createdAt: FieldValue.serverTimestamp(),
          }).catch(() => {})
        }
      }
    }

    // Mark event processed only after all required updates succeed (Requirement 1)
    if (eventRef) {
      await db.runTransaction(async (tx) => {
        const doc = await tx.get(eventRef!)
        if (!doc.exists) return
        const data = doc.data()!
        // Ensure an old execution cannot mark an event processed if reclaimed by another claimId
        if (data.claimId !== currentClaimId) {
          console.warn(`Lease for event ${eventId} was reclaimed by ${data.claimId}, current: ${currentClaimId}`)
          return
        }
        tx.update(eventRef!, {
          status: 'processed',
          processedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        })
      })
    }

    res.status(200).send('ok')
  } catch (err: any) {
    console.error('Webhook processing error:', err)
    // On processing failure, record failed state if claim is still held and return HTTP 500
    try {
      if (eventRef && currentClaimId) {
        await db.runTransaction(async (tx) => {
          const doc = await tx.get(eventRef!)
          if (!doc.exists) return
          const data = doc.data()!
          if (data.claimId === currentClaimId && data.status === 'processing') {
            tx.update(eventRef!, {
              status: 'failed',
              lastError: err?.message || String(err),
              failedAt: FieldValue.serverTimestamp(),
              updatedAt: FieldValue.serverTimestamp(),
            })
          }
        })
      }
    } catch (_) {}
    res.status(500).send('webhook processing error')
  }
})
