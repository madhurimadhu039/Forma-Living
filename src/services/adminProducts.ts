import {
  doc,
  runTransaction,
  updateDoc,
  serverTimestamp,
  deleteField,
  FieldValue,
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { Product } from '../data/products'

export interface ProductFormValues {
  id: string
  name: string
  category: string
  style: string
  color: string
  material: string
  price: string
  compareAt: string
  stock: string
  width: string
  depth: string
  height: string
  description: string
  image: string
  images: string[]
  isPopular: boolean
}

export type ProductFormErrors = Partial<Record<keyof ProductFormValues | 'general', string>>

export const MAX_GALLERY_IMAGES = 10

export function productToFormValues(p: Product): ProductFormValues {
  const normalized = normalizeProductImages(p.image, p.images || [p.image])
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    style: p.style,
    color: p.color,
    material: p.material,
    price: String(p.price),
    compareAt: p.compareAt ? String(p.compareAt) : '',
    stock: String(p.stock ?? 0),
    width: String(p.width),
    depth: String(p.depth),
    height: String(p.height),
    description: p.description,
    image: normalized.image,
    images: normalized.images,
    isPopular: Boolean(p.isPopular),
  }
}

export function createEmptyProductFormValues(defaultCategory: string): ProductFormValues {
  return {
    id: '',
    name: '',
    category: defaultCategory,
    style: '',
    color: '',
    material: '',
    price: '',
    compareAt: '',
    stock: '10',
    width: '',
    depth: '',
    height: '',
    description: '',
    image: '',
    images: [],
    isPopular: false,
  }
}

export function slugifyProductId(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}

export function isValidProductId(id: string): boolean {
  return id.length >= 2 && id.length <= 80 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)
}

/**
 * Validates either clean local static asset paths (e.g. /images/sofa.jpg)
 * or external HTTPS URLs while rejecting protocol-relative URLs, HTTP, and JS/data URIs.
 */
export function isValidImagePathOrUrl(raw: string): boolean {
  const val = raw.trim()
  if (!val || val.length > 500) return false

  if (val.startsWith('/')) {
    if (val.startsWith('//') || val.includes('..')) return false
    return /^\/[a-zA-Z0-9/_\.-]+$/.test(val)
  }

  try {
    const parsed = new URL(val)
    return parsed.protocol === 'https:' && Boolean(parsed.hostname)
  } catch {
    return false
  }
}

export function normalizeProductImages(
  primaryImage: string,
  galleryImages: string[]
): { image: string; images: string[] } {
  const primary = primaryImage.trim()
  const deduped: string[] = []
  const seen = new Set<string>()

  const pushUnique = (entry: string) => {
    const cleaned = entry.trim()
    if (!cleaned || seen.has(cleaned)) return
    seen.add(cleaned)
    deduped.push(cleaned)
  }

  if (primary) {
    pushUnique(primary)
  }
  for (const item of galleryImages) {
    pushUnique(item)
  }

  const resolvedPrimary = primary || deduped[0] || ''
  return {
    image: resolvedPrimary,
    images: deduped,
  }
}

