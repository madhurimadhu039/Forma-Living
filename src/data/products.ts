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
  images?: string[]
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
  description?: string,
  images?: string[]
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
  images: images || [`/images/${id}.jpg`],
  description:
    description ||
    `${name}: crafted from premium ${material.toLowerCase()} in a refined ${style} aesthetic. Designed for durability, comfort, and timeless beauty.`,
  isPopular
})

export const products: Product[] = [
  // ─── LIVING ROOM COLLECTION (EXPANDED WITH DISTINCT IMAGES) ─────────────────────────
  p('cozy-armchair', 'Cozy Armchair', 'Living Room', 'Modern', 'Beige', 'Boucle & Oak', 249, 82, 85, 78, 8, 299, true, 'An inviting modern armchair upholstered in soft textured boucle with sculpted natural oak legs.'),
  p('modern-sofa', 'Modern Sofa', 'Living Room', 'Contemporary', 'Cream', 'Linen Blend', 599, 210, 92, 82, 4, 699, true, 'Sleek two-seater sofa with deep cushioning, clean lines, and neutral stain-resistant linen upholstery.'),
  p('luca-chair', 'Luca Lounge Chair', 'Living Room', 'Japandi', 'Sand Beige', 'Solid Ash & Linen', 349, 78, 82, 76, 5, 399, false, 'Japanese-Scandinavian lounge chair with low-profile silhouette and tailored linen cushioning.'),
  p('soren-sofa', 'Soren 3-Seater Sofa', 'Living Room', 'Scandinavian', 'Warm Ivory', 'Textured Boucle', 699, 230, 95, 80, 3, 799, false, 'Grand three-seater lounge sofa with organic curved contouring and plush feather-blend cushions.'),
  p('kyoto-coffee-table', 'Kyoto Fluted Coffee Table', 'Living Room', 'Japandi', 'Natural Oak', 'Solid White Oak', 299, 90, 90, 42, 6, 349, false, 'Sculptural circular coffee table featuring handcrafted tambour fluted pedestal base and organic bullnose edge profile.'),
  p('nordic-recliner', 'Nordic Swivel Lounge Chair', 'Living Room', 'Scandinavian Modern', 'Warm Caramel', 'Top-Grain Leather & Steel', 389, 82, 85, 88, 5, 449, false, 'Ergonomic 360-degree swivel lounge chair tailored in supple top-grain leather on an architectural matte black steel base.'),
  p('haven-sectional', 'Haven Modular Corner Sofa', 'Living Room', 'Modern Minimalist', 'Oatmeal', 'Performance Linen Blend', 899, 280, 165, 82, 2, 1099, false, 'Generously proportioned modular corner sectional with deep foam-feather seats and spill-resistant relaxed linen upholstery.'),
  p('verona-side-table', 'Verona Travertine Side Table', 'Living Room', 'Contemporary Luxury', 'Warm Alabaster', 'Honed Roman Travertine', 179, 45, 45, 52, 9, 219, false, 'Solid natural Roman travertine end table cut with architectural pill-shaped pedestal and velvet soft honed matte finish.'),
  p('marfa-chaise', 'Marfa Velvet Chaise Lounge', 'Living Room', 'Mid-Century Modern', 'Olive Ochre', 'Mohair Velvet & Brass', 459, 175, 85, 78, 3, 529, false, 'Tailored daybed and reading chaise crafted with high-density foam core, subtle channel tufting, and brass capped walnut legs.'),
  p('oslo-credenza', 'Oslo Low Oak Media Console', 'Living Room', 'Scandinavian', 'Bleached Oak', 'Solid White Oak & Cane', 419, 180, 42, 54, 4, 499, false, 'Low-slung entertainment sideboard with acoustic cane weave sliding tambour doors and discrete rear cable passages.'),
  p('boucle-pouf', 'Terrazzo & Boucle Round Ottoman', 'Living Room', 'Modern Organic', 'Cream White', 'Textured Boucle & Foam', 129, 55, 55, 44, 12, 159, false, 'Multi-functional accent footstool and impromptu seating piece wrapped in tactile nubby boucle with weighted non-slip base.'),
  p('solis-accent-chair', 'Solis Sculptural Accent Chair', 'Living Room', 'Japandi Modern', 'Sand & Natural Wood', 'Bent Ash Wood & Wool', 319, 74, 76, 75, 7, 379, false, 'Artful statement chair pairing fluid bentwood ash geometry with a thick upholstered wool-blend floating seat cushion.'),
  p('arura-bookshelf', 'Arura Low Display Shelf', 'Living Room', 'Industrial Modern', 'Smoked Walnut', 'Smoked Oak & Iron', 349, 140, 36, 85, 5, 419, false, 'Low architectural open display shelving unit designed for curated art books, ceramics, and ambient lighting accents.'),
  p('velvet-accent-chair', 'Clara Barrel Armchair', 'Living Room', 'Modern Classic', 'Forest Green', 'Textured Velvet & Beech', 289, 78, 80, 82, 6, 339, false, 'Gracefully curved accent armchair with wrap-around barrel back support, high-resilience foam, and tapered hardwood legs.'),
  p('tokyo-media-unit', 'Tokyo Fluted Lowboard', 'Living Room', 'Japandi Minimalist', 'Charcoal Ash', 'Charcoal Oak & Brass', 479, 195, 45, 50, 3, 569, false, 'Expansive contemporary media console with ribbed tambour sliding doors and soft-close storage compartments.'),
  p('fluted-wood-table', 'Forma Minimalist Nesting Tables', 'Living Room', 'Modern Organic', 'Light Blonde Wood', 'Solid Ash Wood', 189, 70, 70, 46, 8, 229, false, 'Set of two organic circular nesting coffee tables designed to tuck together or separate across living room seating areas.'),

  // ─── BEDROOM COLLECTION (EXPANDED WITH DISTINCT IMAGES) ─────────────────────────
  p('noor-bed', 'Noor Platform Bed', 'Bedroom', 'Minimalist', 'Natural Oak', 'Solid European Oak', 549, 180, 215, 95, 4, 649, true, 'Minimalist solid oak platform bed with floating aesthetic and integrated headboard ledge.'),
  p('astrid-linen-bed', 'Astrid Upholstered Bed', 'Bedroom', 'Modern Scandinavian', 'Warm Sand', 'Belgian Linen & Solid Ash', 649, 190, 220, 105, 5, 749, false, 'Contoured bed frame upholstered in textured Belgian linen with a gently curved pillow-back headboard and solid ash support.'),
  p('kyoto-tatami-bed', 'Kyoto Tatami Platform Bed', 'Bedroom', 'Japandi', 'Natural Muted Oak', 'Solid Japanese White Oak', 589, 200, 225, 68, 4, 699, false, 'Low-profile architectural bed inspired by traditional Japanese joinery with wide border ledges and breathable tatami-slat support.'),
  p('milo-spindle-bed', 'Milo Solid Walnut Spindle Bed', 'Bedroom', 'Mid-Century Modern', 'Deep Walnut', 'American Black Walnut', 699, 185, 215, 110, 3, 799, false, 'Handcrafted spindle bed frame showcasing tapered spindles, rounded corners, and rich continuous walnut wood grain.'),
  p('serene-canopy-bed', 'Serene Minimalist Canopy Bed', 'Bedroom', 'Contemporary Luxury', 'Matte Black', 'Powder-Coated Steel & Oak', 749, 188, 218, 205, 2, 899, false, 'Architectural four-poster canopy bed with slim rectilinear profiles and solid oak mattress foundation.'),
  p('sora-nightstand', 'Sora Floating Bedside Table', 'Bedroom', 'Japandi', 'Warm Natural Oak', 'Solid White Oak', 169, 48, 40, 50, 8, 199, false, 'Clean-lined bedside table featuring a soft-close dovetail drawer, open storage shelf, and integrated cord management notch.'),
  p('cali-cane-nightstand', 'Cali Cane Bedside Cabinet', 'Bedroom', 'Modern Organic', 'Muted Almond', 'Solid Ash & Natural Cane', 189, 52, 42, 58, 6, 229, false, 'Artisan-crafted bedside cabinet with handwoven natural rattan cane door and warm satin brass pull.'),
  p('luna-travertine-nightstand', 'Luna Travertine Round Nightstand', 'Bedroom', 'Contemporary Luxury', 'Warm Ivory Alabaster', 'Honed Roman Travertine', 219, 45, 45, 54, 7, 269, false, 'Sculptural cylindrical bedside pedestal carved from genuine honed travertine with subtle natural veining.'),
  p('nordic-6-drawer-dresser', 'Nordic 6-Drawer Oak Dresser', 'Bedroom', 'Scandinavian Modern', 'Bleached White Oak', 'FSC Solid White Oak', 599, 160, 48, 85, 4, 699, false, 'Generously proportioned 6-drawer horizontal dresser featuring recessed finger pulls and soft-close undermount runners.'),
  p('kyoto-tallboy-chest', 'Kyoto 5-Drawer High Chest', 'Bedroom', 'Japandi Minimalist', 'Natural Ash Wood', 'Solid Ash & Brass', 489, 90, 45, 120, 5, 579, false, 'Space-saving vertical highboy dresser with five deep storage drawers and delicate brushed brass hardware accents.'),
  p('alva-boucle-bench', 'Alva End-of-Bed Boucle Bench', 'Bedroom', 'Modern Scandinavian', 'Chalk White', 'Textured Boucle & Solid Ash', 239, 135, 42, 46, 8, 289, false, 'Pill-shaped end-of-bed bench upholstered in cozy high-pile boucle with rounded solid ash wood legs.'),
  p('haven-leather-bench', 'Haven Woven Leather Bench', 'Bedroom', 'Modern Craft', 'Cognac Tan', 'Top-Grain Leather & Teak', 289, 130, 40, 45, 6, 349, false, 'Hand-strapped saddle leather bench with solid plantation teak framework, ideal at foot of the bed or bedroom dressing nooks.'),
  p('solene-bedside-lamp', 'Solene Ceramic Bedside Lamp', 'Bedroom', 'Artisan Modern', 'Terracotta & Linen', 'Stoneware & Pleated Linen', 95, 26, 26, 44, 14, 125, false, 'Warm ambient bedside table lamp featuring a tactile matte ceramic urn base and folded knife-pleat linen shade.'),
  p('arc-bedroom-mirror', 'Lumiere Arched Full-Length Mirror', 'Bedroom', 'Modern Minimalist', 'Brushed Brass', 'Anodized Aluminum & Glass', 199, 65, 4, 175, 7, 249, false, 'Tall freestanding bedroom floor mirror with an elegant thin arched brass frame and ultra-clear shatterproof glass.'),
  p('elena-vanity-desk', 'Elena Fluted Bedroom Vanity Desk', 'Bedroom', 'Contemporary Luxury', 'Natural Oak & Brass', 'Solid White Oak & Marble', 379, 110, 50, 78, 5, 449, false, 'Chic bedroom dressing table and study desk featuring fluted drawer detailing, concealed jewelry organizer, and brass accents.'),

  // ─── DINING ROOM COLLECTION (EXPANDED WITH DISTINCT IMAGES) ─────────────────────────
  p('wooden-table', 'Wooden Dining Table', 'Dining Room', 'Minimalist', 'Natural Oak', 'Solid Oak', 199, 120, 70, 48, 6, 249, true, 'Hand-finished solid oak dining and accent table featuring smooth rounded edges and sturdy tapered legs.'),
  p('alma-table', 'Alma Dining Table', 'Dining Room', 'Modern', 'Walnut', 'American Walnut', 429, 160, 90, 76, 4, 499, false, 'Statement dining table crafted with rich grain American walnut veneer and beveled perimeter.'),
  p('kyoto-round-dining-table', 'Kyoto Round Pedestal Table', 'Dining Room', 'Japandi', 'Natural Muted Oak', 'Solid White Oak', 469, 120, 120, 76, 5, 549, true, 'Sculptural circular dining table featuring a bold fluted column base and beveled reverse bullnose perimeter.'),
  p('verona-marble-dining-table', 'Verona Oval Marble Dining Table', 'Dining Room', 'Contemporary Luxury', 'Calacatta & Walnut', 'Calacatta Marble & Walnut', 899, 210, 105, 76, 2, 1099, false, 'Showcase oval dining table featuring a honed Italian Calacatta marble slab seated on twin contoured walnut pedestals.'),
  p('solis-extendable-table', 'Solis Extendable Oak Dining Table', 'Dining Room', 'Scandinavian Modern', 'Warm Bleached Oak', 'Solid European White Oak', 649, 180, 95, 76, 4, 769, false, 'Effortlessly versatile extendable dining table with concealed butterfly leaf mechanism seating up to 10 guests.'),
  p('koben-travertine-pedestal-table', 'Koben Round Travertine Table', 'Dining Room', 'Modern Organic', 'Warm Alabaster', 'Solid Roman Travertine', 799, 115, 115, 75, 3, 949, false, 'Monolithic round dining table carved from porous Italian travertine with honed matte surface and fluted cylinder base.'),
  p('oslo-dining-chair', 'Oslo Sculpted Dining Chair', 'Dining Room', 'Scandinavian', 'Warm Ash & Sand', 'Solid Ash & Wool Blend', 189, 52, 54, 78, 12, 229, false, 'Artisan dining chair with continuous steam-bent timber backrest and premium stain-resistant wool seat cushion.'),
  p('luca-cane-dining-chair', 'Luca Cantilever Cane Chair', 'Dining Room', 'Mid-Century Modern', 'Honey Beech & Cane', 'Natural Rattan Cane & Chrome', 179, 48, 52, 82, 10, 219, false, 'Iconic Bauhaus-inspired cantilever dining armchair featuring handwoven French cane weave and resilient tubular steel.'),
  p('clara-velvet-dining-chair', 'Clara Tailored Dining Armchair', 'Dining Room', 'Modern Classic', 'Warm Oatmeal Linen', 'Performance Linen & Brass', 219, 58, 56, 80, 8, 269, false, 'Generously padded dining chair with wrap-around lumbar support, sloped armrests, and brass-capped tapered timber legs.'),
  p('nordic-wishbone-chair', 'Nordic Wishbone Dining Chair', 'Dining Room', 'Danish Modern', 'Natural Ash Wood', 'Solid Ash & Natural Papercord', 199, 55, 53, 76, 12, 239, false, 'Timeless classic wishbone chair handcrafted with steam-bent solid ash frame and hand-braided natural papercord seating.'),
  p('haven-dining-bench', 'Haven Solid Wood Dining Bench', 'Dining Room', 'Modern Craft', 'Natural White Oak', 'FSC Solid White Oak', 259, 140, 38, 46, 6, 319, false, 'Solid timber dining bench featuring organic rounded corners, mortise-and-tenon joinery, and comfortable beveled edges.'),
  p('soren-dining-sideboard', 'Soren Fluted Dining Buffet', 'Dining Room', 'Japandi Modern', 'Natural Oak & Cane', 'Solid White Oak & Cane', 589, 175, 46, 82, 3, 699, false, 'Expansive dining credenza with sliding tambour ribbed doors, felt-lined silverware drawers, and adjustable interior shelving.'),
  p('milo-bar-cabinet', 'Milo Modern Walnut Bar Cabinet', 'Dining Room', 'Mid-Century Modern', 'Smoked Walnut & Brass', 'American Walnut & Brass', 529, 95, 45, 125, 4, 629, false, 'Dedicated entertaining bar cabinet equipped with stemware racks, 12-bottle wine storage, and warm brass inlay accents.'),
  p('arura-dining-pendant', 'Arura Linear Chandelier Pendant', 'Dining Room', 'Contemporary Luxury', 'Brushed Brass & Glass', 'Hand-Spun Brass & Opal Glass', 219, 110, 24, 38, 7, 269, false, 'Architectural linear dining table lighting chandelier providing glare-free 2700K ambient illumination across the tabletop.'),
  p('tala-stoneware-dinnerware', 'Tala Artisan 16-Piece Ceramic Service', 'Dining Room', 'Artisan Stoneware', 'Muted Terracotta', 'Handmade Stoneware Ceramic', 149, 28, 28, 12, 16, 189, false, 'Complete artisanal dinnerware setting including 4 dinner plates, salad plates, soup bowls, and dessert vessels.'),
  p('sol-dining-bar-stools', 'Sol Solid Ash Counter Stools (Pair)', 'Dining Room', 'Japandi Minimalist', 'Natural White Ash', 'Solid European Ash', 289, 44, 44, 66, 6, 349, false, 'Set of two counter-height minimalist kitchen island and bar stools featuring sculpted saddle seats and brass footrests.'),

  // ─── OTHER ROOM CATEGORIES ───────────────────────────────────────────────────────────
  p('stylish-lamp', 'Stylish Dome Lamp', 'Lighting', 'Modern', 'Mustard & Ceramic', 'Ceramic & Brass', 89, 28, 28, 42, 15, 119, true, 'Architectural mushroom dome table lamp with a warm mustard glazed dome and speckled ceramic pedestal base.'),
  p('rae-pendant', 'Rae Pendant Light', 'Lighting', 'Contemporary', 'Brushed Brass', 'Spun Brass & Glass', 119, 35, 35, 40, 20, 149, false, 'Modern sculptural pendant with hand-brushed brass finish and diffused warm illumination.'),
  p('kaito-desk', 'Kaito Work Desk', 'Home Office', 'Japandi', 'Warm Walnut', 'Walnut & Steel', 279, 140, 65, 75, 7, 329, false, 'Refined workspace desk with cord management groove, slim drawer, and solid wood legs.'),
  p('vale-chair', 'Vale Balcony Chair', 'Balcony', 'Bohemian', 'Natural Tan', 'Handwoven Rattan', 189, 62, 65, 84, 9, 219, false, 'Breathable handwoven natural rattan chair with weather-resistant clear protective coat.'),
  p('arc-shelf', 'Arc Bookshelf', 'Storage', 'Industrial Modern', 'Matte Black', 'Powdered Steel & Oak', 229, 85, 35, 175, 6, 269, false, 'Geometric open-frame shelving unit designed to display ceramics, books, and green botanicals.'),
  p('tala-vase', 'Tala Ceramic Vase', 'Decor', 'Minimalist', 'Muted Sand', 'Artisan Stoneware', 49, 16, 16, 32, 25, 65, false, 'Matte textured ceramic vessel hand-thrown by artisan potters, ideal for dried florals or branches.'),
  p('haven-lounge', 'Haven Outdoor Lounge', 'Outdoor Furniture', 'Modern Resort', 'Teak & Charcoal', 'Weatherproof Teak', 459, 150, 85, 72, 3, 529, false, 'Grade-A teak outdoor lounge bench equipped with sun-proof, water-repellent quick-dry foam cushions.'),
  p('zen-credenza', 'Zen Fluted Credenza', 'Storage', 'Japandi', 'Natural White Oak', 'Oak & Ribbed Glass', 489, 160, 45, 82, 4, 569, false, 'Four-door low credenza featuring tambour fluted sliding doors and soft interior adjustable shelving.'),
  p('sol-mirror', 'Sol Arched Floor Mirror', 'Decor', 'Modern Luxury', 'Brushed Brass', 'Brass & Annealed Glass', 159, 60, 4, 170, 8, 189, false, 'Full-length arched statement mirror with slender brushed brass frame and shatterproof mirror glass.')
]
