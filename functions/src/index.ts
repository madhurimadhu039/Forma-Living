import { onCall, onRequest, HttpsError } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'
import { initializeApp } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import Razorpay from 'razorpay'
import crypto from 'crypto'

initializeApp()
const db = getFirestore()
const KEY_ID = defineSecret('RAZORPAY_KEY_ID')
const KEY_SECRET = defineSecret('RAZORPAY_KEY_SECRET')
const WEBHOOK_SECRET = defineSecret('RAZORPAY_WEBHOOK_SECRET')
const secrets = [KEY_ID, KEY_SECRET, WEBHOOK_SECRET]
const hmac = (secret: string, body: string) => crypto.createHmac('sha256', secret).update(body).digest('hex')

// Creates a pending order. Prices are read from Firestore, never trusted from the client.
export const createOrder = onCall({ secrets }, async (req) => {
  if (!req.auth) throw new HttpsError('unauthenticated', 'Sign in required')
  const items = req.data?.items as { productId: string; qty: number }[]
  if (!Array.isArray(items) || !items.length) throw new HttpsError('invalid-argument', 'Empty cart')
  let subtotal = 0
  const lines = []
  for (const i of items) {
    const p = (await db.doc(`products/${i.productId}`).get()).data()
    if (!p || !Number.isInteger(i.qty) || i.qty < 1 || p.stock < i.qty) throw new HttpsError('failed-precondition', `Unavailable: ${i.productId}`)
    subtotal += p.price * i.qty
    lines.push({ productId: i.productId, name: p.name, price: p.price, qty: i.qty })
  }
  const shipping = subtotal >= 5000 ? 0 : 499
  const total = subtotal + shipping
  const rz = new Razorpay({ key_id: KEY_ID.value(), key_secret: KEY_SECRET.value() })
  const rzOrder = await rz.orders.create({ amount: total * 100, currency: 'INR', receipt: crypto.randomUUID().slice(0, 30) })
  const ref = await db.collection('orders').add({ uid: req.auth.uid, items: lines, subtotal, shipping, total, status: 'pending_payment', razorpayOrderId: rzOrder.id, createdAt: FieldValue.serverTimestamp() })
  return { orderId: ref.id, razorpayOrderId: rzOrder.id, amount: total * 100, keyId: KEY_ID.value() }
})

async function markPaid(razorpayOrderId: string, paymentId: string) {
  const q = await db.collection('orders').where('razorpayOrderId', '==', razorpayOrderId).limit(1).get()
  if (q.empty) return
  const ref = q.docs[0].ref
  await db.runTransaction(async (tx) => {
    const o = await tx.get(ref)
    if (o.data()?.status === 'paid') return // idempotent: no duplicate processing
    for (const l of o.data()!.items) tx.update(db.doc(`products/${l.productId}`), { stock: FieldValue.increment(-l.qty) })
    tx.update(ref, { status: 'paid', paymentId })
    tx.set(db.doc(`payments/${paymentId}`), { uid: o.data()!.uid, orderId: ref.id, status: 'captured', createdAt: FieldValue.serverTimestamp() })
  })
}

export const verifyPayment = onCall({ secrets }, async (req) => {
  if (!req.auth) throw new HttpsError('unauthenticated', 'Sign in required')
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.data ?? {}
  if (hmac(KEY_SECRET.value(), `${razorpay_order_id}|${razorpay_payment_id}`) !== razorpay_signature) throw new HttpsError('permission-denied', 'Invalid signature')
  await markPaid(razorpay_order_id, razorpay_payment_id)
  return { ok: true }
})

export const razorpayWebhook = onRequest({ secrets }, async (req, res) => {
  const sig = req.get('x-razorpay-signature') ?? ''
  if (hmac(WEBHOOK_SECRET.value(), req.rawBody.toString()) !== sig) { res.status(400).send('bad signature'); return }
  const ev = req.body
  if (ev.event === 'payment.captured') await markPaid(ev.payload.payment.entity.order_id, ev.payload.payment.entity.id)
  res.send('ok')
})
