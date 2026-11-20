export interface SeoConfig {
  title?: string
  description: string
  canonicalPath?: string
  ogType?: 'website' | 'product'
  ogImage?: string
  noIndex?: boolean
}

export const SITE_ORIGIN = 'https://forma-living-ten.vercel.app'
export const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/images/hero-living-room.jpg`

export function applySeo({
  title,
  description,
  canonicalPath,
  ogType = 'website',
  ogImage = DEFAULT_OG_IMAGE,
  noIndex = false,
}: SeoConfig) {
  if (title) {
    document.title = title
  }

  const setMeta = (attrName: 'name' | 'property', attrValue: string, content: string) => {
    let el = document.querySelector<HTMLMetaElement>(`meta[${attrName}="${attrValue}"]`)
    if (!el) {
      el = document.createElement('meta')
      el.setAttribute(attrName, attrValue)
      document.head.appendChild(el)
    }
    el.setAttribute('content', content)
  }

  // Meta description & robots
  setMeta('name', 'description', description)
  setMeta('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow')

  // Canonical URL
  let linkCanonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  let canonicalUrl = ''

  if (canonicalPath) {
    canonicalUrl = `${SITE_ORIGIN}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}`
    if (!linkCanonical) {
      linkCanonical = document.createElement('link')
      linkCanonical.setAttribute('rel', 'canonical')
      document.head.appendChild(linkCanonical)
    }
    linkCanonical.setAttribute('href', canonicalUrl)
  } else if (linkCanonical) {
    linkCanonical.remove()
  }

  // Ensure absolute image URL
  const absoluteImage =
    ogImage.startsWith('http://') || ogImage.startsWith('https://')
      ? ogImage
      : `${SITE_ORIGIN}${ogImage.startsWith('/') ? ogImage : `/${ogImage}`}`

  const activeTitle = title || document.title

  // Open Graph
  setMeta('property', 'og:site_name', 'Forma Living')
  setMeta('property', 'og:type', ogType)
  setMeta('property', 'og:title', activeTitle)
  setMeta('property', 'og:description', description)
  if (canonicalUrl) {
    setMeta('property', 'og:url', canonicalUrl)
  } else {
    const elOgUrl = document.querySelector<HTMLMetaElement>('meta[property="og:url"]')
    if (elOgUrl) {
      elOgUrl.remove()
    }
  }
  setMeta('property', 'og:image', absoluteImage)

  // Twitter / X
  setMeta('name', 'twitter:card', 'summary_large_image')
  setMeta('name', 'twitter:title', activeTitle)
  setMeta('name', 'twitter:description', description)
  setMeta('name', 'twitter:image', absoluteImage)
}
