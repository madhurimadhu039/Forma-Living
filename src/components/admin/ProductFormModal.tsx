import { useEffect, useMemo, useState } from 'react'
import { Product } from '../../data/products'
import {
  ConcurrentStockError,
  ProductFormErrors,
  ProductFormValues,
  createEmptyProductFormValues,
  createProductInFirestore,
  formatAdminFirestoreError,
  productToFormValues,
  slugifyProductId,
  updateProductMetadataInFirestore,
  updateProductStockInTransaction,
  validateProductForm,
} from '../../services/adminProducts'
import ProductImageManager from './ProductImageManager'

interface ProductFormModalProps {
  isOpen: boolean
  mode: 'create' | 'edit'
  editingProduct: Product | null
  categories: string[]
  existingIds: Set<string>
  isLive: boolean
  onBeforeWrite?: () => Promise<boolean>
  onClose: () => void
  onSaved: (message: string) => void
  onStockUpdated?: (message: string) => void
}

export default function ProductFormModal({
  isOpen,
  mode,
  editingProduct,
  categories,
  existingIds,
  isLive,
  onBeforeWrite,
  onClose,
  onSaved,
  onStockUpdated,
}: ProductFormModalProps) {
  const defaultCategory = categories[0] || 'Living Room'

  const [values, setValues] = useState<ProductFormValues>(() =>
    createEmptyProductFormValues(defaultCategory)
  )
  const [errors, setErrors] = useState<ProductFormErrors>({})
  const [idManuallyEdited, setIdManuallyEdited] = useState(false)
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [stockTargetInput, setStockTargetInput] = useState('0')
  const [stockDirty, setStockDirty] = useState(false)
  const [stockBaseline, setStockBaseline] = useState<number | null>(null)
  const [stockSaving, setStockSaving] = useState(false)
  const [stockFeedback, setStockFeedback] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const liveStock = editingProduct?.stock ?? 0

  const categoryOptions = useMemo(() => {
    const list = [...categories]
    if (editingProduct?.category && !list.includes(editingProduct.category)) {
      list.push(editingProduct.category)
    }
    if (values.category && !list.includes(values.category)) {
      list.push(values.category)
    }
    return list
  }, [categories, editingProduct?.category, values.category])

  useEffect(() => {
    if (!isOpen) return
    setErrors({})
    setSubmitError(null)
    setStockFeedback(null)

    if (mode === 'edit' && editingProduct) {
      const initialStock = editingProduct.stock ?? 0
      setValues(productToFormValues(editingProduct))
      setStockTargetInput(String(initialStock))
      setStockDirty(false)
      setStockBaseline(initialStock)
      setIdManuallyEdited(true)
    } else {
      setValues(createEmptyProductFormValues(defaultCategory))
      setStockTargetInput('10')
      setStockDirty(false)
      setStockBaseline(null)
      setIdManuallyEdited(false)
    }
  }, [isOpen, mode, editingProduct?.id, defaultCategory])

  // Keep live stock target input & baseline synced only while admin has not started editing stock
  useEffect(() => {
    if (isOpen && mode === 'edit' && editingProduct && !stockDirty) {
      const latestStock = editingProduct.stock ?? 0
      setStockTargetInput(String(latestStock))
      setStockBaseline(latestStock)
    }
  }, [isOpen, mode, editingProduct?.id, editingProduct?.stock, stockDirty])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving && !stockSaving) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, saving, stockSaving, onClose])

  if (!isOpen) return null

  const updateField = <K extends keyof ProductFormValues>(
    field: K,
    val: ProductFormValues[K]
  ) => {
    setValues(prev => {
      const next = { ...prev, [field]: val }
      if (field === 'name' && mode === 'create' && !idManuallyEdited) {
        next.id = slugifyProductId(String(val))
      }
      return next
    })
    setErrors(prev => {
      if (!prev[field] && !prev.general) return prev
      const copy = { ...prev }
      delete copy[field]
      if (field === 'name' && mode === 'create' && !idManuallyEdited) {
        delete copy.id
      }
      delete copy.general
      return copy
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (saving) return

    const validationErrors = validateProductForm(values, {
      mode,
      existingIds,
    })

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      setSubmitError('Please review and fix the highlighted fields below.')
      return
    }

    if (onBeforeWrite) {
      const ok = await onBeforeWrite()
      if (!ok) {
        setSubmitError('Admin verification could not be confirmed. Refresh and try again.')
        return
      }
    }

    setSaving(true)
    setSubmitError(null)

    try {
      if (mode === 'create') {
        await createProductInFirestore(values)
        onSaved(`Created "${values.name.trim()}" (${values.id.trim()})`)
      } else if (editingProduct) {
        await updateProductMetadataInFirestore(editingProduct.id, values)
        onSaved(`Saved changes for "${values.name.trim()}"`)
      }
    } catch (err) {
      setSubmitError(formatAdminFirestoreError(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDeltaStock = async (delta: number) => {
    if (!editingProduct || stockSaving) return
    if (onBeforeWrite) {
      const ok = await onBeforeWrite()
      if (!ok) {
        setStockFeedback({
          type: 'error',
          text: 'Admin verification could not be confirmed. Refresh and try again.',
        })
        return
      }
    }

    setStockSaving(true)
    setStockFeedback(null)
    try {
      const nextStock = await updateProductStockInTransaction(editingProduct.id, {
        mode: 'delta',
        delta,
      })
      setStockDirty(false)
      setStockBaseline(nextStock)
      setStockTargetInput(String(nextStock))
      const msg = `Updated stock for "${editingProduct.name}" to ${nextStock} units.`
      setStockFeedback({ type: 'success', text: msg })
      onStockUpdated?.(msg)
    } catch (err) {
      setStockFeedback({
        type: 'error',
        text: formatAdminFirestoreError(err),
      })
    } finally {
      setStockSaving(false)
    }
  }

  const handleSetExactStock = async () => {
    if (!editingProduct || stockSaving) return
    const parsed = Number(stockTargetInput.trim())
    if (!stockTargetInput.trim() || !Number.isInteger(parsed) || parsed < 0 || parsed > 100000) {
      setStockFeedback({
        type: 'error',
        text: 'Enter a whole number between 0 and 1,00,000.',
      })
      return
    }

    if (onBeforeWrite) {
      const ok = await onBeforeWrite()
      if (!ok) {
        setStockFeedback({
          type: 'error',
          text: 'Admin verification could not be confirmed. Refresh and try again.',
        })
        return
      }
    }

    setStockSaving(true)
    setStockFeedback(null)
    try {
      const nextStock = await updateProductStockInTransaction(editingProduct.id, {
        mode: 'set',
        stock: parsed,
        expectedStock: stockBaseline ?? liveStock,
      })
      setStockDirty(false)
      setStockBaseline(nextStock)
      setStockTargetInput(String(nextStock))
      const msg = `Updated stock for "${editingProduct.name}" to ${nextStock} units.`
      setStockFeedback({ type: 'success', text: msg })
      onStockUpdated?.(msg)
    } catch (err) {
      if (err instanceof ConcurrentStockError) {
        setStockBaseline(err.currentStock)
      }
      setStockFeedback({
        type: 'error',
        text: formatAdminFirestoreError(err),
      })
    } finally {
      setStockSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[1px] flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-form-modal-title"
      onClick={() => {
        if (!saving && !stockSaving) onClose()
      }}
    >
      <div
        className="w-full max-w-3xl bg-white rounded-2xl sm:rounded-3xl border border-[#EFE8DC] shadow-2xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="px-5 sm:px-7 py-4 sm:py-5 border-b border-[#EFE8DC] bg-[#FAF7F2] flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-[#BD6024]">
              {mode === 'create' ? 'New Catalogue Item' : 'Edit Catalogue Item'}
            </p>
            <h2
              id="product-form-modal-title"
              className="text-lg sm:text-xl font-bold text-[#2B231D] truncate"
            >
              {mode === 'create' ? 'Add New Product' : editingProduct?.name || 'Edit Product'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving || stockSaving}
            aria-label="Close modal"
            className="w-9 h-9 rounded-full bg-white border border-[#EFE8DC] hover:border-[#BD6024] text-[#6E6359] hover:text-[#2B231D] flex items-center justify-center text-lg font-medium transition disabled:opacity-50"
          >
            &times;
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 sm:px-7 py-5 space-y-6">
          {!isLive && mode === 'create' && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
              <strong>Note:</strong> Firestore currently has no seeded product documents (the
              storefront is showing static fallback data). Creating a single product right now will
              cause the live storefront to show only Firestore documents. Consider seeding the
              catalogue first if you want the 143 existing products in Firestore.
            </div>
          )}

          {!isLive && mode === 'edit' && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
              <strong>Static Fallback Mode:</strong> This product does not exist in Firestore yet.
              Seed initial products in Admin maintenance below before saving edits or updating
              stock.
            </div>
          )}

          {submitError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-700">
              {submitError}
            </div>
          )}

          {/* Core Identity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#2B231D] mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={values.name}
                onChange={e => updateField('name', e.target.value)}
                disabled={saving}
                placeholder="e.g. Verona Solid Oak Lounge Chair"
                className={`w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border text-sm text-[#2B231D] focus:outline-none focus:ring-2 focus:ring-[#BD6024]/30 ${
                  errors.name ? 'border-red-400' : 'border-[#EFE8DC]'
                }`}
              />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#2B231D]">
                  Product ID (URL slug) <span className="text-red-500">*</span>
                </label>
                {mode === 'create' ? (
                  idManuallyEdited && values.name.trim() ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIdManuallyEdited(false)
                        setValues(prev => ({
                          ...prev,
                          id: slugifyProductId(prev.name),
                        }))
                      }}
                      className="text-[11px] font-semibold text-[#BD6024] hover:underline"
                    >
                      Auto-generate from name
                    </button>
                  ) : null
                ) : (
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-[#82756A]">
                    Immutable
                  </span>
                )}
              </div>
              <input
                type="text"
                value={values.id}
                onChange={e => {
                  setIdManuallyEdited(true)
                  updateField('id', e.target.value.toLowerCase())
                }}
                readOnly={mode === 'edit'}
                disabled={saving}
                placeholder="e.g. verona-oak-lounge-chair"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono focus:outline-none ${
                  mode === 'edit'
                    ? 'bg-[#EFE8DC]/50 text-[#6E6359] border-[#EFE8DC] cursor-not-allowed'
                    : `bg-[#FAF7F2] text-[#2B231D] focus:ring-2 focus:ring-[#BD6024]/30 ${
                        errors.id ? 'border-red-400' : 'border-[#EFE8DC]'
                      }`
                }`}
              />
              {errors.id ? (
                <p className="mt-1 text-xs text-red-600">{errors.id}</p>
              ) : (
                <p className="mt-1 text-[11px] text-[#82756A]">
                  {mode === 'edit'
                    ? 'Product ID cannot be changed after creation.'
                    : 'Lowercase letters, numbers, and hyphens only.'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2B231D] mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={values.category}
                onChange={e => updateField('category', e.target.value)}
                disabled={saving}
                className={`w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border text-sm text-[#2B231D] focus:outline-none focus:ring-2 focus:ring-[#BD6024]/30 ${
                  errors.category ? 'border-red-400' : 'border-[#EFE8DC]'
                }`}
              >
                {categoryOptions.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && <p className="mt-1 text-xs text-red-600">{errors.category}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2B231D] mb-1">
                Style <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={values.style}
                onChange={e => updateField('style', e.target.value)}
                disabled={saving}
                placeholder="e.g. Modern, Japandi, Mid-Century"
                className={`w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border text-sm text-[#2B231D] focus:outline-none focus:ring-2 focus:ring-[#BD6024]/30 ${
                  errors.style ? 'border-red-400' : 'border-[#EFE8DC]'
                }`}
              />
              {errors.style && <p className="mt-1 text-xs text-red-600">{errors.style}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2B231D] mb-1">
                Color <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={values.color}
                onChange={e => updateField('color', e.target.value)}
                disabled={saving}
                placeholder="e.g. Warm Walnut, Ivory Boucle"
                className={`w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border text-sm text-[#2B231D] focus:outline-none focus:ring-2 focus:ring-[#BD6024]/30 ${
                  errors.color ? 'border-red-400' : 'border-[#EFE8DC]'
                }`}
              />
              {errors.color && <p className="mt-1 text-xs text-red-600">{errors.color}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#2B231D] mb-1">
                Material <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={values.material}
                onChange={e => updateField('material', e.target.value)}
                disabled={saving}
                placeholder="e.g. Kiln-dried Burmese Teak & Linen Upholstery"
                className={`w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border text-sm text-[#2B231D] focus:outline-none focus:ring-2 focus:ring-[#BD6024]/30 ${
                  errors.material ? 'border-red-400' : 'border-[#EFE8DC]'
                }`}
              />
              {errors.material && <p className="mt-1 text-xs text-red-600">{errors.material}</p>}
            </div>
          </div>

          {/* Pricing & Initial Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#EFE8DC]">
            <div>
              <label className="block text-xs font-semibold text-[#2B231D] mb-1">
                Selling Price (₹ INR) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                step={1}
                value={values.price}
                onChange={e => updateField('price', e.target.value)}
                disabled={saving}
                placeholder="48500"
                className={`w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border text-sm text-[#2B231D] focus:outline-none focus:ring-2 focus:ring-[#BD6024]/30 ${
                  errors.price ? 'border-red-400' : 'border-[#EFE8DC]'
                }`}
              />
              {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2B231D] mb-1">
                Compare-at Price (₹ INR)
              </label>
              <input
                type="number"
                min={1}
                step={1}
                value={values.compareAt}
                onChange={e => updateField('compareAt', e.target.value)}
                disabled={saving}
                placeholder="Optional (must exceed price)"
                className={`w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border text-sm text-[#2B231D] focus:outline-none focus:ring-2 focus:ring-[#BD6024]/30 ${
                  errors.compareAt ? 'border-red-400' : 'border-[#EFE8DC]'
                }`}
              />
              {errors.compareAt && (
                <p className="mt-1 text-xs text-red-600">{errors.compareAt}</p>
              )}
            </div>

            {mode === 'create' ? (
              <div>
                <label className="block text-xs font-semibold text-[#2B231D] mb-1">
                  Initial Stock Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={values.stock}
                  onChange={e => updateField('stock', e.target.value)}
                  disabled={saving}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border text-sm text-[#2B231D] focus:outline-none focus:ring-2 focus:ring-[#BD6024]/30 ${
                    errors.stock ? 'border-red-400' : 'border-[#EFE8DC]'
                  }`}
                />
                {errors.stock && <p className="mt-1 text-xs text-red-600">{errors.stock}</p>}
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-[#2B231D] mb-1">
                  Live Stock (Read-only here)
                </label>
                <div className="px-3.5 py-2.5 rounded-xl bg-[#EFE8DC]/50 border border-[#EFE8DC] text-sm font-semibold text-[#2B231D] flex items-center justify-between">
                  <span>{liveStock} units</span>
                  <span className="text-[11px] font-medium text-[#6E6359]">Transactional</span>
                </div>
                <p className="mt-1 text-[11px] text-[#82756A]">
                  Use the inventory panel below to update stock safely.
                </p>
              </div>
            )}
          </div>

          {/* Dimensions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-2 border-t border-[#EFE8DC]">
            <div>
              <label className="block text-xs font-semibold text-[#2B231D] mb-1">
                Width (cm) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={0.1}
                step="any"
                value={values.width}
                onChange={e => updateField('width', e.target.value)}
                disabled={saving}
                className={`w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border text-sm text-[#2B231D] focus:outline-none focus:ring-2 focus:ring-[#BD6024]/30 ${
                  errors.width ? 'border-red-400' : 'border-[#EFE8DC]'
                }`}
              />
              {errors.width && <p className="mt-1 text-xs text-red-600">{errors.width}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2B231D] mb-1">
                Depth (cm) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={0.1}
                step="any"
                value={values.depth}
                onChange={e => updateField('depth', e.target.value)}
                disabled={saving}
                className={`w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border text-sm text-[#2B231D] focus:outline-none focus:ring-2 focus:ring-[#BD6024]/30 ${
                  errors.depth ? 'border-red-400' : 'border-[#EFE8DC]'
                }`}
              />
              {errors.depth && <p className="mt-1 text-xs text-red-600">{errors.depth}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2B231D] mb-1">
                Height (cm) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={0.1}
                step="any"
                value={values.height}
                onChange={e => updateField('height', e.target.value)}
                disabled={saving}
                className={`w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border text-sm text-[#2B231D] focus:outline-none focus:ring-2 focus:ring-[#BD6024]/30 ${
                  errors.height ? 'border-red-400' : 'border-[#EFE8DC]'
                }`}
              />
              {errors.height && <p className="mt-1 text-xs text-red-600">{errors.height}</p>}
            </div>
          </div>

          {/* Description & Popular Toggle */}
          <div className="space-y-4 pt-2 border-t border-[#EFE8DC]">
            <div>
              <label className="block text-xs font-semibold text-[#2B231D] mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={values.description}
                onChange={e => updateField('description', e.target.value)}
                disabled={saving}
                placeholder="Describe craftsmanship, materials, proportions, and ideal room placement..."
                className={`w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border text-sm text-[#2B231D] focus:outline-none focus:ring-2 focus:ring-[#BD6024]/30 ${
                  errors.description ? 'border-red-400' : 'border-[#EFE8DC]'
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-600">{errors.description}</p>
              )}
            </div>

            <label className="inline-flex items-center gap-3 cursor-pointer select-none p-3 rounded-xl bg-[#FAF7F2] border border-[#EFE8DC]">
              <input
                type="checkbox"
                checked={values.isPopular}
                onChange={e => updateField('isPopular', e.target.checked)}
                disabled={saving}
                className="w-4 h-4 accent-[#BD6024] rounded"
              />
              <div>
                <span className="block text-xs font-semibold text-[#2B231D]">
                  Feature as Popular Product
                </span>
                <span className="block text-[11px] text-[#82756A]">
                  Prioritized in admin popularity sorting and storefront popular highlights.
                </span>
              </div>
            </label>
          </div>

          {/* Image Gallery Manager */}
          <div className="pt-2 border-t border-[#EFE8DC]">
            <ProductImageManager
              primaryImage={values.image}
              galleryImages={values.images}
              onChange={({ image, images }) => {
                setValues(prev => ({ ...prev, image, images }))
                setErrors(prev => {
                  const copy = { ...prev }
                  delete copy.image
                  delete copy.images
                  return copy
                })
              }}
              primaryError={errors.image}
              galleryError={errors.images}
              disabled={saving}
            />
          </div>

          {/* Edit Mode: Dedicated Transactional Inventory Section */}
          {mode === 'edit' && editingProduct && (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F2] border border-[#EFE8DC] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-[#2B231D]">
                    Safe Inventory Management (Transactional)
                  </h3>
                  <p className="text-xs text-[#6E6359]">
                    Executes an atomic Firestore transaction so checkout stock reservations are
                    never overwritten.
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    liveStock === 0
                      ? 'bg-red-100 text-red-700'
                      : liveStock <= 3
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  Live Stock: {liveStock}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {([-5, -1, 1, 5] as const).map(delta => (
                  <button
                    key={delta}
                    type="button"
                    disabled={stockSaving || liveStock + delta < 0 || !isLive}
                    onClick={() => handleDeltaStock(delta)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-[#EFE8DC] hover:border-[#BD6024] disabled:opacity-40 text-xs font-semibold text-[#2B231D] transition"
                  >
                    {delta > 0 ? `+${delta}` : delta}
                  </button>
                ))}

                <div className="flex items-center gap-2 ml-auto">
                  <input
                    type="number"
                    min={0}
                    max={100000}
                    step={1}
                    value={stockTargetInput}
                    onChange={e => {
                      if (!stockDirty) {
                        setStockBaseline(liveStock)
                        setStockDirty(true)
                      }
                      setStockTargetInput(e.target.value)
                      if (stockFeedback) setStockFeedback(null)
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleSetExactStock()
                      }
                    }}
                    disabled={stockSaving || !isLive}
                    className="w-24 px-3 py-1.5 rounded-xl bg-white border border-[#EFE8DC] text-xs font-semibold text-[#2B231D] focus:outline-none focus:ring-2 focus:ring-[#BD6024]/30"
                  />
                  {stockDirty && (
                    <button
                      type="button"
                      disabled={stockSaving}
                      onClick={() => {
                        setStockTargetInput(String(liveStock))
                        setStockBaseline(liveStock)
                        setStockDirty(false)
                        setStockFeedback(null)
                      }}
                      title="Discard draft and sync to current live stock"
                      className="px-2.5 py-1.5 rounded-xl bg-white border border-[#EFE8DC] hover:border-[#BD6024] text-xs font-semibold text-[#6E6359]"
                    >
                      Reset
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={stockSaving || !isLive}
                    onClick={handleSetExactStock}
                    className="px-3.5 py-1.5 rounded-xl bg-[#2B231D] hover:bg-[#3d322a] disabled:opacity-40 text-white text-xs font-semibold transition"
                  >
                    {stockSaving ? 'Updating...' : 'Set Stock'}
                  </button>
                </div>
              </div>

              {stockDirty && stockBaseline !== null && liveStock !== stockBaseline && (
                <p className="text-xs font-medium text-amber-800">
                  Live stock changed externally from {stockBaseline} to {liveStock} while editing.
                </p>
              )}

              {stockFeedback && (
                <p
                  className={`text-xs font-medium ${
                    stockFeedback.type === 'success' ? 'text-emerald-700' : 'text-red-600'
                  }`}
                >
                  {stockFeedback.text}
                </p>
              )}
            </div>
          )}

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-[#EFE8DC] flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving || stockSaving}
              className="px-5 py-2.5 rounded-xl border border-[#EFE8DC] bg-white hover:bg-[#FAF7F2] text-[#2B231D] text-xs sm:text-sm font-semibold transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || (mode === 'edit' && !isLive)}
              className="px-6 py-2.5 rounded-xl bg-[#BD6024] hover:bg-[#a5511c] disabled:opacity-50 text-white text-xs sm:text-sm font-semibold transition shadow-sm"
            >
              {saving
                ? mode === 'create'
                  ? 'Creating Product...'
                  : 'Saving Details...'
                : mode === 'create'
                ? 'Create Product'
                : 'Save Product Details'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
