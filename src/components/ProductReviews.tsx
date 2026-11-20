import { useState, useEffect, useMemo, FormEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'

export interface ProductReview {
  id: string
  productId: string
  uid: string
  userName: string
  rating: number
  title: string
  comment: string
  createdAt: any
}

interface ProductReviewsProps {
  productId: string
  productName: string
  onSummaryChange?: (summary: { average: number | null; count: number }) => void
}

function StarIcon({ filled, className = 'w-4 h-4' }: { filled: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className={`${className} ${filled ? 'text-amber-500' : 'text-[#E3DCD3]'}`}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function formatDate(timestamp: any): string {
  if (!timestamp) return 'Recently'
  try {
    const d = typeof timestamp?.toDate === 'function' ? timestamp.toDate() : new Date(timestamp)
    if (isNaN(d.getTime())) return 'Recently'
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return 'Recently'
  }
}

export default function ProductReviews({
  productId,
  productName,
  onSummaryChange
}: ProductReviewsProps) {
  const { user } = useAuth()
  const location = useLocation()

  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)

  // Review submission form state
  const [rating, setRating] = useState<number>(5)
  const [hoverRating, setHoverRating] = useState<number>(0)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)

  // Listen to Firestore reviews for this product
  useEffect(() => {
    setLoading(true)
    setError(null)

    if (!productId) {
      setReviews([])
      setLoading(false)
      return
    }

    const q = query(collection(db, 'reviews'), where('productId', '==', productId))

    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const items: ProductReview[] = []
        snapshot.forEach(docSnap => {
          const data = docSnap.data()
          items.push({
            id: docSnap.id,
            productId: data.productId || productId,
            uid: data.uid || '',
            userName: data.userName || 'Customer',
            rating: typeof data.rating === 'number' ? data.rating : 5,
            title: data.title || '',
            comment: data.comment || '',
            createdAt: data.createdAt || null
          })
        })

        // Sort client-side descending by createdAt so latest appear first
        items.sort((a, b) => {
          const tA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0
          const tB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0
          return tB - tA
        })

        setReviews(items)
        setLoading(false)
        setError(null)
      },
      err => {
        console.error('Error fetching reviews:', err)
        setError('Unable to load customer reviews at this time. Please check your connection.')
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [productId, retryKey])

  // Summary statistics calculation
  const { averageRating, starCounts } = useMemo<{
    averageRating: number | null
    starCounts: Record<number, number>
  }>(() => {
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    if (reviews.length === 0) {
      return {
        averageRating: null,
        starCounts: counts
      }
    }

    let sum = 0

    reviews.forEach(r => {
      const star = Math.min(Math.max(Math.round(r.rating), 1), 5)
      counts[star] = (counts[star] || 0) + 1
      sum += r.rating
    })

    const avg = Number((sum / reviews.length).toFixed(1))
    return {
      averageRating: avg,
      starCounts: counts
    }
  }, [reviews])

  // Notify parent component of summary stats
  useEffect(() => {
    if (onSummaryChange) {
      onSummaryChange({
        average: averageRating,
        count: reviews.length
      })
    }
  }, [averageRating, reviews.length, onSummaryChange])

  // Check if authenticated user already reviewed this piece
  const userExistingReview = useMemo(() => {
    if (!user) return null
    return reviews.find(r => r.uid === user.uid) || null
  }, [reviews, user])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setFormSuccess(null)

    if (!user) {
      setFormError('You must be signed in to submit a review.')
      return
    }

    if (userExistingReview) {
      setFormError('You have already submitted a review for this product.')
      return
    }

    const trimmedTitle = title.trim()
    const trimmedComment = comment.trim()

    if (!rating || rating < 1 || rating > 5) {
      setFormError('Please select a rating between 1 and 5 stars.')
      return
    }

    if (trimmedTitle.length < 2) {
      setFormError('Please provide a review headline with at least 2 characters.')
      return
    }

    if (trimmedTitle.length > 100) {
      setFormError('Review headline must be 100 characters or fewer.')
      return
    }

    if (trimmedComment.length < 10) {
      setFormError('Please write a review comment with at least 10 characters.')
      return
    }

    if (trimmedComment.length > 1000) {
      setFormError('Review comment must be 1000 characters or fewer.')
      return
    }

    setSubmitting(true)

    try {
      const docId = `${productId}_${user.uid}`
      const userDisplayName =
        user.displayName?.trim() ||
        (user.email ? user.email.split('@')[0] : 'Customer')

      const payload = {
        productId,
        uid: user.uid,
        userName: userDisplayName.slice(0, 100),
        rating: Math.floor(rating),
        title: trimmedTitle,
        comment: trimmedComment,
        createdAt: serverTimestamp()
      }

      await setDoc(doc(db, 'reviews', docId), payload)

      setFormSuccess('Thank you! Your review has been published.')
      setTitle('')
      setComment('')
      setRating(5)
    } catch (err: any) {
      console.error('Failed to submit review:', err)
      if (err?.code === 'permission-denied') {
        setFormError('Permission denied. You may already have a review or your session has expired.')
      } else {
        setFormError('Failed to publish your review. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section aria-labelledby="reviews-heading" className="mt-12 sm:mt-20 pt-8 sm:pt-12 border-t border-[#EFE8DC]">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
        <div>
          <p className="text-xs font-bold tracking-widest text-[#BD6024] uppercase">Customer Feedback</p>
          <h2 id="reviews-heading" className="font-sans font-bold text-2xl sm:text-3xl text-[#2B231D] mt-1">
            Reviews &amp; Ratings
          </h2>
          <p className="text-xs sm:text-sm text-[#82756A] mt-1">
            Real impressions from clients who welcomed the {productName} into their space.
          </p>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-4 py-8 animate-pulse" aria-label="Loading reviews">
          <div className="h-28 bg-[#F4EFEA] rounded-2xl"></div>
          <div className="h-20 bg-[#F4EFEA] rounded-xl"></div>
          <div className="h-20 bg-[#F4EFEA] rounded-xl"></div>
        </div>
      )}

      {/* Loading Error State with Retry */}
      {!loading && error && (
        <div className="p-6 rounded-2xl bg-[#FFF6F3] border border-[#FADCD5] text-center my-6">
          <p className="text-sm font-medium text-[#C84A32]">{error}</p>
          <button
            type="button"
            onClick={() => setRetryKey(k => k + 1)}
            className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#BD6024] hover:bg-[#a5511c] text-white text-xs font-semibold shadow-xs transition"
          >
            <span>Retry loading reviews</span>
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Summary Rating & Star Distribution */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-white border border-[#EFE8DC] shadow-2xs">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl font-bold font-sans text-[#2B231D] tracking-tight">
                    {averageRating !== null ? averageRating.toFixed(1) : '—'}
                  </div>
                  <div className="text-xs text-[#82756A] font-medium mt-0.5">out of 5</div>
                </div>

                <div className="border-l border-[#EFE8DC] pl-4 flex-1">
                  <div className="flex items-center gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <StarIcon
                        key={s}
                        filled={averageRating !== null && s <= Math.round(averageRating)}
                        className="w-5 h-5"
                      />
                    ))}
                  </div>
                  <p className="text-xs font-medium text-[#6E6359]">
                    {reviews.length === 0
                      ? 'No ratings recorded yet'
                      : `Based on ${reviews.length} ${reviews.length === 1 ? 'customer review' : 'customer reviews'}`}
                  </p>
                </div>
              </div>

              {/* 1-5 Star Breakdown Bars */}
              <div className="mt-6 space-y-2 pt-6 border-t border-[#F2ECE4]">
                {[5, 4, 3, 2, 1].map(stars => {
                  const count = starCounts[stars] || 0
                  const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0
                  return (
                    <div key={stars} className="flex items-center gap-2.5 text-xs">
                      <span className="w-8 text-right font-medium text-[#6E6359]">{stars} ★</span>
                      <div className="flex-1 h-2 bg-[#F2ECE4] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-8 text-left text-[11px] text-[#9E9185]">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Submission Section / User Review / Sign in prompt */}
            <div className="p-6 rounded-2xl bg-white border border-[#EFE8DC] shadow-2xs">
              {userExistingReview ? (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FCEEE2] text-[#BD6024]">
                      <span>✓ Your Review is Live</span>
                    </span>
                    <span className="text-xs text-[#82756A]">{formatDate(userExistingReview.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map(s => (
                      <StarIcon key={s} filled={s <= userExistingReview.rating} className="w-4 h-4" />
                    ))}
                  </div>
                  <h4 className="font-semibold text-sm text-[#2B231D]">{userExistingReview.title}</h4>
                  <p className="mt-1 text-xs text-[#6E6359] leading-relaxed whitespace-pre-line">
                    {userExistingReview.comment}
                  </p>
                  <p className="mt-4 text-[11px] text-[#A89C90] italic border-t border-[#F2ECE4] pt-2">
                    Forma Living allows one review per member per product.
                  </p>
                </div>
              ) : !user ? (
                <div className="text-center py-4">
                  <h3 className="font-sans font-semibold text-base text-[#2B231D]">Own this piece?</h3>
                  <p className="text-xs text-[#82756A] mt-1 max-w-sm mx-auto">
                    Sign in to your Forma Living account to share your thoughts, material impressions, and rating.
                  </p>
                  <Link
                    to="/login"
                    state={{ from: location.pathname }}
                    className="mt-4 inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#BD6024] hover:bg-[#a5511c] text-white text-xs font-semibold shadow-xs transition"
                  >
                    Sign In to Leave a Review
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <h3 className="font-sans font-bold text-base text-[#2B231D]">Write a Review</h3>
                    <p className="text-xs text-[#82756A] mt-0.5">
                      Reviewing as <span className="font-semibold text-[#2B231D]">{user.displayName || user.email?.split('@')[0] || 'Customer'}</span>
                    </p>
                  </div>

                  {formError && (
                    <div className="p-3 rounded-xl bg-[#FFF6F3] border border-[#FADCD5] text-xs text-[#C84A32] leading-tight">
                      {formError}
                    </div>
                  )}

                  {formSuccess && (
                    <div className="p-3 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-xs text-[#166534] leading-tight">
                      {formSuccess}
                    </div>
                  )}

                  {/* Interactive Star Selection */}
                  <div>
                    <label className="block text-xs font-semibold text-[#2B231D] mb-1.5">
                      Overall Rating <span className="text-[#BD6024]">*</span>
                    </label>
                    <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Select rating">
                      {[1, 2, 3, 4, 5].map(s => {
                        const isFilled = (hoverRating || rating) >= s
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setRating(s)}
                            onMouseEnter={() => setHoverRating(s)}
                            onMouseLeave={() => setHoverRating(0)}
                            role="radio"
                            aria-checked={rating === s}
                            aria-label={`${s} star${s > 1 ? 's' : ''}`}
                            className="p-1 rounded-md hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-[#BD6024]/40"
                          >
                            <StarIcon filled={isFilled} className="w-6 h-6" />
                          </button>
                        )
                      })}
                      <span className="text-xs font-medium text-[#82756A] ml-2">
                        {hoverRating > 0 ? `${hoverRating} Stars` : `${rating} Stars`}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label htmlFor="review-title" className="block text-xs font-semibold text-[#2B231D] mb-1">
                      Headline <span className="text-[#BD6024]">*</span>
                    </label>
                    <input
                      id="review-title"
                      type="text"
                      required
                      minLength={2}
                      maxLength={100}
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="e.g. Masterful joinery & serene comfort"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE8DC] bg-[#FAF7F2] text-xs sm:text-sm text-[#2B231D] placeholder-[#A89C90] focus:outline-none focus:border-[#BD6024] focus:bg-white transition"
                    />
                    <div className="text-[11px] text-[#A89C90] text-right mt-0.5">{title.length}/100</div>
                  </div>

                  {/* Comment */}
                  <div>
                    <label htmlFor="review-comment" className="block text-xs font-semibold text-[#2B231D] mb-1">
                      Your Comments <span className="text-[#BD6024]">*</span>
                    </label>
                    <textarea
                      id="review-comment"
                      required
                      minLength={10}
                      maxLength={1000}
                      rows={4}
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      placeholder="Share your thoughts on the texture, proportion, comfort, and how it pairs with your home..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE8DC] bg-[#FAF7F2] text-xs sm:text-sm text-[#2B231D] placeholder-[#A89C90] focus:outline-none focus:border-[#BD6024] focus:bg-white transition resize-none"
                    />
                    <div className="text-[11px] text-[#A89C90] text-right mt-0.5">{comment.length}/1000</div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 px-4 rounded-xl bg-[#BD6024] hover:bg-[#a5511c] disabled:opacity-50 text-white font-semibold text-xs sm:text-sm shadow-xs transition active:scale-[0.99]"
                  >
                    {submitting ? 'Publishing Review…' : 'Submit Review'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right Column: Customer Reviews Feed */}
          <div className="lg:col-span-7">
            {reviews.length === 0 ? (
              <div className="h-full min-h-[260px] p-8 rounded-2xl bg-white border border-[#EFE8DC] flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#EFE8DC] flex items-center justify-center text-amber-500 mb-3">
                  <StarIcon filled={true} className="w-6 h-6" />
                </div>
                <h3 className="font-sans font-bold text-base text-[#2B231D]">No reviews yet</h3>
                <p className="text-xs text-[#82756A] mt-1 max-w-sm">
                  Be the first to share your experience with the {productName}. Your review helps fellow homeowners curate their space.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#EFE8DC]">
                  <h3 className="font-sans font-semibold text-sm text-[#2B231D]">
                    Showing {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
                  </h3>
                  <span className="text-xs text-[#82756A]">Sorted by most recent</span>
                </div>

                <div className="space-y-3.5">
                  {reviews.map(item => {
                    const isCurrentUser = user && item.uid === user.uid
                    return (
                      <article
                        key={item.id}
                        data-testid="customer-review-card"
                        className={`p-5 rounded-2xl bg-white border transition shadow-2xs ${
                          isCurrentUser
                            ? 'border-[#BD6024]/40 bg-gradient-to-br from-white to-[#FDF8F4]'
                            : 'border-[#EFE8DC]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#EFE8DC] text-xs font-bold text-[#BD6024] flex items-center justify-center uppercase">
                              {item.userName ? item.userName.charAt(0) : 'C'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-xs sm:text-sm text-[#2B231D]">
                                  {item.userName}
                                </span>
                                {isCurrentUser && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#FCEEE2] text-[#BD6024]">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 mt-0.5">
                                {[1, 2, 3, 4, 5].map(s => (
                                  <StarIcon key={s} filled={s <= item.rating} className="w-3.5 h-3.5" />
                                ))}
                              </div>
                            </div>
                          </div>

                          <time className="text-[11px] text-[#A89C90] shrink-0 font-medium">
                            {formatDate(item.createdAt)}
                          </time>
                        </div>

                        <h4 className="mt-3 font-semibold text-xs sm:text-sm text-[#2B231D]">
                          {item.title}
                        </h4>
                        <p className="mt-1 text-xs sm:text-sm text-[#6E6359] leading-relaxed whitespace-pre-line">
                          {item.comment}
                        </p>
                      </article>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
