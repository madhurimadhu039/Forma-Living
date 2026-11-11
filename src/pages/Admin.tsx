import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { writeBatch, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'
import { useProducts } from '../contexts/ProductContext'
import { products as staticProducts, categoryList, Product } from '../data/products'
import { formatPrice } from '../utils/format'
import {
  ConcurrentStockError,
  formatAdminFirestoreError,
  setProductArchivedStatus,
  updateProductStockInTransaction,
} from '../services/adminProducts'
import ProductFormModal from '../components/admin/ProductFormModal'

interface StockDraftEntry {
  value: string
  baselineStock: number
}

type StockFilter = 'all' | 'in-stock' | 'low-stock' | 'out-of-stock'
type StatusFilter = 'all' | 'active' | 'archived'
type SortOption =
  | 'name-asc'
  | 'name-desc'
  | 'price-asc'
  | 'price-desc'
  | 'stock-asc'
  | 'stock-desc'
  | 'popular'

const PAGE_SIZE = 20

export default function Admin() {
  const { user, isAdmin } = useAuth()
  const {
    allProducts,
    isLive,
    loading: catalogLoading,
    error: catalogError,
    categories,
  } = useProducts()

  const [adminVerified, setAdminVerified] = useState<boolean | null>(isAdmin)
  const [checkingAuth, setCheckingAuth] = useState(false)

  // Seeding section state (collapsed by default once Firestore is live)
  const [seedingExpanded, setSeedingExpanded] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [isSeeding, setIsSeeding] = useState(false)
  const [progressMsg, setProgressMsg] = useState('')
  const [successReport, setSuccessReport] = useState<{
    count: number
    batches: number
    timestamp: string
  } | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  // Product Management filter, sort & pagination state
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [stockFilter, setStockFilter] = useState<StockFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortBy, setSortBy] = useState<SortOption>('name-asc')
  const [currentPage, setCurrentPage] = useState(1)

  // Modal & row action states
  const [formModalState, setFormModalState] = useState<{
    open: boolean
    mode: 'create' | 'edit'
    productId: string | null
  }>({ open: false, mode: 'create', productId: null })
  const [archiveTarget, setArchiveTarget] = useState<Product | null>(null)
  const [archiving, setArchiving] = useState(false)
  const [stockBusyId, setStockBusyId] = useState<string | null>(null)
  const [stockDrafts, setStockDrafts] = useState<Record<string, StockDraftEntry>>({})
  const [actionNotice, setActionNotice] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  // Verify admin claim with force-refresh on mount or on demand
  const verifyAdminClaim = async () => {
    if (!user) {
      setAdminVerified(false)
      return false
    }
    setCheckingAuth(true)
    setErrorMsg('')
    try {
      const tokenResult = await user.getIdTokenResult(true)
      const hasAdminClaim = Boolean(tokenResult.claims.admin)
      setAdminVerified(hasAdminClaim)
      return hasAdminClaim
    } catch (err: any) {
      console.error('Failed to refresh token claims:', err)
      setAdminVerified(false)
      setErrorMsg(`Token refresh error: ${err.message || 'Unable to verify administrative claims.'}`)
      return false
    } finally {
      setCheckingAuth(false)
    }
  }

  useEffect(() => {
    verifyAdminClaim()
  }, [user])

  const ensureVerifiedAdmin = async (): Promise<boolean> => {
    if (!user) {
      setAdminVerified(false)
      setActionNotice({
        type: 'error',
        text: 'Authentication required: You must be signed in as an administrator.',
      })
      return false
    }
    if (adminVerified) return true
    const hasAdmin = await verifyAdminClaim()
    if (!hasAdmin) {
      setActionNotice({
        type: 'error',
        text: 'Permission denied: Your account does not currently have the verified Firebase custom claim "admin: true".',
      })
      return false
    }
    return true
  }

  // Keep live Editing Product synced from context so stock stays fresh
  const editingProduct = useMemo(() => {
    if (!formModalState.open || formModalState.mode !== 'edit' || !formModalState.productId) {
      return null
    }
    return allProducts.find(item => item.id === formModalState.productId) || null
  }, [allProducts, formModalState])

  const existingIds = useMemo(
    () => new Set(allProducts.map(item => item.id)),
    [allProducts]
  )

  const summaryStats = useMemo(() => {
    let active = 0
    let archived = 0
    let lowStock = 0
    let outOfStock = 0
    for (const item of allProducts) {
      if (item.archived) {
        archived += 1
      } else {
        active += 1
        if (item.stock <= 0) outOfStock += 1
        else if (item.stock <= 3) lowStock += 1
      }
    }
    return { total: allProducts.length, active, archived, lowStock, outOfStock }
  }, [allProducts])

  const filterCategories = useMemo(() => {
    const set = new Set(categories)
    for (const item of allProducts) {
      if (item.category) set.add(item.category)
    }
    return Array.from(set)
  }, [categories, allProducts])

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()

    const list = allProducts.filter(item => {
      if (categoryFilter !== 'all' && item.category !== categoryFilter) {
        return false
      }

      if (statusFilter === 'active' && item.archived) return false
      if (statusFilter === 'archived' && !item.archived) return false

      const stockQty = Number(item.stock ?? 0)
      if (stockFilter === 'in-stock' && stockQty <= 0) return false
      if (stockFilter === 'low-stock' && (stockQty <= 0 || stockQty > 3)) return false
      if (stockFilter === 'out-of-stock' && stockQty > 0) return false

      if (q) {
        const matches =
          item.name.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q) ||
          item.material.toLowerCase().includes(q) ||
          item.style.toLowerCase().includes(q)
        if (!matches) return false
      }

      return true
    })

    list.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name)
        case 'name-desc':
          return b.name.localeCompare(a.name)
        case 'price-asc':
          return a.price - b.price
        case 'price-desc':
          return b.price - a.price
        case 'stock-asc':
          return (a.stock ?? 0) - (b.stock ?? 0)
        case 'stock-desc':
          return (b.stock ?? 0) - (a.stock ?? 0)
        case 'popular': {
          const popDiff = Number(Boolean(b.isPopular)) - Number(Boolean(a.isPopular))
          if (popDiff !== 0) return popDiff
          return a.name.localeCompare(b.name)
        }
        default:
          return 0
      }
    })

    return list
  }, [allProducts, searchQuery, categoryFilter, stockFilter, statusFilter, sortBy])

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE))

  // Reset to page 1 when filters or sort change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, categoryFilter, stockFilter, statusFilter, sortBy])

  // Clamp current page if filtered count shrinks
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredProducts.slice(start, start + PAGE_SIZE)
  }, [filteredProducts, currentPage])

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    categoryFilter !== 'all' ||
    stockFilter !== 'all' ||
    statusFilter !== 'all'

  const resetFilters = () => {
    setSearchQuery('')
    setCategoryFilter('all')
    setStockFilter('all')
    setStatusFilter('all')
  }

  const clearStockDraft = (productId: string) => {
    setStockDrafts(prev => {
      if (!(productId in prev)) return prev
      const next = { ...prev }
      delete next[productId]
      return next
    })
  }

  const handleQuickStockDelta = async (product: Product, delta: number) => {
    if (stockBusyId) return
    if (!isLive) {
      setActionNotice({
        type: 'error',
        text: 'Firestore is not seeded yet. Seed products before updating inventory.',
      })
      return
    }
    if (!(await ensureVerifiedAdmin())) return

    setStockBusyId(product.id)
    setActionNotice(null)
    try {
      const nextStock = await updateProductStockInTransaction(product.id, {
        mode: 'delta',
        delta,
      })
      clearStockDraft(product.id)
      setActionNotice({
        type: 'success',
        text: `Updated "${product.name}" stock to ${nextStock} units.`,
      })
    } catch (err) {
      setActionNotice({
        type: 'error',
        text: formatAdminFirestoreError(err),
      })
    } finally {
      setStockBusyId(null)
    }
  }

  const handleRowStockSet = async (product: Product) => {
    if (stockBusyId) return
    if (!isLive) {
      setActionNotice({
        type: 'error',
        text: 'Firestore is not seeded yet. Seed products before updating inventory.',
      })
      return
    }
    const draftEntry = stockDrafts[product.id]
    if (!draftEntry) return
    const parsed = Number(draftEntry.value.trim())
    if (!draftEntry.value.trim() || !Number.isInteger(parsed) || parsed < 0 || parsed > 100000) {
      setActionNotice({
        type: 'error',
        text: `Invalid stock quantity for "${product.name}". Enter a whole number (0 – 1,00,000).`,
      })
      return
    }
    if (!(await ensureVerifiedAdmin())) return

    setStockBusyId(product.id)
    setActionNotice(null)
    try {
      const nextStock = await updateProductStockInTransaction(product.id, {
        mode: 'set',
        stock: parsed,
        expectedStock: draftEntry.baselineStock,
      })
      clearStockDraft(product.id)
      setActionNotice({
        type: 'success',
        text: `Set "${product.name}" stock to ${nextStock} units.`,
      })
    } catch (err) {
      if (err instanceof ConcurrentStockError) {
        setStockDrafts(prev =>
          prev[product.id]
            ? {
                ...prev,
                [product.id]: {
                  value: prev[product.id].value,
                  baselineStock: err.currentStock,
                },
              }
            : prev
        )
      }
      setActionNotice({
        type: 'error',
        text: formatAdminFirestoreError(err),
      })
    } finally {
      setStockBusyId(null)
    }
  }

  const handleConfirmArchiveToggle = async () => {
    if (!archiveTarget || archiving) return
    if (!isLive) {
      setActionNotice({
        type: 'error',
        text: 'Firestore is not seeded yet. Seed products before archiving or restoring items.',
      })
      setArchiveTarget(null)
      return
    }
    if (!(await ensureVerifiedAdmin())) return

    const nextArchived = !Boolean(archiveTarget.archived)
    setArchiving(true)
    setActionNotice(null)
    try {
      await setProductArchivedStatus(archiveTarget.id, nextArchived)
      setActionNotice({
        type: 'success',
        text: nextArchived
          ? `Archived "${archiveTarget.name}". It is now hidden from customers.`
          : `Restored "${archiveTarget.name}". It is now active on the storefront.`,
      })
      setArchiveTarget(null)
    } catch (err) {
      setActionNotice({
        type: 'error',
        text: formatAdminFirestoreError(err),
      })
    } finally {
      setArchiving(false)
    }
  }

  // Sanitize product object to prevent writing undefined values to Firestore
  const sanitizeProduct = (p: Product) => {
    const cleanData: Record<string, any> = {
      id: p.id,
      name: p.name,
      category: p.category,
      style: p.style,
      color: p.color,
      material: p.material,
      price: Number(p.price),
      stock: Number(p.stock ?? 10),
      width: Number(p.width),
      depth: Number(p.depth),
      height: Number(p.height),
      description: p.description,
      image: p.image,
      images: p.images && p.images.length > 0 ? p.images : [p.image],
      isPopular: Boolean(p.isPopular),
      updatedAt: serverTimestamp(),
    }

    if (p.compareAt !== undefined && p.compareAt !== null) {
      cleanData.compareAt = Number(p.compareAt)
    }

    return cleanData
  }

  // Execute safe, idempotent batch seeding
  const handleSeedProducts = async () => {
    setErrorMsg('')
    setSuccessReport(null)

    if (!user) {
      setErrorMsg('Authentication required: You must be logged in as an administrator.')
      return
    }

    if (!confirmed) {
      setErrorMsg('Please confirm the seeding operation by checking the confirmation box below.')
      return
    }

    // 1. Force-refresh token and verify admin claim before executing
    setProgressMsg('Verifying administrative security claims with Firebase Auth...')
    const hasAdmin = await verifyAdminClaim()
    if (!hasAdmin) {
      setErrorMsg(
        'Permission denied: Your account does not currently have the verified Firebase custom claim "admin: true". Please run the offline script functions/set-admin.js first.'
      )
      setProgressMsg('')
      return
    }

    setIsSeeding(true)
    setProgressMsg('Preparing product batches...')

    try {
      const BATCH_SIZE = 50
      const batches: Product[][] = []
      for (let i = 0; i < staticProducts.length; i += BATCH_SIZE) {
        batches.push(staticProducts.slice(i, i + BATCH_SIZE))
      }

      let seededCount = 0

      // 2. Commit each batch sequentially
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const currentBatchItems = batches[batchIndex]
        const batchNum = batchIndex + 1
        const totalBatches = batches.length

        setProgressMsg(
          `Writing batch ${batchNum} of ${totalBatches} (${currentBatchItems.length} products)...`
        )

        const batch = writeBatch(db)

        for (const item of currentBatchItems) {
          const docRef = doc(db, 'products', item.id)
          const data = sanitizeProduct(item)
          // merge: true guarantees idempotency without duplicates
          batch.set(docRef, data, { merge: true })
        }

        try {
          await batch.commit()
          seededCount += currentBatchItems.length
        } catch (batchErr: any) {
          // If any batch fails, immediately halt and report error
          console.error(`Batch ${batchNum} failed:`, batchErr)
          throw new Error(
            `Failed during batch ${batchNum}/${totalBatches} (${batchErr.code || batchErr.message}). ${seededCount} of ${staticProducts.length} products were committed before error.`
          )
        }
      }

      // 3. All batches completed successfully
      setSuccessReport({
        count: seededCount,
        batches: batches.length,
        timestamp: new Date().toLocaleTimeString(),
      })
      setProgressMsg('')
      setConfirmed(false)
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during product seeding.')
      setProgressMsg('')
    } finally {
      setIsSeeding(false)
    }
  }

  const showingFrom = filteredProducts.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
  const showingTo = Math.min(filteredProducts.length, currentPage * PAGE_SIZE)

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#EFE8DC] text-xs font-semibold text-[#2B231D] hover:bg-[#FCEEE2] hover:text-[#BD6024] hover:border-[#BD6024]/50 shadow-2xs transition group"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-3.5 h-3.5 text-[#BD6024] group-hover:-translate-x-1 transition-transform"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Back to Home</span>
        </Link>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FAF7F2] border border-[#E7DFD5] text-[#6E6359]">
          Forma Living Admin Portal
        </span>
      </div>

      {/* Main Header Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-[#EFE8DC] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#EFE8DC]">
          <div>
            <h1 className="font-sans font-bold text-2xl sm:text-3xl text-[#2B231D]">
              Admin Dashboard
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#82756A]">
              Manage Forma Living products, transactional inventory, and catalogue visibility.
            </p>
          </div>

          {/* Admin Identity Status */}
          <div className="flex items-center gap-3 bg-[#FAF7F2] px-4 py-3 rounded-2xl border border-[#EFE8DC]">
            <div className="w-10 h-10 rounded-full bg-[#FCEEE2] text-[#BD6024] font-bold flex items-center justify-center text-sm border border-[#BD6024]/30 shrink-0">
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-[#82756A] uppercase tracking-wider">
                Logged in as
              </p>
              <p className="text-xs sm:text-sm font-bold text-[#2B231D] truncate max-w-[200px]">
                {user?.email}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`inline-block w-2 h-2 rounded-full ${
                    adminVerified ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
                <span className="text-[11px] font-medium text-[#6E6359]">
                  {adminVerified ? 'Admin Claim Verified' : 'Standard User (No Admin Claim)'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Claim Status & Token Refresh Action */}
        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <p className="text-[#82756A]">
            Firestore write operations require the custom token claim{' '}
            <code className="bg-[#FAF7F2] px-1.5 py-0.5 rounded text-[#BD6024] font-semibold border border-[#EFE8DC]">
              admin: true
            </code>
            .
          </p>
          <button
            type="button"
            onClick={verifyAdminClaim}
            disabled={checkingAuth || isSeeding}
            className="px-3 py-1.5 rounded-xl border border-[#E7DFD5] bg-white hover:bg-[#FCEEE2] text-[#2B231D] font-semibold transition shrink-0 disabled:opacity-50"
          >
            {checkingAuth ? 'Refreshing Token…' : '↻ Force Refresh Token'}
          </button>
        </div>
      </div>

      {/* Product Management Section */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-[#EFE8DC] shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="font-sans font-bold text-xl sm:text-2xl text-[#2B231D]">
                Product Management
              </h2>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                  isLive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                {catalogLoading
                  ? 'Connecting...'
                  : isLive
                  ? 'Live Firestore Sync'
                  : 'Static Fallback Mode'}
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-[#82756A]">
              Add, edit, archive, restore, and safely adjust stock across all active and archived
              products.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setFormModalState({ open: true, mode: 'create', productId: null })}
            className="px-5 py-3 rounded-xl bg-[#BD6024] hover:bg-[#a5511c] text-white font-semibold text-xs sm:text-sm shadow-sm transition shrink-0 inline-flex items-center justify-center gap-2"
          >
            <span>+</span>
            <span>Add Product</span>
          </button>
        </div>

        {/* Summary KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EFE8DC]">
            <p className="text-[11px] font-semibold text-[#82756A] uppercase tracking-wider">
              Total Catalogue
            </p>
            <p className="mt-1 text-xl font-bold text-[#2B231D]">{summaryStats.total}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EFE8DC]">
            <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
              Active Storefront
            </p>
            <p className="mt-1 text-xl font-bold text-[#2B231D]">{summaryStats.active}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EFE8DC]">
            <p className="text-[11px] font-semibold text-[#6E6359] uppercase tracking-wider">
              Archived
            </p>
            <p className="mt-1 text-xl font-bold text-[#2B231D]">{summaryStats.archived}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EFE8DC]">
            <p className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">
              Low Stock (1–3)
            </p>
            <p className="mt-1 text-xl font-bold text-[#2B231D]">{summaryStats.lowStock}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EFE8DC] col-span-2 sm:col-span-1">
            <p className="text-[11px] font-semibold text-red-700 uppercase tracking-wider">
              Out of Stock
            </p>
            <p className="mt-1 text-xl font-bold text-[#2B231D]">{summaryStats.outOfStock}</p>
          </div>
        </div>

        {/* Environment / Feedback Banners */}
        {!catalogLoading && !isLive && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-amber-900">
            <strong>Firestore Collection Empty:</strong> Currently displaying the{' '}
            {staticProducts.length} static catalogue fallback products. Editing, archiving, or
            updating stock requires Firestore documents — seed initial products in Maintenance below
            if Firestore has not been initialized yet.
          </div>
        )}

        {catalogError && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-700">
            {catalogError}
          </div>
        )}

        {actionNotice && (
          <div
            className={`p-3.5 rounded-2xl border text-xs sm:text-sm flex items-center justify-between gap-3 ${
              actionNotice.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <span>{actionNotice.text}</span>
            <button
              type="button"
              onClick={() => setActionNotice(null)}
              className="text-xs font-bold opacity-70 hover:opacity-100 px-1.5"
            >
              &times;
            </button>
          </div>
        )}

        {/* Search, Filter & Sort Toolbar */}
        <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EFE8DC] space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-5 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by name, ID, material, or style..."
                className="w-full px-3.5 py-2.5 pr-9 rounded-xl bg-white border border-[#EFE8DC] text-xs sm:text-sm text-[#2B231D] placeholder:text-[#A39589] focus:outline-none focus:ring-2 focus:ring-[#BD6024]/30"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#82756A] hover:text-[#2B231D] text-sm font-bold px-1"
                >
                  &times;
                </button>
              )}
            </div>

            <div className="md:col-span-2">
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                aria-label="Filter by category"
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#EFE8DC] text-xs sm:text-sm text-[#2B231D] focus:outline-none focus:ring-2 focus:ring-[#BD6024]/30"
              >
                <option value="all">All Categories</option>
                {filterCategories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <select
                value={stockFilter}
                onChange={e => setStockFilter(e.target.value as StockFilter)}
                aria-label="Filter by stock status"
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#EFE8DC] text-xs sm:text-sm text-[#2B231D] focus:outline-none focus:ring-2 focus:ring-[#BD6024]/30"
              >
                <option value="all">All Stock Levels</option>
                <option value="in-stock">In Stock (&gt; 0)</option>
                <option value="low-stock">Low Stock (1–3)</option>
                <option value="out-of-stock">Out of Stock (0)</option>
              </select>
            </div>

            <div className="md:col-span-1 lg:col-span-1">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as StatusFilter)}
                aria-label="Filter by archive status"
                className="w-full px-2.5 py-2.5 rounded-xl bg-white border border-[#EFE8DC] text-xs sm:text-sm text-[#2B231D] focus:outline-none focus:ring-2 focus:ring-[#BD6024]/30"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as SortOption)}
                aria-label="Sort products"
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#EFE8DC] text-xs sm:text-sm text-[#2B231D] focus:outline-none focus:ring-2 focus:ring-[#BD6024]/30"
              >
                <option value="name-asc">Sort: Name (A–Z)</option>
                <option value="name-desc">Sort: Name (Z–A)</option>
                <option value="price-asc">Sort: Price (Low–High)</option>
                <option value="price-desc">Sort: Price (High–Low)</option>
                <option value="stock-asc">Sort: Stock (Low–High)</option>
                <option value="stock-desc">Sort: Stock (High–Low)</option>
                <option value="popular">Sort: Popular First</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#6E6359]">
            <span>
              Showing <strong>{showingFrom}</strong>–<strong>{showingTo}</strong> of{' '}
              <strong>{filteredProducts.length}</strong> matching products (20 per page)
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="font-semibold text-[#BD6024] hover:underline"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>

        {/* Desktop Table View */}
        {paginatedProducts.length === 0 ? (
          <div className="py-12 text-center rounded-2xl bg-[#FAF7F2] border border-[#EFE8DC] px-4">
            <p className="text-sm font-semibold text-[#2B231D]">No matching products found</p>
            <p className="mt-1 text-xs text-[#82756A]">
              Try adjusting your search keywords, category, stock filter, or archive status.
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 px-4 py-2 rounded-xl bg-white border border-[#EFE8DC] hover:border-[#BD6024] text-xs font-semibold text-[#2B231D] transition"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="hidden lg:block overflow-x-auto rounded-2xl border border-[#EFE8DC]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FAF7F2] border-b border-[#EFE8DC] text-[11px] uppercase tracking-wider text-[#6E6359] font-semibold">
                    <th className="py-3.5 px-4">Product</th>
                    <th className="py-3.5 px-3">Category</th>
                    <th className="py-3.5 px-3">Price</th>
                    <th className="py-3.5 px-3">Stock Inventory</th>
                    <th className="py-3.5 px-3">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFE8DC] text-sm">
                  {paginatedProducts.map(item => {
                    const liveItemStock = item.stock ?? 0
                    const draftEntry = stockDrafts[item.id]
                    const draftValue = draftEntry ? draftEntry.value : String(liveItemStock)
                    const isDraftDirty = Boolean(
                      draftEntry && draftEntry.value !== String(liveItemStock)
                    )
                    const stockChangedExternally = Boolean(
                      draftEntry && draftEntry.baselineStock !== liveItemStock
                    )
                    const isBusy = stockBusyId === item.id
                    const galleryCount = item.images?.length || 1

                    return (
                      <tr
                        key={item.id}
                        className={`transition-colors ${
                          item.archived ? 'bg-[#FAF7F2]/60' : 'hover:bg-[#FAF7F2]/50'
                        }`}
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3 min-w-[260px]">
                            <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#FAF7F2] border border-[#EFE8DC] shrink-0">
                              <img
                                src={item.image}
                                alt={item.name}
                                className={`w-full h-full object-cover ${
                                  item.archived ? 'opacity-60 grayscale-[35%]' : ''
                                }`}
                                onError={e => {
                                  e.currentTarget.src = '/images/hero-living-room.jpg'
                                }}
                              />
                              {galleryCount > 1 && (
                                <span className="absolute bottom-1 right-1 px-1.5 py-0.2 rounded bg-black/70 text-white text-[10px] font-medium">
                                  {galleryCount}
                                </span>
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-semibold text-[#2B231D] truncate max-w-[220px]">
                                  {item.name}
                                </span>
                                {item.isPopular && (
                                  <span className="px-2 py-0.5 rounded-full bg-[#FCEEE2] text-[#BD6024] text-[10px] font-semibold">
                                    Popular
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] font-mono text-[#82756A] truncate">
                                {item.id}
                              </p>
                              <p className="text-[11px] text-[#6E6359] truncate max-w-[250px]">
                                {item.style} &bull; {item.material}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-3 text-xs font-medium text-[#2B231D] whitespace-nowrap">
                          {item.category}
                        </td>

                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <div className="font-bold text-[#2B231D] text-sm">
                            {formatPrice(item.price)}
                          </div>
                          {item.compareAt && item.compareAt > item.price && (
                            <div className="text-[11px] text-[#82756A] line-through">
                              {formatPrice(item.compareAt)}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                disabled={!isLive || isBusy || liveItemStock <= 0}
                                onClick={() => handleQuickStockDelta(item, -1)}
                                title="Decrease stock by 1"
                                className="w-7 h-7 rounded-lg bg-[#FAF7F2] border border-[#EFE8DC] hover:border-[#BD6024] disabled:opacity-40 text-xs font-bold text-[#2B231D]"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min={0}
                                max={100000}
                                step={1}
                                value={draftValue}
                                disabled={!isLive || isBusy}
                                onChange={e => {
                                  const nextVal = e.target.value
                                  setStockDrafts(prev => ({
                                    ...prev,
                                    [item.id]: {
                                      value: nextVal,
                                      baselineStock: prev[item.id]?.baselineStock ?? liveItemStock,
                                    },
                                  }))
                                }}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    handleRowStockSet(item)
                                  }
                                }}
                                aria-label={`Stock for ${item.name}`}
                                className={`w-16 px-2 py-1 rounded-lg border text-center text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#BD6024]/30 ${
                                  liveItemStock === 0
                                    ? 'bg-red-50 border-red-200 text-red-700'
                                    : liveItemStock <= 3
                                    ? 'bg-amber-50 border-amber-200 text-amber-800'
                                    : 'bg-white border-[#EFE8DC] text-[#2B231D]'
                                }`}
                              />
                              <button
                                type="button"
                                disabled={!isLive || isBusy}
                                onClick={() => handleQuickStockDelta(item, 1)}
                                title="Increase stock by 1"
                                className="w-7 h-7 rounded-lg bg-[#FAF7F2] border border-[#EFE8DC] hover:border-[#BD6024] disabled:opacity-40 text-xs font-bold text-[#2B231D]"
                              >
                                +
                              </button>
                              {isDraftDirty && (
                                <button
                                  type="button"
                                  disabled={!isLive || isBusy}
                                  onClick={() => handleRowStockSet(item)}
                                  className="px-2 py-1 rounded-lg bg-[#2B231D] hover:bg-[#3d322a] text-white text-[11px] font-semibold transition"
                                >
                                  {isBusy ? '...' : 'Set'}
                                </button>
                              )}
                              {draftEntry && (
                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() => clearStockDraft(item.id)}
                                  title="Reset draft to live stock"
                                  className="px-1.5 py-1 rounded-lg border border-[#EFE8DC] bg-white hover:bg-[#FAF7F2] text-[11px] text-[#6E6359]"
                                >
                                  &#8634;
                                </button>
                              )}
                            </div>
                            {stockChangedExternally && (
                              <p className="text-[11px] font-medium text-amber-800">
                                Live stock changed: {liveItemStock} (was {draftEntry?.baselineStock})
                              </p>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                              item.archived
                                ? 'bg-stone-200/80 text-stone-700'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                item.archived ? 'bg-stone-500' : 'bg-emerald-500'
                              }`}
                            />
                            {item.archived ? 'Archived' : 'Active'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setFormModalState({
                                  open: true,
                                  mode: 'edit',
                                  productId: item.id,
                                })
                              }
                              className="px-3 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#EFE8DC] hover:border-[#BD6024] hover:text-[#BD6024] text-xs font-semibold text-[#2B231D] transition"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              disabled={!isLive}
                              onClick={() => setArchiveTarget(item)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition disabled:opacity-40 ${
                                item.archived
                                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                                  : 'bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100'
                              }`}
                            >
                              {item.archived ? 'Restore' : 'Archive'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile & Tablet Card View */}
            <div className="lg:hidden space-y-3">
              {paginatedProducts.map(item => {
                const liveItemStock = item.stock ?? 0
                const draftEntry = stockDrafts[item.id]
                const draftValue = draftEntry ? draftEntry.value : String(liveItemStock)
                const isDraftDirty = Boolean(
                  draftEntry && draftEntry.value !== String(liveItemStock)
                )
                const stockChangedExternally = Boolean(
                  draftEntry && draftEntry.baselineStock !== liveItemStock
                )
                const isBusy = stockBusyId === item.id

                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl border p-4 space-y-3 ${
                      item.archived
                        ? 'bg-[#FAF7F2]/70 border-[#EFE8DC]'
                        : 'bg-white border-[#EFE8DC]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className={`w-16 h-16 rounded-xl object-cover bg-[#FAF7F2] border border-[#EFE8DC] shrink-0 ${
                          item.archived ? 'opacity-60 grayscale-[35%]' : ''
                        }`}
                        onError={e => {
                          e.currentTarget.src = '/images/hero-living-room.jpg'
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-sm text-[#2B231D] leading-snug">
                            {item.name}
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${
                              item.archived
                                ? 'bg-stone-200 text-stone-700'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {item.archived ? 'Archived' : 'Active'}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-[#82756A] truncate">{item.id}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#6E6359]">
                          <span>{item.category}</span>
                          <span>&bull;</span>
                          <span className="font-bold text-[#2B231D]">
                            {formatPrice(item.price)}
                          </span>
                          {item.compareAt && item.compareAt > item.price && (
                            <span className="line-through text-[11px] text-[#82756A]">
                              {formatPrice(item.compareAt)}
                            </span>
                          )}
                          {item.isPopular && (
                            <span className="px-2 py-0.5 rounded-full bg-[#FCEEE2] text-[#BD6024] text-[10px] font-semibold">
                              Popular
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#EFE8DC] flex flex-wrap items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium text-[#6E6359] mr-1">Stock:</span>
                          <button
                            type="button"
                            disabled={!isLive || isBusy || liveItemStock <= 0}
                            onClick={() => handleQuickStockDelta(item, -1)}
                            className="w-7 h-7 rounded-lg bg-[#FAF7F2] border border-[#EFE8DC] text-xs font-bold disabled:opacity-40"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min={0}
                            max={100000}
                            step={1}
                            value={draftValue}
                            disabled={!isLive || isBusy}
                            onChange={e => {
                              const nextVal = e.target.value
                              setStockDrafts(prev => ({
                                ...prev,
                                [item.id]: {
                                  value: nextVal,
                                  baselineStock: prev[item.id]?.baselineStock ?? liveItemStock,
                                },
                              }))
                            }}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                handleRowStockSet(item)
                              }
                            }}
                            aria-label={`Stock for ${item.name}`}
                            className="w-16 px-2 py-1 rounded-lg bg-[#FAF7F2] border border-[#EFE8DC] text-center text-xs font-semibold text-[#2B231D]"
                          />
                          <button
                            type="button"
                            disabled={!isLive || isBusy}
                            onClick={() => handleQuickStockDelta(item, 1)}
                            className="w-7 h-7 rounded-lg bg-[#FAF7F2] border border-[#EFE8DC] text-xs font-bold disabled:opacity-40"
                          >
                            +
                          </button>
                          {isDraftDirty && (
                            <button
                              type="button"
                              disabled={!isLive || isBusy}
                              onClick={() => handleRowStockSet(item)}
                              className="px-2.5 py-1 rounded-lg bg-[#2B231D] text-white text-[11px] font-semibold"
                            >
                              {isBusy ? '...' : 'Set'}
                            </button>
                          )}
                          {draftEntry && (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => clearStockDraft(item.id)}
                              title="Reset draft to live stock"
                              className="px-1.5 py-1 rounded-lg border border-[#EFE8DC] bg-[#FAF7F2] text-[11px] text-[#6E6359]"
                            >
                              &#8634;
                            </button>
                          )}
                        </div>
                        {stockChangedExternally && (
                          <p className="text-[11px] font-medium text-amber-800">
                            Live stock changed: {liveItemStock} (was {draftEntry?.baselineStock})
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 ml-auto">
                        <button
                          type="button"
                          onClick={() =>
                            setFormModalState({
                              open: true,
                              mode: 'edit',
                              productId: item.id,
                            })
                          }
                          className="px-3.5 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#EFE8DC] text-xs font-semibold text-[#2B231D]"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={!isLive}
                          onClick={() => setArchiveTarget(item)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold disabled:opacity-40 ${
                            item.archived
                              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                              : 'bg-amber-50 border border-amber-200 text-amber-900'
                          }`}
                        >
                          {item.archived ? 'Restore' : 'Archive'}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-[#82756A]">
                  Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                </p>

                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-xl border border-[#EFE8DC] bg-white hover:bg-[#FAF7F2] disabled:opacity-40 text-xs font-semibold text-[#2B231D] transition"
                  >
                    &larr; Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-xl text-xs font-semibold transition ${
                        page === currentPage
                          ? 'bg-[#BD6024] text-white shadow-xs'
                          : 'bg-[#FAF7F2] border border-[#EFE8DC] text-[#2B231D] hover:border-[#BD6024]'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className="px-3 py-1.5 rounded-xl border border-[#EFE8DC] bg-white hover:bg-[#FAF7F2] disabled:opacity-40 text-xs font-semibold text-[#2B231D] transition"
                  >
                    Next &rarr;
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Collapsible Secondary Maintenance: Initial Firestore Seeding */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-[#EFE8DC] shadow-sm">
        <button
          type="button"
          onClick={() => setSeedingExpanded(prev => !prev)}
          className="w-full flex items-center justify-between gap-4 text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FCEEE2] text-[#BD6024] flex items-center justify-center shrink-0">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </div>
            <div>
              <h2 className="font-sans font-bold text-base sm:text-lg text-[#2B231D]">
                Database Maintenance: Initial Firestore Product Seeding
              </h2>
              <p className="text-xs text-[#82756A]">
                Migrate static catalogue defaults into Firestore collection{' '}
                <code className="text-[#BD6024] font-semibold">products/{'{id}'}</code>{' '}
                {isLive ? '(Collapsed — Firestore is already live)' : '(Available for initial setup)'}
              </p>
            </div>
          </div>

          <span className="px-3 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#EFE8DC] text-xs font-semibold text-[#2B231D] shrink-0">
            {seedingExpanded ? 'Hide' : 'Expand'}
          </span>
        </button>

        {seedingExpanded && (
          <div className="mt-5 pt-5 border-t border-[#EFE8DC]">
            <div className="mb-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
              <strong>Caution:</strong> Running bulk seeding merges static catalogue defaults from{' '}
              <code>src/data/products.ts</code> into existing documents by ID and will overwrite
              live price, stock, and metadata edits for those 143 items.
            </div>

            {/* Dataset Summary */}
            <div className="my-5 p-4 rounded-2xl bg-[#FAF7F2] border border-[#EFE8DC]">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#EFE8DC]">
                <span className="font-bold text-sm text-[#2B231D]">Static Seed Dataset</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#BD6024]/10 text-[#BD6024] text-xs font-bold">
                  {staticProducts.length} Products Available
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-xs">
                {categoryList.map(cat => {
                  const count = staticProducts.filter(p => p.category === cat.name).length
                  return (
                    <div
                      key={cat.name}
                      className="bg-white p-2.5 rounded-xl border border-[#EFE8DC] flex flex-col justify-between"
                    >
                      <span className="text-[#82756A] text-[11px] truncate">{cat.name}</span>
                      <span className="font-bold text-sm text-[#2B231D] mt-0.5">{count} items</span>
                    </div>
                  )
                })}
              </div>

              <div className="mt-4 pt-3 border-t border-[#EFE8DC] text-[11px] text-[#6E6359] space-y-1">
                <p>
                  &#10003; <strong>Stable Document IDs:</strong> Preserves exact slugs (e.g.{' '}
                  <code>products/cozy-armchair</code>).
                </p>
                <p>
                  &#10003; <strong>Idempotent Merge:</strong> Uses{' '}
                  <code>batch.set(..., &#123; merge: true &#125;)</code> to update in place without
                  creating duplicates.
                </p>
                <p>
                  &#10003; <strong>Safe Sanitization:</strong> Prevents writing undefined values to
                  Firestore.
                </p>
              </div>
            </div>

            {progressMsg && (
              <div className="p-3.5 mb-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-center gap-2">
                <span className="animate-spin text-sm">⏳</span>
                <span>{progressMsg}</span>
              </div>
            )}

            {successReport && (
              <div className="p-4 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-800 mb-1">
                  <span>✓</span>
                  <span>Seeding Completed Successfully</span>
                </div>
                <p>
                  Successfully wrote <strong>{successReport.count} products</strong> across{' '}
                  <strong>{successReport.batches} batches</strong> to Cloud Firestore at{' '}
                  {successReport.timestamp}.
                </p>
              </div>
            )}

            {errorMsg && (
              <div className="p-4 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs">
                <div className="flex items-center gap-2 font-bold text-sm text-red-700 mb-1">
                  <span>⚠</span>
                  <span>Operation Error</span>
                </div>
                <p>{errorMsg}</p>
              </div>
            )}

            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#2B231D] mb-4 select-none">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={e => setConfirmed(e.target.checked)}
                  disabled={isSeeding}
                  className="mt-0.5 w-4 h-4 rounded text-[#BD6024] focus:ring-[#BD6024] border-[#E7DFD5]"
                />
                <span>
                  I confirm that I want to seed <strong>{staticProducts.length} products</strong>{' '}
                  into the Cloud Firestore <code>products</code> collection.
                </span>
              </label>

              <button
                type="button"
                onClick={handleSeedProducts}
                disabled={!confirmed || isSeeding}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#BD6024] hover:bg-[#a5511c] disabled:opacity-40 text-white font-semibold text-xs sm:text-sm shadow-sm transition flex items-center justify-center gap-2"
              >
                {isSeeding ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>Seeding Products in Progress…</span>
                  </>
                ) : (
                  <span>Start Product Seeding ({staticProducts.length} items)</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      <ProductFormModal
        isOpen={formModalState.open}
        mode={formModalState.mode}
        editingProduct={editingProduct}
        categories={categories}
        existingIds={existingIds}
        isLive={isLive}
        onBeforeWrite={ensureVerifiedAdmin}
        onClose={() => setFormModalState({ open: false, mode: 'create', productId: null })}
        onSaved={message => {
          setFormModalState({ open: false, mode: 'create', productId: null })
          setActionNotice({ type: 'success', text: message })
        }}
        onStockUpdated={message => {
          setActionNotice({ type: 'success', text: message })
        }}
      />

      {/* Archive / Restore Confirmation Modal */}
      {archiveTarget && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[1px] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => {
            if (!archiving) setArchiveTarget(null)
          }}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl sm:rounded-3xl p-6 border border-[#EFE8DC] shadow-2xl space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#BD6024]">
                {archiveTarget.archived ? 'Restore Catalogue Item' : 'Archive Catalogue Item'}
              </p>
              <h3 className="text-lg font-bold text-[#2B231D]">
                {archiveTarget.archived
                  ? `Restore "${archiveTarget.name}"?`
                  : `Archive "${archiveTarget.name}"?`}
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-[#6E6359] leading-relaxed">
              {archiveTarget.archived
                ? 'Restoring sets archived: false and makes this product visible again across the storefront, search results, and customer recommendations.'
                : 'Archiving sets archived: true without deleting the product document. It will immediately be hidden from the storefront, search, homepage, and wishlist, and can be restored anytime.'}
            </p>

            <div className="pt-2 flex flex-col-reverse sm:flex-row justify-end gap-2.5">
              <button
                type="button"
                disabled={archiving}
                onClick={() => setArchiveTarget(null)}
                className="px-4 py-2 rounded-xl border border-[#EFE8DC] bg-white hover:bg-[#FAF7F2] text-xs font-semibold text-[#2B231D]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={archiving}
                onClick={handleConfirmArchiveToggle}
                className={`px-5 py-2 rounded-xl text-xs font-semibold text-white transition disabled:opacity-50 ${
                  archiveTarget.archived
                    ? 'bg-emerald-700 hover:bg-emerald-800'
                    : 'bg-[#BD6024] hover:bg-[#a5511c]'
                }`}
              >
                {archiving
                  ? 'Saving...'
                  : archiveTarget.archived
                  ? 'Confirm Restore'
                  : 'Confirm Archive'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
