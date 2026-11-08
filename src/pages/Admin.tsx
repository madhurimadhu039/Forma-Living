import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { writeBatch, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'
import { products, categoryList, Product } from '../data/products'

export default function Admin() {
  const { user, isAdmin } = useAuth()
  const [adminVerified, setAdminVerified] = useState<boolean | null>(isAdmin)
  const [checkingAuth, setCheckingAuth] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [isSeeding, setIsSeeding] = useState(false)
  const [progressMsg, setProgressMsg] = useState('')
  const [successReport, setSuccessReport] = useState<{
    count: number
    batches: number
    timestamp: string
  } | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

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
      for (let i = 0; i < products.length; i += BATCH_SIZE) {
        batches.push(products.slice(i, i + BATCH_SIZE))
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
            `Failed during batch ${batchNum}/${totalBatches} (${batchErr.code || batchErr.message}). ${seededCount} of ${products.length} products were committed before error.`
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

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-12">
      {/* Top Navigation */}
      <div className="mb-6 flex items-center justify-between">
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
      <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-[#EFE8DC] shadow-sm mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#EFE8DC]">
          <div>
            <h1 className="font-sans font-bold text-2xl sm:text-3xl text-[#2B231D]">
              Admin Dashboard
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#82756A]">
              Manage catalogue, inventory, and Firestore database synchronization.
            </p>
          </div>

          {/* Admin Identity Status */}
          <div className="flex items-center gap-3 bg-[#FAF7F2] px-4 py-3 rounded-2xl border border-[#EFE8DC]">
            <div className="w-10 h-10 rounded-full bg-[#FCEEE2] text-[#BD6024] font-bold flex items-center justify-center text-sm border border-[#BD6024]/30">
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

      {/* Product Seeding Section */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-[#EFE8DC] shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-[#FCEEE2] text-[#BD6024] flex items-center justify-center">
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
            <h2 className="font-sans font-bold text-lg sm:text-xl text-[#2B231D]">
              One-Time Firestore Product Seeding
            </h2>
            <p className="text-xs text-[#82756A]">
              Migrate existing catalogue items into Cloud Firestore collection{' '}
              <code className="text-[#BD6024] font-semibold">products/{'{id}'}</code>.
            </p>
          </div>
        </div>

        {/* Dataset Summary */}
        <div className="my-5 p-4 rounded-2xl bg-[#FAF7F2] border border-[#EFE8DC]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#EFE8DC]">
            <span className="font-bold text-sm text-[#2B231D]">Catalog Summary</span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#BD6024]/10 text-[#BD6024] text-xs font-bold">
              {products.length} Products Available
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-xs">
            {categoryList.map(cat => {
              const count = products.filter(p => p.category === cat.name).length
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
            <p>✓ <strong>Stable Document IDs:</strong> Preserves exact slugs (e.g. <code>products/cozy-armchair</code>).</p>
            <p>✓ <strong>Idempotent Merge:</strong> Uses <code>batch.set(..., &#123; merge: true &#125;)</code> to update in place without creating duplicates.</p>
            <p>✓ <strong>Safe Sanitization:</strong> Prevents writing undefined values to Firestore.</p>
          </div>
        </div>

        {/* Progress or Success / Error Notifications */}
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

        {/* Confirmation Checkbox & Action Button */}
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
              I confirm that I want to seed <strong>{products.length} products</strong> into the Cloud
              Firestore <code>products</code> collection.
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
              <span>Start Product Seeding ({products.length} items)</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

