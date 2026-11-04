export interface Product {
  id: string
  name: string
  category: string
  style: string
  color: string
  material: string
  price: number
  compareAt?: number
  stock: number
  width: number
  depth: number
  height: number
  description: string
  image: string
  isPopular?: boolean
}

export interface CategoryInfo {
  name: string
  image: string
  description: string
}

export const categoryList: CategoryInfo[] = [
  { name: 'Living Room', image: '/images/cat-living-room.jpg', description: 'Sofas, armchairs & coffee tables' },
  { name: 'Bedroom', image: '/images/cat-bedroom.jpg', description: 'Beds, headboards & nightstands' },
  { name: 'Dining Room', image: '/images/cat-dining-room.jpg', description: 'Dining tables & artisan chairs' },
  { name: 'Lighting', image: '/images/cat-lighting.jpg', description: 'Pendants, lamps & sconces' },
  { name: 'Balcony', image: '/images/cat-balcony.jpg', description: 'Rattan chairs & bistro sets' },
  { name: 'Home Office', image: '/images/cat-home-office.jpg', description: 'Desks, shelves & ergonomic chairs' },
  { name: 'Storage', image: '/images/cat-storage.jpg', description: 'Credenzas, bookcases & cabinets' },
  { name: 'Decor', image: '/images/cat-decor.jpg', description: 'Ceramics, mirrors & soft textiles' },
  { name: 'Outdoor Furniture', image: '/images/cat-outdoor.jpg', description: 'Weatherproof teak & outdoor lounges' },
]

export const categories = categoryList.map(c => c.name)

const p = (
  id: string,
  name: string,
  category: string,
  style: string,
  color: string,
  material: string,
  price: number,
  width: number,
  depth: number,
  height: number,
  stock = 10,
  compareAt?: number,
  isPopular = false,
  description?: string
): Product => ({
  id,
  name,
  category,
  style,
  color,
  material,
  price,
  compareAt,
  stock,
  width,
  depth,
  height,
  image: `/images/${id}.jpg`,
  description: description || `${name}: crafted from premium ${material.toLowerCase()} in a refined ${style} aesthetic. Designed for durability, comfort, and timeless beauty.`,
  isPopular
})

export const products: Product[] = [
  // 4 Featured Popular Products from Reference Design
  p('cozy-armchair', 'Cozy Armchair', 'Living Room', 'Modern', 'Beige', 'Boucle & Oak', 249, 82, 85, 78, 8, 299, true, 'An inviting modern armchair upholstered in soft textured boucle with sculpted natural oak legs.'),
  p('modern-sofa', 'Modern Sofa', 'Living Room', 'Contemporary', 'Cream', 'Linen Blend', 599, 210, 92, 82, 4, 699, true, 'Sleek two-seater sofa with deep cushioning, clean lines, and neutral stain-resistant linen upholstery.'),
  p('wooden-table', 'Wooden Table', 'Dining Room', 'Minimalist', 'Natural Oak', 'Solid Oak', 199, 120, 70, 48, 6, 249, true, 'Hand-finished solid oak coffee and accent table featuring smooth rounded edges and sturdy tapered legs.'),
  p('stylish-lamp', 'Stylish Lamp', 'Lighting', 'Modern', 'Mustard & Ceramic', 'Ceramic & Brass', 89, 28, 28, 42, 15, 119, true, 'Architectural mushroom dome table lamp with a warm mustard glazed dome and speckled ceramic pedestal base.'),

  // Additional curated store products with distinct categories and images
  p('luca-chair', 'Luca Lounge Chair', 'Living Room', 'Japandi', 'Sand Beige', 'Solid Ash & Linen', 349, 78, 82, 76, 5, 399, false, 'Japanese-Scandinavian lounge chair with low-profile silhouette and tailored linen cushioning.'),
  p('soren-sofa', 'Soren 3-Seater Sofa', 'Living Room', 'Scandinavian', 'Warm Ivory', 'Textured Boucle', 699, 230, 95, 80, 3, 799, false, 'Grand three-seater lounge sofa with organic curved contouring and plush feather-blend cushions.'),
  p('alma-table', 'Alma Dining Table', 'Dining Room', 'Modern', 'Walnut', 'American Walnut', 429, 160, 90, 76, 4, 499, false, 'Statement dining table crafted with rich grain American walnut veneer and beveled perimeter.'),
  p('rae-pendant', 'Rae Pendant Light', 'Lighting', 'Contemporary', 'Brushed Brass', 'Spun Brass & Glass', 119, 35, 35, 40, 20, 149, false, 'Modern sculptural pendant with hand-brushed brass finish and diffused warm illumination.'),
  p('noor-bed', 'Noor Platform Bed', 'Bedroom', 'Minimalist', 'Natural Oak', 'Solid European Oak', 549, 180, 215, 95, 4, 649, false, 'Minimalist solid oak platform bed with floating aesthetic and integrated headboard ledge.'),
  p('kaito-desk', 'Kaito Work Desk', 'Home Office', 'Japandi', 'Warm Walnut', 'Walnut & Steel', 279, 140, 65, 75, 7, 329, false, 'Refined workspace desk with cord management groove, slim drawer, and solid wood legs.'),
  p('vale-chair', 'Vale Balcony Chair', 'Balcony', 'Bohemian', 'Natural Tan', 'Handwoven Rattan', 189, 62, 65, 84, 9, 219, false, 'Breathable handwoven natural rattan chair with weather-resistant clear protective coat.'),
  p('arc-shelf', 'Arc Bookshelf', 'Storage', 'Industrial Modern', 'Matte Black', 'Powdered Steel & Oak', 229, 85, 35, 175, 6, 269, false, 'Geometric open-frame shelving unit designed to display ceramics, books, and green botanicals.'),
  p('tala-vase', 'Tala Ceramic Vase', 'Decor', 'Minimalist', 'Muted Sand', 'Artisan Stoneware', 49, 16, 16, 32, 25, 65, false, 'Matte textured ceramic vessel hand-thrown by artisan potters, ideal for dried florals or branches.'),
  p('haven-lounge', 'Haven Outdoor Lounge', 'Outdoor Furniture', 'Modern Resort', 'Teak & Charcoal', 'Weatherproof Teak', 459, 150, 85, 72, 3, 529, false, 'Grade-A teak outdoor lounge bench equipped with sun-proof, water-repellent quick-dry foam cushions.'),
  p('zen-credenza', 'Zen Fluted Credenza', 'Storage', 'Japandi', 'Natural White Oak', 'Oak & Ribbed Glass', 489, 160, 45, 82, 4, 569, false, 'Four-door low credenza featuring tambour fluted sliding doors and soft interior adjustable shelving.'),
  p('sol-mirror', 'Sol Arched Floor Mirror', 'Decor', 'Modern Luxury', 'Brushed Brass', 'Brass & Annealed Glass', 159, 60, 4, 170, 8, 189, false, 'Full-length arched statement mirror with slender brushed brass frame and shatterproof mirror glass.')
]