export function validateProductForm(
  values: ProductFormValues,
  options: { mode: 'create' | 'edit'; existingIds?: Set<string> }
): ProductFormErrors {
  const errs: ProductFormErrors = {}
  const name = values.name.trim()
  const id = values.id.trim()
  const category = values.category.trim()
  const style = values.style.trim()
  const color = values.color.trim()
  const material = values.material.trim()
  const description = values.description.trim()
  const primaryImg = values.image.trim()

  if (name.length < 2 || name.length > 100) {
    errs.name = 'Product name must be between 2 and 100 characters'
  }

  if (options.mode === 'create') {
    if (!id) {
      errs.id = 'Product ID is required'
    } else if (!isValidProductId(id)) {
      errs.id = 'Use 2–80 lowercase letters, numbers, and single hyphens (e.g. modern-oak-sofa)'
    } else if (options.existingIds?.has(id)) {
      errs.id = `A product with ID "${id}" already exists`
    }
  }

  if (!category) {
    errs.category = 'Please select a category'
  }

  if (style.length < 2 || style.length > 60) {
    errs.style = 'Style must be between 2 and 60 characters'
  }

  if (color.length < 2 || color.length > 60) {
    errs.color = 'Color must be between 2 and 60 characters'
  }

  if (material.length < 2 || material.length > 80) {
    errs.material = 'Material must be between 2 and 80 characters'
  }

  const priceNum = Number(values.price)
  if (!values.price.trim() || !Number.isFinite(priceNum) || !Number.isInteger(priceNum) || priceNum < 1 || priceNum > 10000000) {
    errs.price = 'Enter a valid whole-number INR selling price (₹1 – ₹1,00,00,000)'
  }

  if (values.compareAt.trim()) {
    const compareNum = Number(values.compareAt)
    if (!Number.isFinite(compareNum) || !Number.isInteger(compareNum) || compareNum < 1 || compareNum > 10000000) {
      errs.compareAt = 'Compare-at price must be a valid whole-number INR amount'
    } else if (Number.isFinite(priceNum) && compareNum <= priceNum) {
      errs.compareAt = 'Compare-at price must be greater than selling price'
    }
  }

  if (options.mode === 'create') {
    const stockNum = Number(values.stock)
    if (
      !values.stock.trim() ||
      !Number.isFinite(stockNum) ||
      !Number.isInteger(stockNum) ||
      stockNum < 0 ||
      stockNum > 100000
    ) {
      errs.stock = 'Initial stock must be a whole number (0 – 1,00,000)'
    }
  }

  const w = Number(values.width)
  const d = Number(values.depth)
  const h = Number(values.height)
  if (!values.width.trim() || !Number.isFinite(w) || w <= 0 || w > 5000) {
    errs.width = 'Width must be > 0 cm'
  }
  if (!values.depth.trim() || !Number.isFinite(d) || d <= 0 || d > 5000) {
    errs.depth = 'Depth must be > 0 cm'
  }
  if (!values.height.trim() || !Number.isFinite(h) || h <= 0 || h > 5000) {
    errs.height = 'Height must be > 0 cm'
  }

  if (description.length < 10 || description.length > 2000) {
    errs.description = 'Description must be between 10 and 2000 characters'
  }

  if (!primaryImg) {
    errs.image = 'Primary image path or HTTPS URL is required'
  } else if (!isValidImagePathOrUrl(primaryImg)) {
    errs.image = 'Enter a valid /images/... path or external https:// URL'
  }

  if (values.images.length > MAX_GALLERY_IMAGES) {
    errs.images = `Maximum ${MAX_GALLERY_IMAGES} gallery images allowed`
  } else {
    const badGallery = values.images.find(img => !isValidImagePathOrUrl(img))
    if (badGallery) {
      errs.images = `Invalid gallery image path/URL: ${badGallery}`
    }
  }

  return errs
}

export function formatAdminFirestoreError(err: unknown): string {
  const code = (err as any)?.code
  const message = (err as any)?.message
  if (code === 'permission-denied') {
    return 'Permission denied by Firestore rules. Ensure your account has the "admin: true" claim and refresh your token.'
  }
  if (code === 'not-found') {
    return 'Product document was not found in Firestore. If the database is not seeded yet, seed initial products first.'
  }
  if (code === 'unavailable') {
    return 'Network unavailable while reaching Firestore. Please check your connection and try again.'
  }
  return typeof message === 'string' && message.trim()
    ? message
    : 'An unexpected database error occurred.'
}

/**
 * Atomically creates a new product in Firestore, guarding against duplicate product IDs.
 */
