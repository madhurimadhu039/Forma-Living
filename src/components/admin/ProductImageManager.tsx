import { useState } from 'react'
import {
  MAX_GALLERY_IMAGES,
  isValidImagePathOrUrl,
  normalizeProductImages,
} from '../../services/adminProducts'

interface ProductImageManagerProps {
  primaryImage: string
  galleryImages: string[]
  onChange: (next: { image: string; images: string[] }) => void
  primaryError?: string
  galleryError?: string
  disabled?: boolean
}

export default function ProductImageManager({
  primaryImage,
  galleryImages,
  onChange,
  primaryError,
  galleryError,
  disabled = false,
}: ProductImageManagerProps) {
  const [newImageInput, setNewImageInput] = useState('')
  const [addError, setAddError] = useState<string | null>(null)
  const [brokenPreviews, setBrokenPreviews] = useState<Record<string, boolean>>({})

  const normalized = normalizeProductImages(primaryImage, galleryImages)
  const entries = normalized.images
  const trimmedPrimary = primaryImage.trim()

  const markPreviewLoaded = (src: string) => {
    setBrokenPreviews(prev => {
      if (!prev[src]) return prev
      const next = { ...prev }
      delete next[src]
      return next
    })
  }

  const markPreviewBroken = (src: string) => {
    setBrokenPreviews(prev => (prev[src] ? prev : { ...prev, [src]: true }))
  }

  const handlePrimaryInputChange = (val: string) => {
    const prevTrimmed = primaryImage.trim()
    const nextTrimmed = val.trim()
    const withoutPrev = galleryImages
      .map(item => item.trim())
      .filter(item => Boolean(item) && item !== prevTrimmed && item !== nextTrimmed)

    const nextImages = nextTrimmed ? [nextTrimmed, ...withoutPrev] : withoutPrev
    onChange({
      image: val,
      images: nextImages,
    })
  }

  const handleAddGalleryEntry = () => {
    if (disabled) return
    const candidate = newImageInput.trim()
    if (!candidate) {
      setAddError('Enter a local /images/... path or external https:// URL')
      return
    }
    if (!isValidImagePathOrUrl(candidate)) {
      setAddError('Invalid path or URL. Use /images/... or https://...')
      return
    }
    if (entries.includes(candidate)) {
      setAddError('This image is already in the gallery')
      return
    }
    if (entries.length >= MAX_GALLERY_IMAGES) {
      setAddError(`Maximum ${MAX_GALLERY_IMAGES} images allowed per product`)
      return
    }

    setAddError(null)
    setNewImageInput('')

    if (!trimmedPrimary) {
      onChange({
        image: candidate,
        images: [candidate, ...entries.filter(item => item !== candidate)],
      })
    } else {
      onChange({
        image: primaryImage,
        images: [...entries, candidate],
      })
    }
  }

  const handleSetPrimary = (target: string) => {
    if (disabled) return
    const reordered = [target, ...entries.filter(item => item !== target)]
    onChange({
      image: target,
      images: reordered,
    })
  }

  const handleMove = (index: number, direction: -1 | 1) => {
    if (disabled) return
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= entries.length) return
    const next = [...entries]
    const [moved] = next.splice(index, 1)
    next.splice(targetIndex, 0, moved)

    onChange({
      image: next[0] || '',
      images: next,
    })
  }

  const handleRemove = (index: number) => {
    if (disabled) return
    const removed = entries[index]
    const next = entries.filter((_, i) => i !== index)
    const nextPrimary = removed === trimmedPrimary ? (next[0] || '') : primaryImage
    onChange({
      image: nextPrimary,
      images: next,
    })
  }

  const canPreviewPrimary = Boolean(trimmedPrimary && isValidImagePathOrUrl(trimmedPrimary))

  return (
    <div className="space-y-4">
      {/* Primary Image Input + Preview */}
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-[#FAF7F2] border border-[#EFE8DC] flex items-center justify-center relative">
          {canPreviewPrimary ? (
            <>
              <img
                src={trimmedPrimary}
                alt="Primary preview"
                className="w-full h-full object-cover"
                onLoad={() => markPreviewLoaded(trimmedPrimary)}
                onError={() => markPreviewBroken(trimmedPrimary)}
              />
              {brokenPreviews[trimmedPrimary] && (
                <span className="absolute inset-x-0 bottom-0 bg-amber-900/85 text-white text-[10px] font-medium px-1.5 py-0.5 text-center">
                  Preview N/A
                </span>
              )}
            </>
          ) : (
            <span className="text-[11px] text-[#82756A] text-center px-2">No primary preview</span>
          )}
        </div>

        <div className="flex-1 w-full">
          <label className="block text-xs font-semibold text-[#2B231D] mb-1">
            Primary Image Path or HTTPS URL <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={primaryImage}
            onChange={e => handlePrimaryInputChange(e.target.value)}
            disabled={disabled}
            placeholder="/images/product-name.jpg or https://example.com/photo.jpg"
            className={`w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border text-sm text-[#2B231D] placeholder:text-[#A39589] focus:outline-none focus:ring-2 focus:ring-[#BD6024]/30 ${
              primaryError ? 'border-red-400' : 'border-[#EFE8DC]'
            }`}
          />
          <p className="mt-1 text-[11px] text-[#82756A]">
            Supports local public paths (<code className="text-[#2B231D]">/images/...</code>) or external{' '}
            <code className="text-[#2B231D]">https://</code> URLs.
          </p>
          {primaryError && <p className="mt-1 text-xs text-red-600">{primaryError}</p>}
          {canPreviewPrimary && brokenPreviews[trimmedPrimary] && !primaryError && (
            <p className="mt-1 text-xs text-amber-700">
              Preview could not load in browser yet. Verify the path or external HTTPS URL before saving.
            </p>
          )}
        </div>
      </div>

      {/* Add Additional Gallery Entry */}
      <div className="pt-2 border-t border-[#EFE8DC]">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <label className="text-xs font-semibold text-[#2B231D]">
            Gallery Images ({entries.length}/{MAX_GALLERY_IMAGES})
          </label>
          <span className="text-[11px] text-[#82756A]">
            #1 image is shown as the main thumbnail
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={newImageInput}
            onChange={e => {
              setNewImageInput(e.target.value)
              if (addError) setAddError(null)
            }}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddGalleryEntry()
              }
            }}
            disabled={disabled || entries.length >= MAX_GALLERY_IMAGES}
            placeholder="Add another /images/... path or https:// URL"
            className="flex-1 px-3.5 py-2 rounded-xl bg-[#FAF7F2] border border-[#EFE8DC] text-sm text-[#2B231D] placeholder:text-[#A39589] focus:outline-none focus:ring-2 focus:ring-[#BD6024]/30"
          />
          <button
            type="button"
            onClick={handleAddGalleryEntry}
            disabled={disabled || entries.length >= MAX_GALLERY_IMAGES}
            className="px-4 py-2 rounded-xl bg-[#2B231D] hover:bg-[#3d322a] disabled:opacity-50 text-white text-xs font-semibold transition shrink-0"
          >
            + Add to Gallery
          </button>
        </div>

        {addError && <p className="mt-1.5 text-xs text-red-600">{addError}</p>}
        {galleryError && <p className="mt-1.5 text-xs text-red-600">{galleryError}</p>}
      </div>

      {/* Interactive Gallery Cards */}
      {entries.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {entries.map((imgUrl, idx) => {
            const isPrimary = idx === 0 && imgUrl === trimmedPrimary
            const isValidEntry = isValidImagePathOrUrl(imgUrl)
            const isBroken = brokenPreviews[imgUrl]

            return (
              <div
                key={`${imgUrl}-${idx}`}
                className={`rounded-xl border p-2.5 bg-[#FAF7F2] flex flex-col gap-2 ${
                  isPrimary ? 'border-[#BD6024] ring-1 ring-[#BD6024]/20' : 'border-[#EFE8DC]'
                }`}
              >
                <div className="aspect-[4/3] rounded-lg overflow-hidden bg-white border border-[#EFE8DC] relative flex items-center justify-center">
                  {isValidEntry ? (
                    <img
                      src={imgUrl}
                      alt={`Gallery item ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onLoad={() => markPreviewLoaded(imgUrl)}
                      onError={() => markPreviewBroken(imgUrl)}
                    />
                  ) : (
                    <span className="text-[11px] text-red-600 px-2 text-center">Invalid path/URL</span>
                  )}

                  <span
                    className={`absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold shadow-sm ${
                      isPrimary
                        ? 'bg-[#BD6024] text-white'
                        : 'bg-[#2B231D]/80 text-white'
                    }`}
                  >
                    {isPrimary ? 'Primary #1' : `#${idx + 1}`}
                  </span>

                  {isValidEntry && isBroken && (
                    <span className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-900 border border-amber-200">
                      Preview error
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-[#6E6359] truncate" title={imgUrl}>
                  {imgUrl}
                </p>

                <div className="flex items-center justify-between gap-1 pt-0.5">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleMove(idx, -1)}
                      disabled={disabled || idx === 0}
                      title="Move earlier"
                      className="px-2 py-1 rounded-lg bg-white border border-[#EFE8DC] hover:border-[#BD6024] disabled:opacity-40 text-xs text-[#2B231D]"
                    >
                      &larr;
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(idx, 1)}
                      disabled={disabled || idx === entries.length - 1}
                      title="Move later"
                      className="px-2 py-1 rounded-lg bg-white border border-[#EFE8DC] hover:border-[#BD6024] disabled:opacity-40 text-xs text-[#2B231D]"
                    >
                      &rarr;
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    {!isPrimary && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(imgUrl)}
                        disabled={disabled}
                        className="px-2 py-1 rounded-lg bg-[#FCEEE2] hover:bg-[#f7dec8] text-[#BD6024] text-[11px] font-semibold transition"
                      >
                        Set Primary
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemove(idx)}
                      disabled={disabled}
                      title="Remove from gallery"
                      className="px-2 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-semibold transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