export async function createProductInFirestore(values: ProductFormValues): Promise<void> {
  const errors = validateProductForm(values, { mode: 'create' })
  if (Object.keys(errors).length > 0) {
    throw new Error(Object.values(errors)[0] || 'Invalid product data')
  }

  const id = values.id.trim()
  const { image, images } = normalizeProductImages(values.image, values.images)
  const price = Number(values.price)
  const stock = Number(values.stock)
  const compareAtTrimmed = values.compareAt.trim()

  const docData: Record<string, unknown> = {
    id,
    name: values.name.trim(),
    category: values.category.trim(),
    style: values.style.trim(),
    color: values.color.trim(),
    material: values.material.trim(),
    price,
    stock,
    width: Number(values.width),
    depth: Number(values.depth),
    height: Number(values.height),
    description: values.description.trim(),
    image,
    images,
    isPopular: Boolean(values.isPopular),
    archived: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  if (compareAtTrimmed) {
    docData.compareAt = Number(compareAtTrimmed)
  }

  const pRef = doc(db, 'products', id)
  await runTransaction(db, async (tx) => {
    const existing = await tx.get(pRef)
    if (existing.exists()) {
      throw new Error(`Product ID "${id}" already exists in Firestore.`)
    }
    tx.set(pRef, docData)
  })
}

/**
 * Updates product metadata without touching `stock` or `archived` to prevent
 * overwriting concurrent checkout reservations or release operations.
 */
export async function updateProductMetadataInFirestore(
  id: string,
  values: ProductFormValues
): Promise<void> {
  const errors = validateProductForm(values, { mode: 'edit' })
  if (Object.keys(errors).length > 0) {
    throw new Error(Object.values(errors)[0] || 'Invalid product metadata')
  }

  const { image, images } = normalizeProductImages(values.image, values.images)
  const compareAtTrimmed = values.compareAt.trim()
  const compareAtValue: number | FieldValue = compareAtTrimmed
    ? Number(compareAtTrimmed)
    : deleteField()

  const pRef = doc(db, 'products', id)
  await updateDoc(pRef, {
    name: values.name.trim(),
    category: values.category.trim(),
    style: values.style.trim(),
    color: values.color.trim(),
    material: values.material.trim(),
    price: Number(values.price),
    compareAt: compareAtValue,
    width: Number(values.width),
    depth: Number(values.depth),
    height: Number(values.height),
    description: values.description.trim(),
    image,
    images,
    isPopular: Boolean(values.isPopular),
    updatedAt: serverTimestamp(),
  })
}

/**
 * Non-destructively archives (`archived: true`) or restores (`archived: false`) a product.
 * Preserves stock, prices, and metadata cleanly.
 */
export async function setProductArchivedStatus(id: string, archived: boolean): Promise<void> {
  if (!id || !id.trim()) {
    throw new Error('Invalid product ID')
  }
  const pRef = doc(db, 'products', id.trim())
  await updateDoc(pRef, {
    archived: Boolean(archived),
    updatedAt: serverTimestamp(),
  })
}

export type StockUpdatePayload =
  | { mode: 'delta'; delta: number }
  | { mode: 'set'; stock: number; expectedStock?: number }

export class ConcurrentStockError extends Error {
  readonly expectedStock: number
  readonly currentStock: number

  constructor(expectedStock: number, currentStock: number) {
    super(
      `Concurrent stock change detected: live stock changed from ${expectedStock} to ${currentStock}. Review the updated count before retrying.`
    )
    this.name = 'ConcurrentStockError'
    this.expectedStock = expectedStock
    this.currentStock = currentStock
  }
}

/**
 * Performs an explicit stock update inside a Firestore transaction, preventing
 * negative stock, non-integer counts, and silent overwrites of concurrent checkouts.
 */
export async function updateProductStockInTransaction(
  id: string,
  update: StockUpdatePayload
): Promise<number> {
  if (!id || !id.trim()) {
    throw new Error('Invalid product ID')
  }

  if (update.mode === 'delta') {
    if (!Number.isInteger(update.delta) || update.delta === 0) {
      throw new Error('Stock adjustment must be a non-zero integer')
    }
  } else {
    if (!Number.isInteger(update.stock) || update.stock < 0 || update.stock > 100000) {
      throw new Error('Stock quantity must be a whole number between 0 and 1,00,000')
    }
  }

  const pRef = doc(db, 'products', id.trim())

  return runTransaction(db, async (tx) => {
    const pDoc = await tx.get(pRef)
    if (!pDoc.exists()) {
      throw new Error(`Product "${id}" was not found in Firestore.`)
    }

    const data = pDoc.data()
    const currentStock =
      typeof data?.stock === 'number' && Number.isFinite(data.stock) ? data.stock : 0

    let nextStock: number

    if (update.mode === 'delta') {
      nextStock = currentStock + update.delta
      if (nextStock < 0) {
        throw new Error(`Cannot reduce stock below 0 (live stock is ${currentStock}).`)
      }
      if (nextStock > 100000) {
        throw new Error('Stock quantity cannot exceed 1,00,000 units.')
      }
    } else {
      if (
        update.expectedStock !== undefined &&
        currentStock !== update.expectedStock
      ) {
        throw new ConcurrentStockError(update.expectedStock, currentStock)
      }
      nextStock = update.stock
    }

    tx.update(pRef, {
      stock: nextStock,
      updatedAt: serverTimestamp(),
    })

    return nextStock
  })
}

