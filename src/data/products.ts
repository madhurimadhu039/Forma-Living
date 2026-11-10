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
  p('cozy-armchair', 'Cozy Armchair', 'Living Room', 'Modern', 'Beige', 'Boucle & Oak', 52000, 82, 85, 78, 8, 62000, true, 'An inviting modern armchair upholstered in soft textured boucle with sculpted natural oak legs.'),
  p('modern-sofa', 'Modern Sofa', 'Living Room', 'Contemporary', 'Cream', 'Linen Blend', 115000, 210, 92, 82, 4, 135000, true, 'Sleek two-seater sofa with deep cushioning, clean lines, and neutral stain-resistant linen upholstery.'),
  p('luca-chair', 'Luca Lounge Chair', 'Living Room', 'Japandi', 'Sand Beige', 'Solid Ash & Linen', 62000, 78, 82, 76, 5, 72000, false, 'Japanese-Scandinavian lounge chair with low-profile silhouette and tailored linen cushioning.'),
  p('soren-sofa', 'Soren 3-Seater Sofa', 'Living Room', 'Scandinavian', 'Warm Ivory', 'Textured Boucle', 155000, 230, 95, 80, 3, 180000, false, 'Grand three-seater lounge sofa with organic curved contouring and plush feather-blend cushions.'),
  p('kyoto-coffee-table', 'Kyoto Fluted Coffee Table', 'Living Room', 'Japandi', 'Natural Oak', 'Solid White Oak', 54000, 90, 90, 42, 6, 64000, false, 'Sculptural circular coffee table featuring handcrafted tambour fluted pedestal base and organic bullnose edge profile.'),
  p('nordic-recliner', 'Nordic Swivel Lounge Chair', 'Living Room', 'Scandinavian Modern', 'Warm Caramel', 'Top-Grain Leather & Steel', 88000, 82, 85, 88, 5, 105000, false, 'Ergonomic 360-degree swivel lounge chair tailored in supple top-grain leather on an architectural matte black steel base.'),
  p('haven-sectional', 'Haven Modular Corner Sofa', 'Living Room', 'Modern Minimalist', 'Oatmeal', 'Performance Linen Blend', 245000, 280, 165, 82, 2, 285000, false, 'Generously proportioned modular corner sectional with deep foam-feather seats and spill-resistant relaxed linen upholstery.'),
  p('verona-side-table', 'Verona Travertine Side Table', 'Living Room', 'Contemporary Luxury', 'Warm Alabaster', 'Honed Roman Travertine', 36000, 45, 45, 52, 9, 44000, false, 'Solid natural Roman travertine end table cut with architectural pill-shaped pedestal and velvet soft honed matte finish.'),
  p('marfa-chaise', 'Marfa Velvet Chaise Lounge', 'Living Room', 'Mid-Century Modern', 'Olive Ochre', 'Mohair Velvet & Brass', 95000, 175, 85, 78, 3, 115000, false, 'Tailored daybed and reading chaise crafted with high-density foam core, subtle channel tufting, and brass capped walnut legs.'),
  p('oslo-credenza', 'Oslo Low Oak Media Console', 'Living Room', 'Scandinavian', 'Bleached Oak', 'Solid White Oak & Cane', 88000, 180, 42, 54, 4, 105000, false, 'Low-slung entertainment sideboard with acoustic cane weave sliding tambour doors and discrete rear cable passages.'),
  p('boucle-pouf', 'Terrazzo & Boucle Round Ottoman', 'Living Room', 'Modern Organic', 'Cream White', 'Textured Boucle & Foam', 22000, 55, 55, 44, 12, 27000, false, 'Multi-functional accent footstool and impromptu seating piece wrapped in tactile nubby boucle with weighted non-slip base.'),
  p('solis-accent-chair', 'Solis Sculptural Accent Chair', 'Living Room', 'Japandi Modern', 'Sand & Natural Wood', 'Bent Ash Wood & Wool', 65000, 74, 76, 75, 7, 78000, false, 'Artful statement chair pairing fluid bentwood ash geometry with a thick upholstered wool-blend floating seat cushion.'),
  p('arura-bookshelf', 'Arura Low Display Shelf', 'Living Room', 'Industrial Modern', 'Smoked Walnut', 'Smoked Oak & Iron', 68000, 140, 36, 85, 5, 82000, false, 'Low architectural open display shelving unit designed for curated art books, ceramics, and ambient lighting accents.'),
  p('velvet-accent-chair', 'Clara Barrel Armchair', 'Living Room', 'Modern Classic', 'Forest Green', 'Textured Velvet & Beech', 56000, 78, 80, 82, 6, 68000, false, 'Gracefully curved accent armchair with wrap-around barrel back support, high-resilience foam, and tapered hardwood legs.'),
  p('tokyo-media-unit', 'Tokyo Fluted Lowboard', 'Living Room', 'Japandi Minimalist', 'Charcoal Ash', 'Charcoal Oak & Brass', 105000, 195, 45, 50, 3, 125000, false, 'Expansive contemporary media console with ribbed tambour sliding doors and soft-close storage compartments.'),
  p('fluted-wood-table', 'Forma Minimalist Nesting Tables', 'Living Room', 'Modern Organic', 'Light Blonde Wood', 'Solid Ash Wood', 38000, 70, 70, 46, 8, 46000, false, 'Set of two organic circular nesting coffee tables designed to tuck together or separate across living room seating areas.'),

  // ─── BEDROOM COLLECTION (EXPANDED WITH DISTINCT IMAGES) ─────────────────────────
  p('noor-bed', 'Noor Platform Bed', 'Bedroom', 'Minimalist', 'Natural Oak', 'Solid European Oak', 135000, 180, 215, 95, 4, 158000, true, 'Minimalist solid oak platform bed with floating aesthetic and integrated headboard ledge.'),
  p('astrid-linen-bed', 'Astrid Upholstered Bed', 'Bedroom', 'Modern Scandinavian', 'Warm Sand', 'Belgian Linen & Solid Ash', 155000, 190, 220, 105, 5, 180000, false, 'Contoured bed frame upholstered in textured Belgian linen with a gently curved pillow-back headboard and solid ash support.'),
  p('kyoto-tatami-bed', 'Kyoto Tatami Platform Bed', 'Bedroom', 'Japandi', 'Natural Muted Oak', 'Solid Japanese White Oak', 148000, 200, 225, 68, 4, 175000, false, 'Low-profile architectural bed inspired by traditional Japanese joinery with wide border ledges and breathable tatami-slat support.'),
  p('milo-spindle-bed', 'Milo Solid Walnut Spindle Bed', 'Bedroom', 'Mid-Century Modern', 'Deep Walnut', 'American Black Walnut', 175000, 185, 215, 110, 3, 205000, false, 'Handcrafted spindle bed frame showcasing tapered spindles, rounded corners, and rich continuous walnut wood grain.'),
  p('serene-canopy-bed', 'Serene Minimalist Canopy Bed', 'Bedroom', 'Contemporary Luxury', 'Matte Black', 'Powder-Coated Steel & Oak', 185000, 188, 218, 205, 2, 220000, false, 'Architectural four-poster canopy bed with slim rectilinear profiles and solid oak mattress foundation.'),
  p('sora-nightstand', 'Sora Floating Bedside Table', 'Bedroom', 'Japandi', 'Warm Natural Oak', 'Solid White Oak', 32000, 48, 40, 50, 8, 38000, false, 'Clean-lined bedside table featuring a soft-close dovetail drawer, open storage shelf, and integrated cord management notch.'),
  p('cali-cane-nightstand', 'Cali Cane Bedside Cabinet', 'Bedroom', 'Modern Organic', 'Muted Almond', 'Solid Ash & Natural Cane', 36000, 52, 42, 58, 6, 44000, false, 'Artisan-crafted bedside cabinet with handwoven natural rattan cane door and warm satin brass pull.'),
  p('luna-travertine-nightstand', 'Luna Travertine Round Nightstand', 'Bedroom', 'Contemporary Luxury', 'Warm Ivory Alabaster', 'Honed Roman Travertine', 46000, 45, 45, 54, 7, 56000, false, 'Sculptural cylindrical bedside pedestal carved from genuine honed travertine with subtle natural veining.'),
  p('nordic-6-drawer-dresser', 'Nordic 6-Drawer Oak Dresser', 'Bedroom', 'Scandinavian Modern', 'Bleached White Oak', 'FSC Solid White Oak', 128000, 160, 48, 85, 4, 150000, false, 'Generously proportioned 6-drawer horizontal dresser featuring recessed finger pulls and soft-close undermount runners.'),
  p('kyoto-tallboy-chest', 'Kyoto 5-Drawer High Chest', 'Bedroom', 'Japandi Minimalist', 'Natural Ash Wood', 'Solid Ash & Brass', 98000, 90, 45, 120, 5, 118000, false, 'Space-saving vertical highboy dresser with five deep storage drawers and delicate brushed brass hardware accents.'),
  p('alva-boucle-bench', 'Alva End-of-Bed Boucle Bench', 'Bedroom', 'Modern Scandinavian', 'Chalk White', 'Textured Boucle & Solid Ash', 45000, 135, 42, 46, 8, 54000, false, 'Pill-shaped end-of-bed bench upholstered in cozy high-pile boucle with rounded solid ash wood legs.'),
  p('haven-leather-bench', 'Haven Woven Leather Bench', 'Bedroom', 'Modern Craft', 'Cognac Tan', 'Top-Grain Leather & Teak', 58000, 130, 40, 45, 6, 70000, false, 'Hand-strapped saddle leather bench with solid plantation teak framework, ideal at foot of the bed or bedroom dressing nooks.'),
  p('solene-bedside-lamp', 'Solene Ceramic Bedside Lamp', 'Bedroom', 'Artisan Modern', 'Terracotta & Linen', 'Stoneware & Pleated Linen', 16500, 26, 26, 44, 14, 21000, false, 'Warm ambient bedside table lamp featuring a tactile matte ceramic urn base and folded knife-pleat linen shade.'),
  p('arc-bedroom-mirror', 'Lumiere Arched Full-Length Mirror', 'Bedroom', 'Modern Minimalist', 'Brushed Brass', 'Anodized Aluminum & Glass', 42000, 65, 4, 175, 7, 52000, false, 'Tall freestanding bedroom floor mirror with an elegant thin arched brass frame and ultra-clear shatterproof glass.'),
  p('elena-vanity-desk', 'Elena Fluted Bedroom Vanity Desk', 'Bedroom', 'Contemporary Luxury', 'Natural Oak & Brass', 'Solid White Oak & Marble', 85000, 110, 50, 78, 5, 102000, false, 'Chic bedroom dressing table and study desk featuring fluted drawer detailing, concealed jewelry organizer, and brass accents.'),

  // ─── DINING ROOM COLLECTION (EXPANDED WITH DISTINCT IMAGES) ─────────────────────────
  p('wooden-table', 'Wooden Dining Table', 'Dining Room', 'Minimalist', 'Natural Oak', 'Solid Oak', 92000, 160, 85, 76, 6, 112000, true, 'Hand-finished solid European oak dining table featuring smooth rounded perimeter edges, natural oiled grain, and sturdy tapered timber legs.'),
  p('alma-table', 'Alma Dining Table', 'Dining Room', 'Modern', 'Walnut', 'American Walnut', 115000, 160, 90, 76, 4, 138000, false, 'Statement dining table crafted with rich grain American walnut veneer and beveled perimeter.'),
  p('kyoto-round-dining-table', 'Kyoto Round Pedestal Table', 'Dining Room', 'Japandi', 'Natural Muted Oak', 'Solid White Oak', 125000, 120, 120, 76, 5, 148000, true, 'Sculptural circular dining table featuring a bold fluted column base and beveled reverse bullnose perimeter.'),
  p('verona-marble-dining-table', 'Verona Oval Marble Dining Table', 'Dining Room', 'Contemporary Luxury', 'Calacatta & Walnut', 'Calacatta Marble & Walnut', 315000, 210, 105, 76, 2, 365000, false, 'Showcase oval dining table featuring a honed Italian Calacatta marble slab seated on twin contoured walnut pedestals.'),
  p('solis-extendable-table', 'Solis Extendable Oak Dining Table', 'Dining Room', 'Scandinavian Modern', 'Warm Bleached Oak', 'Solid European White Oak', 165000, 180, 95, 76, 4, 195000, false, 'Effortlessly versatile extendable dining table with concealed butterfly leaf mechanism seating up to 10 guests.'),
  p('koben-travertine-pedestal-table', 'Koben Round Travertine Table', 'Dining Room', 'Modern Organic', 'Warm Alabaster', 'Solid Roman Travertine', 235000, 115, 115, 75, 3, 275000, false, 'Monolithic round dining table carved from porous Italian travertine with honed matte surface and fluted cylinder base.'),
  p('oslo-dining-chair', 'Oslo Sculpted Dining Chair', 'Dining Room', 'Scandinavian', 'Warm Ash & Sand', 'Solid Ash & Wool Blend', 28000, 52, 54, 78, 12, 34000, false, 'Artisan dining chair with continuous steam-bent timber backrest and premium stain-resistant wool seat cushion.'),
  p('luca-cane-dining-chair', 'Luca Cantilever Cane Chair', 'Dining Room', 'Mid-Century Modern', 'Honey Beech & Cane', 'Natural Rattan Cane & Chrome', 26000, 48, 52, 82, 10, 32000, false, 'Iconic Bauhaus-inspired cantilever dining armchair featuring handwoven French cane weave and resilient tubular steel.'),
  p('clara-velvet-dining-chair', 'Clara Tailored Dining Armchair', 'Dining Room', 'Modern Classic', 'Warm Oatmeal Linen', 'Performance Linen & Brass', 34000, 58, 56, 80, 8, 42000, false, 'Generously padded dining chair with wrap-around lumbar support, sloped armrests, and brass-capped tapered timber legs.'),
  p('nordic-wishbone-chair', 'Nordic Wishbone Dining Chair', 'Dining Room', 'Danish Modern', 'Natural Ash Wood', 'Solid Ash & Natural Papercord', 32000, 55, 53, 76, 12, 38000, false, 'Timeless classic wishbone chair handcrafted with steam-bent solid ash frame and hand-braided natural papercord seating.'),
  p('haven-dining-bench', 'Haven Solid Wood Dining Bench', 'Dining Room', 'Modern Craft', 'Natural White Oak', 'FSC Solid White Oak', 48000, 140, 38, 46, 6, 58000, false, 'Solid timber dining bench featuring organic rounded corners, mortise-and-tenon joinery, and comfortable beveled edges.'),
  p('soren-dining-sideboard', 'Soren Fluted Dining Buffet', 'Dining Room', 'Japandi Modern', 'Natural Oak & Cane', 'Solid White Oak & Cane', 135000, 175, 46, 82, 3, 160000, false, 'Expansive dining credenza with sliding tambour ribbed doors, felt-lined silverware drawers, and adjustable interior shelving.'),
  p('milo-bar-cabinet', 'Milo Modern Walnut Bar Cabinet', 'Dining Room', 'Mid-Century Modern', 'Smoked Walnut & Brass', 'American Walnut & Brass', 125000, 95, 45, 125, 4, 148000, false, 'Dedicated entertaining bar cabinet equipped with stemware racks, 12-bottle wine storage, and warm brass inlay accents.'),
  p('arura-dining-pendant', 'Arura Linear Chandelier Pendant', 'Dining Room', 'Contemporary Luxury', 'Brushed Brass & Glass', 'Hand-Spun Brass & Opal Glass', 48000, 110, 24, 38, 7, 58000, false, 'Architectural linear dining table lighting chandelier providing glare-free 2700K ambient illumination across the tabletop.'),
  p('tala-stoneware-dinnerware', 'Tala Artisan 16-Piece Ceramic Service', 'Dining Room', 'Artisan Stoneware', 'Muted Terracotta', 'Handmade Stoneware Ceramic', 24000, 28, 28, 12, 16, 29000, false, 'Complete artisanal dinnerware setting including 4 dinner plates, salad plates, soup bowls, and dessert vessels.'),
  p('sol-dining-bar-stools', 'Sol Solid Ash Counter Stools (Pair)', 'Dining Room', 'Japandi Minimalist', 'Natural White Ash', 'Solid European Ash', 46000, 44, 44, 66, 6, 55000, false, 'Set of two counter-height minimalist kitchen island and bar stools featuring sculpted saddle seats and brass footrests.'),

  // ─── LIGHTING COLLECTION (EXPANDED WITH DISTINCT IMAGES) ─────────────────────────
  p('stylish-lamp', 'Stylish Dome Lamp', 'Lighting', 'Modern', 'Mustard & Ceramic', 'Ceramic & Brass', 18500, 28, 28, 42, 15, 23000, true, 'Architectural mushroom dome table lamp with a warm mustard glazed dome and speckled ceramic pedestal base.'),
  p('rae-pendant', 'Rae Pendant Light', 'Lighting', 'Contemporary', 'Brushed Brass', 'Spun Brass & Glass', 24000, 35, 35, 40, 20, 29000, false, 'Modern sculptural pendant with hand-brushed brass finish and diffused warm illumination.'),
  p('solis-glass-pendant', 'Solis Fluted Glass Pendant', 'Lighting', 'Contemporary', 'Amber & Brass', 'Ribbed Glass & Brass', 26000, 30, 30, 36, 18, 32000, false, 'Hand-blown fluted amber glass globe pendant light casting warm radiating ripples of ambient light.'),
  p('aura-brass-chandelier', 'Aura Branching Brass Chandelier', 'Lighting', 'Modern Luxury', 'Brushed Brass & Opal', 'Spun Brass & Opal Glass', 85000, 95, 75, 60, 5, 102000, true, 'Sculptural branching chandelier with 6 hand-finished brass arms and frosted dual-layer glass globes.'),
  p('nordic-paper-pendant', 'Nordic Folded Paper Pendant', 'Lighting', 'Scandinavian', 'Warm White Washi', 'Artisan Paper & Ash', 19500, 45, 45, 48, 12, 24500, false, 'Organic geometric folded washi paper shade with natural ash wood cap for soft glare-free illumination.'),
  p('kyoto-bamboo-lantern', 'Kyoto Woven Bamboo Lantern', 'Lighting', 'Japandi', 'Natural Bamboo', 'Handwoven Bamboo & Linen', 22500, 38, 38, 52, 14, 28000, false, 'Traditional artisan handwoven bamboo lattice pendant lantern with interior cream linen light diffuser.'),
  p('arc-brass-floor-lamp', 'Arc Modern Brass Floor Lamp', 'Lighting', 'Modern Classic', 'Warm Brass & Marble', 'Solid Brass & Carrara Marble', 76000, 110, 40, 195, 6, 92000, true, 'Dramatic cantilevered arched floor lamp anchored by a heavy white marble base and dome brass shade.'),
  p('astrid-tripod-lamp', 'Astrid Solid Ash Tripod Lamp', 'Lighting', 'Scandinavian', 'Natural Ash & Linen', 'Solid Ash & Belgian Linen', 48000, 55, 55, 150, 8, 58000, false, 'Mid-century tripod standing floor lamp crafted with tapered solid ash legs and oversized linen drum shade.'),
  p('monolith-fluted-floor-lamp', 'Monolith Ceramic Fluted Floor Lamp', 'Lighting', 'Modern Organic', 'Cream Ceramic', 'Textured Ceramic & Linen', 58000, 35, 35, 140, 7, 72000, false, 'Architectural fluted ceramic totem floor lamp that doubles as a minimalist illuminated interior sculpture.'),
  p('luna-globe-floor-lamp', 'Luna Dual Globe Floor Lamp', 'Lighting', 'Contemporary Luxury', 'Brushed Brass & White', 'Brushed Brass & Opal Glass', 54000, 32, 32, 165, 9, 65000, false, 'Slender vertical floor lamp featuring two offset milky glass spheres emitting warm dimmable 360-degree light.'),
  p('verona-travertine-lamp', 'Verona Travertine Cube Lamp', 'Lighting', 'Contemporary Luxury', 'Honed Travertine & Linen', 'Roman Travertine & Pleated Linen', 32000, 22, 22, 38, 12, 39000, false, 'Heavy carved Roman travertine stone block table lamp crowned with an ivory accordion-pleated shade.'),
  p('clara-mushroom-lamp', 'Clara Cordless Brass Lamp', 'Lighting', 'Modern Minimalist', 'Satin Brass', 'Spun Aluminum & Brass', 17500, 20, 20, 30, 20, 22000, false, 'Rechargeable cordless portable mushroom accent lamp with 3-stage touch dimmer and 14-hour battery life.'),
  p('kaito-architect-lamp', 'Kaito Studio Task Lamp', 'Lighting', 'Industrial Modern', 'Matte Black & Walnut', 'Steel & American Walnut', 24000, 45, 18, 55, 15, 29000, false, 'Precision engineered articulating desk lamp with counterbalanced walnut arm and directed task light beam.'),
  p('soren-ceramic-table-lamp', 'Soren Terracotta Accent Lamp', 'Lighting', 'Japandi Modern', 'Terracotta & Raffia', 'Stoneware & Natural Raffia', 26000, 28, 28, 44, 11, 32000, false, 'Organic textured terracotta vase lamp with handcrafted natural woven raffia shade for rich evening ambiance.'),
  p('haven-brass-sconce', 'Haven Articulating Wall Sconce', 'Lighting', 'Modern Luxury', 'Brushed Brass', 'Solid Brass & Steel', 24000, 18, 38, 28, 16, 29500, false, 'Hardwired swing-arm bedside and reading wall sconce with rotatable brass cone shade and integrated switch.'),
  p('zen-linen-sconce', 'Zen Pleated Wall Sconce', 'Lighting', 'Japandi', 'Warm Sand Linen', 'Linen Fabric & Oiled Oak', 19500, 24, 15, 32, 18, 24000, false, 'Soft ambient wall sconce crafted from folded Belgian linen over an oiled oak backplate for gentle glow.'),

  // ─── BALCONY COLLECTION (EXPANDED WITH DISTINCT IMAGES) ───────────────────────────
  p('vale-chair', 'Vale Balcony Chair', 'Balcony', 'Bohemian', 'Natural Tan', 'Handwoven Rattan', 34000, 62, 65, 84, 9, 42000, true, 'Breathable handwoven natural rattan chair with weather-resistant clear protective coat.'),
  p('rio-terrazzo-bistro-table', 'Rio Terrazzo Bistro Table', 'Balcony', 'Modern Resort', 'Forest Green & Terrazzo', 'Terrazzo & Powder-Coated Steel', 38000, 70, 70, 75, 8, 46000, true, 'Compact circular balcony table with heavy polished white terrazzo top and UV-resistant sage steel base.'),
  p('cannes-folding-bistro-set', 'Cannes 3-Piece Folding Bistro Set', 'Balcony', 'French Provincial', 'Warm Honey Acacia', 'FSC Solid Acacia Wood', 48000, 65, 65, 74, 10, 58000, true, 'Space-saving outdoor dining set including one foldable square bistro table and two matching folding slatted chairs.'),
  p('sorrento-mosaic-bistro-table', 'Sorrento Mosaic Balcony Table', 'Balcony', 'Mediterranean', 'Terracotta & Iron', 'Hand-Laid Ceramic & Cast Iron', 34000, 60, 60, 72, 7, 42000, false, 'Artisanal outdoor cafe table featuring hand-cut ceramic mosaic tile in warm earth tones atop an anti-rust cast iron pedestal.'),
  p('tulum-acapulco-chair', 'Tulum Woven Acapulco Chair', 'Balcony', 'Bohemian Modern', 'Olive Green', 'Weatherproof Cord & Steel', 26000, 72, 80, 85, 12, 32000, false, 'Ergonomic retro-modern string weave balcony lounge chair crafted with flexible UV-resistant vinyl cord on powder-coated steel.'),
  p('palma-rattan-rocker', 'Palma All-Weather Rattan Rocker', 'Balcony', 'Coastal Minimalist', 'Natural Sand', 'Synthetic Resin Wicker & Teak', 52000, 68, 88, 82, 6, 64000, false, 'Relaxing balcony rocking chair hand-woven with weather-resistant all-weather wicker over a smooth solid teak rocking base.'),
  p('bali-hanging-egg-chair', 'Bali Hanging Rattan Swing Chair', 'Balcony', 'Bohemian Luxury', 'Natural Tan & Cream', 'Synthetic Rattan & Steel', 82000, 95, 95, 195, 4, 98000, true, 'Suspended outdoor cocoon egg swing chair with heavy-duty stand, safety spring chain, and plush water-repellent pillow.'),
  p('capri-compact-lounger', 'Capri Folding Teak Sun Lounger', 'Balcony', 'Modern Resort', 'Natural Teak & Sand', 'Grade-A Teak & Batyline Mesh', 65000, 65, 160, 80, 5, 78000, false, 'Slimline folding balcony chaise lounger with 4 adjustable reclining angles and breathable quick-drying sling fabric.'),
  p('santorini-rope-armchair', 'Santorini Braided Rope Armchair', 'Balcony', 'Contemporary Outdoor', 'Charcoal & Grey', 'Olefin Rope & Aluminum', 36000, 60, 62, 78, 9, 44000, false, 'Sleek architectural balcony dining armchair featuring hand-braided marine olefin rope backrest and quick-dry cushion.'),
  p('ibiza-slat-teak-bench', 'Ibiza Slatted Teak Balcony Bench', 'Balcony', 'Scandinavian Outdoor', 'Natural Teak', 'FSC Certified Solid Teak', 54000, 115, 48, 82, 6, 65000, false, 'Compact 2-seater slatted outdoor bench crafted from natural oil-rich teak that patinas beautifully to silver-grey.'),
  p('marseille-compact-daybed', 'Marseille Compact Balcony Loveseat', 'Balcony', 'Modern Luxury', 'Warm Oatmeal', 'All-Weather Wicker & Olefin', 95000, 135, 75, 76, 3, 115000, false, 'Cozy 2-seater outdoor balcony loveseat sofa with deep high-density water-resistant cushions and powder-coated frame.'),
  p('sol-tiered-plant-stand', 'Sol 3-Tier Corner Plant Stand', 'Balcony', 'Japandi Outdoor', 'Matte Black & Teak', 'Powdered Steel & Solid Teak', 22000, 45, 45, 95, 15, 27000, false, 'Vertical three-tier quarter-round corner plant display designed to maximize leafy greenery on compact apartment balconies.'),
  p('porto-fluted-planter-set', 'Porto Fluted Fiberstone Planters (Trio)', 'Balcony', 'Modern Organic', 'Muted Chalk White', 'Lightweight Fiberstone Composite', 28000, 36, 36, 48, 11, 34000, false, 'Set of three nesting fluted outdoor balcony planters equipped with internal drainage holes and frost-resistant finish.'),
  p('zen-vertical-herb-wall', 'Zen Cedar Vertical Balcony Planter', 'Balcony', 'Urban Garden', 'Natural Cedar', 'Western Red Cedar Wood', 24000, 60, 18, 110, 8, 29000, false, 'Wall-hanging four-box vertical herb and floral planter crafted with rot-resistant cedar wood and removable planter liners.'),
  p('amalfi-solar-floor-lantern', 'Amalfi Teak & Solar Floor Lantern', 'Balcony', 'Modern Resort', 'Natural Teak & Glass', 'Plantation Teak & Frosted Glass', 18500, 22, 22, 45, 16, 23000, false, 'Cordless outdoor solar lantern with dusk-to-dawn sensor, warm amber LED candlelight mode, and solid teak handle.'),
  p('toscana-ceramic-side-table', 'Toscana Glazed Outdoor Garden Stool', 'Balcony', 'Artisan Mediterranean', 'Sage Green Glaze', 'High-Fired Stoneware Ceramic', 21000, 34, 34, 45, 14, 26000, false, 'Multi-functional glazed ceramic balcony drum table suitable as an outdoor drinks perch, plant pedestal, or extra stool.'),

  // ─── HOME OFFICE COLLECTION (EXPANDED WITH DISTINCT IMAGES) ───────────────────────
  p('kaito-desk', 'Kaito Work Desk', 'Home Office', 'Japandi', 'Warm Walnut', 'Walnut & Steel', 62000, 140, 65, 75, 7, 74000, true, 'Refined workspace desk with cord management groove, slim drawer, and solid wood legs.'),
  p('nordic-standing-desk', 'Nordic Motorized Standing Desk', 'Home Office', 'Scandinavian Modern', 'Natural White Oak', 'FSC Solid Oak & Dual Motors', 128000, 150, 75, 120, 6, 150000, true, 'Height-adjustable standing desk featuring dual whisper-quiet electric motors, programmable 4-height memory, and cable tray.'),
  p('kyoto-minimalist-desk', 'Kyoto Japandi Writing Desk', 'Home Office', 'Japandi', 'Natural Ash Wood', 'Solid Ash & Cast Brass', 78000, 130, 60, 75, 8, 92000, true, 'Minimalist solid ash study desk featuring twin soft-glide stationery drawers, beveled edges, and delicate brass hardware.'),
  p('verona-executive-desk', 'Verona Executive Walnut Desk', 'Home Office', 'Modern Executive', 'American Walnut & Saddle', 'Solid Walnut & Italian Leather', 185000, 170, 80, 76, 4, 220000, false, 'Stately executive office desk detailed with an integrated top-grain leather blotter, concealed power docks, and locking drawers.'),
  p('oslo-corner-desk', 'Oslo Modern L-Shaped Corner Desk', 'Home Office', 'Scandinavian', 'Bleached Oak & White', 'White Oak & Steel Frame', 110000, 160, 120, 75, 5, 132000, false, 'Spacious modular corner workstation optimizing corner floor area with wide dual-monitor returns and cord management troughs.'),
  p('ergon-mesh-chair', 'Ergon Pro Breathable Task Chair', 'Home Office', 'Ergonomic High-Tech', 'Matte Charcoal & Silver', 'Aerated Mesh & Polished Aluminum', 68000, 68, 68, 108, 12, 82000, true, 'Fully adjustable ergonomic work chair equipped with dynamic 4D armrests, self-adjusting lumbar support, and breathable elastomeric mesh.'),
  p('clara-leather-office-chair', 'Clara Executive Swivel Chair', 'Home Office', 'Mid-Century Modern', 'Caramel Top-Grain Leather', 'Top-Grain Leather & Matte Bronze', 85000, 65, 65, 96, 7, 102000, false, 'Luxurious high-back executive desk chair upholstered in supple aniline leather with smooth pneumatic height lift and tilt lock.'),
  p('soren-upholstered-desk-chair', 'Soren Swivel Task Armchair', 'Home Office', 'Modern Organic', 'Warm Boucle & Oak', 'Tactile Boucle & Oiled Oak', 52000, 62, 60, 88, 9, 62000, false, 'Comfort-first home study chair wrapped in tactile cream boucle with padded arm contours, silent castors, and 360-degree swivel.'),
  p('sol-drafting-stool', 'Sol Adjustable Drafting Stool', 'Home Office', 'Industrial Modern', 'Saddle Tan & Iron', 'Top-Grain Leather & Steel', 34000, 46, 46, 78, 10, 42000, false, 'Architectural height-adjustable drafting stool featuring a contoured saddle seat and circular footrest ring for standing desks.'),
  p('arura-office-bookcase', 'Arura Architectural Bookshelf', 'Home Office', 'Minimalist', 'White Oak & Charcoal', 'Solid Oak & Powdered Steel', 82000, 110, 36, 185, 5, 98000, false, 'Five-tier open display bookcase designed for binders, reference books, sculptural accents, and ambient storage baskets.'),
  p('koben-mobile-file-cabinet', 'Koben 3-Drawer Under-Desk Pedestal', 'Home Office', 'Japandi', 'Natural White Oak', 'Solid White Oak & Alloy', 45000, 42, 50, 62, 8, 54000, false, 'Mobile under-desk storage cabinet featuring full-extension drawer glides, key-lockable document drawer, and hidden casters.'),
  p('zen-office-credenza', 'Zen Lowline Office Sideboard', 'Home Office', 'Scandinavian', 'Warm Bleached Ash', 'Solid Ash & Tambour Slats', 102000, 160, 45, 75, 4, 122000, false, 'Streamlined office credenza with acoustic tambour sliding doors, internal cable pass-throughs, and adjustable storage partitions.'),
  p('tala-leather-desk-mat', 'Tala Full-Grain Leather Desk Mat', 'Home Office', 'Artisan Craft', 'Cognac Tan Leather', 'Full-Grain Tuscan Leather', 14500, 85, 45, 1, 25, 18500, false, 'Smooth vegetable-tanned leather desk blotter pad with non-slip suede underside, magnetic cable clip, and edge stitching.'),
  p('haven-monitor-riser', 'Haven Dual Monitor Riser Stand', 'Home Office', 'Modern Minimalist', 'American Walnut & Aluminum', 'Solid Walnut & Anodized Aluminum', 18000, 105, 24, 11, 20, 22500, false, 'Solid timber desktop shelf providing ergonomic eye-level screen elevation with stowing clearance for keyboards and docks underneath.'),
  p('monolith-desk-organizer', 'Monolith Travertine Desk Set', 'Home Office', 'Contemporary Luxury', 'Warm Roman Travertine', 'Honed Roman Travertine Stone', 13500, 28, 14, 5, 22, 17000, false, 'Set of two sculpted Roman travertine stationery trays designed to organize fountain pens, stylus, and desktop essentials.'),
  p('lumiere-linear-task-lamp', 'Lumiere Minimalist LED Desk Bar', 'Home Office', 'Contemporary', 'Brushed Brass & Acrylic', 'Solid Brass & Glare-Free LED', 28000, 65, 15, 42, 14, 35000, false, 'Ultra-slim architectural horizontal LED desk bar lamp providing wide, even, shadow-free illumination across documents.'),

  // ─── STORAGE COLLECTION (EXPANDED WITH DISTINCT IMAGES) ───────────────────────────
  p('arc-shelf', 'Arc Bookshelf', 'Storage', 'Industrial Modern', 'Matte Black', 'Powdered Steel & Oak', 52000, 85, 35, 175, 6, 62000, true, 'Geometric open-frame shelving unit designed to display ceramics, books, and green botanicals.'),
  p('zen-credenza', 'Zen Fluted Credenza', 'Storage', 'Japandi', 'Natural White Oak', 'Oak & Ribbed Glass', 112000, 160, 45, 82, 4, 132000, true, 'Four-door low credenza featuring tambour fluted sliding doors and soft interior adjustable shelving.'),
  p('nordic-cane-sideboard', 'Nordic Cane 4-Door Sideboard', 'Storage', 'Scandinavian Modern', 'Bleached White Oak', 'Solid White Oak & Natural Cane', 128000, 175, 45, 80, 4, 152000, true, 'Low storage credenza featuring four acoustic natural cane doors, soft-close Euro hinges, and adjustable solid timber shelving.'),
  p('verona-fluted-cabinet', 'Verona Fluted Storage Credenza', 'Storage', 'Contemporary Luxury', 'Warm Alabaster Oak', 'White Oak & Travertine Top', 158000, 180, 48, 85, 3, 188000, true, 'Architectural four-door credenza featuring continuous tambour fluting and a heavy honed Roman travertine inset top.'),
  p('milo-walnut-credenza', 'Milo Mid-Century Walnut Console', 'Storage', 'Mid-Century Modern', 'Deep American Walnut', 'American Walnut & Cast Brass', 118000, 160, 45, 78, 5, 140000, false, 'Clean-lined walnut console sideboard with seamless push-to-open doors, media cord cutouts, and tapered brass legs.'),
  p('kyoto-modular-bookshelf', 'Kyoto Asymmetric Display Shelf', 'Storage', 'Japandi Minimalist', 'Natural White Oak', 'FSC Solid White Oak', 96000, 120, 35, 180, 6, 115000, true, 'Artistic architectural open shelving unit featuring varied geometric cubbies designed for ceramics, art books, and greenery.'),
  p('solis-ladder-shelf', 'Solis Leaning Wall Ladder Shelf', 'Storage', 'Modern Minimalist', 'Natural Ash & Matte Black', 'Solid Ash & Steel Frame', 38000, 65, 38, 190, 8, 46000, false, 'Space-saving five-tier leaning ladder shelf with high-rimmed solid ash trays and non-slip rubber wall feet.'),
  p('oslo-arch-bookcase', 'Oslo Arched Tall Bookcase', 'Storage', 'Scandinavian', 'Warm Sand White', 'MDF & Solid Beech Wood', 92000, 90, 40, 195, 4, 110000, false, 'Gracefully curved arched bookcase featuring three open display shelves above a double-door concealed lower storage cabinet.'),
  p('astrid-armoire-wardrobe', 'Astrid Freestanding 2-Door Armoire', 'Storage', 'Modern Scandinavian', 'Muted Almond Oak', 'Solid Oak & Linen Interior', 185000, 110, 60, 195, 3, 220000, false, 'Substantial double-door bedroom wardrobe cabinet equipped with a full-width cedar hanging rod, twin interior drawers, and shoe shelf.'),
  p('havana-cane-wardrobe', 'Havana Tall Woven Cane Armoire', 'Storage', 'Bohemian Luxury', 'Natural Honey Ash', 'Solid Ash & French Rattan Cane', 168000, 105, 58, 190, 3, 198000, false, 'Airy tall storage cabinet with hand-woven natural rattan cane door panels, cedar interior shelving, and brushed brass door pulls.'),
  p('haven-entryway-bench-storage', 'Haven Entryway Hall Tree & Storage', 'Storage', 'Modern Craft', 'Natural White Oak', 'Solid White Oak & Brass Hooks', 82000, 100, 42, 185, 5, 98000, false, 'All-in-one entryway hall tree combining five solid brass coat hooks, an arched statement mirror, and a shoe bench with under-seat drawer.'),
  p('sora-shoe-storage-cabinet', 'Sora 3-Tier Tilt-Out Shoe Cabinet', 'Storage', 'Japandi Space-Saving', 'Bleached Oak', 'Solid White Oak & Alloy', 48000, 75, 24, 125, 7, 58000, false, 'Ultra-slim entryway shoe storage cabinet with three double-depth fold-out compartments holding up to 18 pairs of shoes.'),
  p('clara-glass-curio-cabinet', 'Clara Ribbed Glass Display Cabinet', 'Storage', 'Modern Industrial', 'Matte Black & Fluted Glass', 'Powdered Steel & Reeded Glass', 95000, 85, 40, 160, 4, 115000, false, 'Contemporary tall curio display cabinet with tempered ribbed fluted glass doors that softly blur interior contents.'),
  p('koben-accent-chest', 'Koben 4-Drawer Accent Chest', 'Storage', 'Scandinavian', 'Natural Oiled Oak', 'Solid Oak & Brass', 78000, 80, 45, 95, 6, 92000, false, 'Versatile four-drawer storage commode featuring dovetail joinery, recessed finger grips, and smooth undermount glides.'),
  p('porto-woven-storage-trunks', 'Porto Woven Storage Trunks (Set of 2)', 'Storage', 'Artisan Bohemian', 'Natural Seagrass & Saddle', 'Handwoven Seagrass & Leather', 32000, 70, 42, 40, 10, 39000, false, 'Nesting duo of sturdy hand-braided seagrass storage trunks with full-grain leather buckle closures and cotton lining.'),
  p('luna-travertine-storage-caddy', 'Luna Travertine Vanity Storage Vessel', 'Storage', 'Contemporary Luxury', 'Honed Roman Travertine', 'Solid Roman Travertine Stone', 17500, 24, 16, 14, 18, 22000, false, 'Heavy carved natural Roman travertine canister and tray set with removable lid for vanity cosmetics or desktop treasures.'),

  // ─── DECOR COLLECTION (EXPANDED WITH DISTINCT IMAGES) ─────────────────────────────
  p('tala-vase', 'Tala Ceramic Vase', 'Decor', 'Minimalist', 'Muted Sand', 'Artisan Stoneware', 8500, 16, 16, 32, 25, 11500, true, 'Matte textured ceramic vessel hand-thrown by artisan potters, ideal for dried florals or branches.'),
  p('sol-mirror', 'Sol Arched Floor Mirror', 'Decor', 'Modern Luxury', 'Brushed Brass', 'Brass & Annealed Glass', 38000, 60, 4, 170, 8, 46000, true, 'Full-length arched statement mirror with slender brushed brass frame and shatterproof mirror glass.'),
  p('kyoto-ceramic-urn', 'Kyoto Hand-Coiled Floor Urn', 'Decor', 'Japandi', 'Chalk White Stoneware', 'Artisan Stoneware Ceramic', 28000, 32, 32, 65, 8, 35000, true, 'Substantial floor-standing artisan ceramic urn featuring hand-coiled ribbed texture and matte porous white glaze.'),
  p('verona-marble-bowl', 'Verona Footed Travertine Bowl', 'Decor', 'Contemporary Luxury', 'Honed Roman Travertine', 'Solid Honed Travertine', 26000, 35, 35, 16, 12, 32000, true, 'Monolithic footed centerpiece bowl carved from a single block of natural Roman travertine with scalloped rim.'),
  p('solis-sculptural-object', 'Solis Infinite Loop Sculpture', 'Decor', 'Modern Organic', 'Muted Sand Stone', 'Hand-Carved Sandstone', 16500, 22, 14, 28, 15, 21000, false, 'Abstract interlocking loop sculpture hand-chiseled from natural volcanic sandstone, ideal for consoles or shelf vignettes.'),
  p('luna-round-brass-mirror', 'Luna Beveled Circular Mirror', 'Decor', 'Modern Classic', 'Warm Brushed Brass', 'Brass & Premium Annealed Glass', 34000, 80, 4, 80, 10, 42000, true, 'Large 80cm circular wall statement mirror featuring an ultra-slim spun brass frame and subtle 1-inch perimeter bevel.'),
  p('astrid-woven-wall-tapestry', 'Astrid Textured Wool Wall Hanging', 'Decor', 'Scandinavian Craft', 'Oatmeal & Raw Flax', 'Organic Wool & Belgian Flax', 26000, 75, 5, 110, 6, 33000, false, 'Hand-loomed textured textile art piece combining chunky wool bouclé loops, fringe detailing, and a solid ash mounting dowel.'),
  p('nordic-wood-relief-art', 'Nordic Geometric Oak Wall Relief', 'Decor', 'Minimalist Modern', 'Natural White Oak', 'FSC Solid White Oak & Canvas', 42000, 70, 6, 95, 5, 52000, false, 'Architectural framed 3D relief wall panel carved from dimensional solid oak slats mounted on raw natural linen canvas.'),
  p('haven-alpaca-throw', 'Haven Peruvian Baby Alpaca Throw', 'Decor', 'Luxury Textiles', 'Warm Heather Cream', '100% Baby Alpaca Wool', 28000, 140, 1, 180, 14, 35000, true, 'Ultra-soft, lightweight yet deeply warming Peruvian baby alpaca fringe throw blanket crafted by heritage weavers.'),
  p('boucle-cushion-set', 'Forma Pebble Boucle Cushions (Pair)', 'Decor', 'Modern Organic', 'Ivory White', 'Heavyweight Boucle & Down Blend', 15000, 45, 18, 45, 18, 19000, false, 'Set of two sculpted pebble-contoured accent pillows wrapped in high-pile tactile boucle with feather-down filling.'),
  p('marfa-linen-cushion-duo', 'Marfa Fringed Belgian Linen Cushions', 'Decor', 'Bohemian Minimalist', 'Muted Terracotta', 'Stone-Washed Belgian Linen', 13500, 50, 16, 50, 20, 17000, false, 'Pair of square stone-washed pure European flax linen throw pillows finished with raw frayed fringe border detailing.'),
  p('clara-brass-candleholders', 'Clara Architectural Taper Holders (Trio)', 'Decor', 'Contemporary Luxury', 'Solid Brushed Brass', 'Heavy Cast Brass', 17500, 10, 10, 28, 16, 22500, false, 'Set of three solid brass candle pedestals in staggered heights designed to hold standard taper candles with stability.'),
  p('soren-incense-burner', 'Soren Travertine Incense Burner', 'Decor', 'Japandi', 'Warm Alabaster', 'Travertine & Spun Brass', 9500, 18, 12, 6, 25, 12500, false, 'Heavy carved Roman travertine rectangular ash catcher dish featuring a removable brushed brass ball incense stick holder.'),
  p('kaito-ceramic-pedestal', 'Kaito Fluted Ceramic Compote', 'Decor', 'Modern Craft', 'Speckled Oatmeal', 'Artisan High-Fire Ceramic', 12500, 26, 26, 18, 15, 16000, false, 'Sculptural raised compote pedestal dish with fluted stem and organic undulating rim, perfect for display or botanical accents.'),
  p('zen-moroccan-wool-rug', 'Zen Hand-Knotted Wool Area Rug', 'Decor', 'Modern Berber', 'Ivory & Charcoal', '100% New Zealand Wool', 145000, 200, 3, 300, 3, 175000, true, 'Luxurious high-pile hand-knotted New Zealand wool rug featuring subtle organic charcoal lines and hand-braided tassels.'),
  p('porto-jute-runner', 'Porto Chunky Braided Jute Runner', 'Decor', 'Artisan Coastal', 'Natural Golden Jute', 'Hand-Braided Organic Jute', 24000, 80, 2, 240, 10, 30000, false, 'Heavyweight non-shedding natural jute runner rug hand-braided with subtle textured weave, ideal for hallways or kitchens.'),

  // ─── OUTDOOR FURNITURE COLLECTION (EXPANDED WITH DISTINCT IMAGES) ───────────────────
  p('haven-lounge', 'Haven Outdoor Lounge', 'Outdoor Furniture', 'Modern Resort', 'Teak & Charcoal', 'Weatherproof Teak', 115000, 150, 85, 72, 3, 135000, true, 'Grade-A teak outdoor lounge bench equipped with sun-proof, water-repellent quick-dry foam cushions.'),
  p('ibiza-modular-outdoor-sofa', 'Ibiza Modular Teak Sectional', 'Outdoor Furniture', 'Contemporary Resort', 'Weathered Teak & Sand', 'Grade-A Teak & Sunbrella Fabric', 285000, 260, 180, 75, 2, 335000, true, 'Modular 3-piece corner outdoor sectional crafted from solid plantation teak with high-resilience Sunbrella cushions.'),
  p('santorini-teak-accent-chair', 'Santorini Deep Teak Club Chair', 'Outdoor Furniture', 'Modern Organic', 'Natural Teak & Oatmeal', 'Solid Teak & Olefin Rope', 72000, 78, 82, 74, 6, 88000, false, 'Generously proportioned outdoor club armchair with marine-grade rope backing and thick waterproof cushions.'),
  p('amalfi-wicker-daybed', 'Amalfi Round Canopy Daybed', 'Outdoor Furniture', 'Luxury Resort', 'Honey Wicker & White', 'All-Weather Resin & Powdered Aluminum', 195000, 160, 160, 145, 3, 235000, true, 'Extravagant circular outdoor daybed featuring a retractable folding sun canopy, plush circular cushion, and 4 accent pillows.'),
  p('tulum-teak-chaise-lounger', 'Tulum Teak Poolside Lounger (Pair)', 'Outdoor Furniture', 'Modern Resort', 'Natural Teak & Sand', 'Grade-A Plantation Teak', 145000, 68, 200, 35, 4, 175000, false, 'Pair of architectural solid teak reclining sun loungers with concealed wheels and 5-position backrests.'),
  p('cannes-outdoor-dining-table', 'Cannes 8-Seater Teak Dining Table', 'Outdoor Furniture', 'French Modern', 'Natural Teak', 'FSC Solid Teak Wood', 175000, 220, 100, 76, 3, 210000, true, 'Large outdoor entertaining dining table with slatted plantation teak tabletop and umbrella hole plug.'),
  p('palma-outdoor-dining-chairs', 'Palma Woven Dining Chairs (Set of 4)', 'Outdoor Furniture', 'Coastal Contemporary', 'Charcoal & Grey Rope', 'Marine Olefin & Aluminum', 110000, 58, 60, 82, 5, 132000, false, 'Set of four stackable outdoor dining chairs handwoven with weather-resistant rope over rustproof aluminum frames.'),
  p('capri-concrete-outdoor-table', 'Capri Round Concrete Dining Table', 'Outdoor Furniture', 'Modern Industrial', 'Light Slate Grey', 'Reinforced Fiber Concrete', 135000, 120, 120, 75, 4, 162000, false, 'Substantial circular outdoor dining table with pedestal cylinder base made from weather-sealed fiberstone concrete.'),
  p('sol-outdoor-bar-cart', 'Sol Mobile Teak Patio Bar Cart', 'Outdoor Furniture', 'Modern Luxury', 'Teak & Matte Black', 'Solid Teak & Powdered Steel', 58000, 85, 45, 84, 8, 70000, false, 'Two-tier outdoor entertaining drink cart with bottle holders, removable teak serving tray, and large rubber-tread wheels.'),
  p('zenith-concrete-fire-pit', 'Zenith Round Concrete Gas Fire Bowl', 'Outdoor Furniture', 'Contemporary Resort', 'Honed Stone Grey', 'Glass-Fiber Reinforced Concrete', 125000, 90, 90, 38, 5, 155000, true, 'Round outdoor stone and concrete fire pit table featuring lava rock bed and surrounding patio seating for outdoor entertaining.'),
  p('sorrento-teak-adirondack', 'Sorrento Minimalist Adirondack Chair', 'Outdoor Furniture', 'Modern Coastal', 'Natural Oiled Teak', 'Grade-A Plantation Teak', 68000, 75, 92, 88, 7, 82000, false, 'Pair of classic solid teak Adirondack lounge chairs featuring ergonomic deep contoured seating and wide drink rests.'),
  p('porto-sun-umbrella', 'Porto 10ft Cantilever Patio Umbrella', 'Outdoor Furniture', 'Modern Resort', 'Charcoal & Anodized Bronze', 'Sunbrella Fabric & Heavy Aluminum', 88000, 300, 300, 260, 6, 108000, false, 'Heavy-duty 10-foot offset cantilever sun umbrella featuring 360-degree pedal rotation and trigger tilt handle.'),
  p('marseille-double-sunbed', 'Marseille Grand Double Sunbed', 'Outdoor Furniture', 'Modern Resort', 'Teak & Pure White', 'Solid Teak & QuickDry Foam', 210000, 150, 205, 40, 2, 255000, false, 'Expansive double-wide outdoor poolside daybed with independent dual-side ratcheting backrests and water-repellent mattress.'),
  p('verona-outdoor-coffee-table', 'Verona Live-Edge Outdoor Coffee Table', 'Outdoor Furniture', 'Contemporary Organic', 'Natural Solid Teak & Iron', 'Solid Teak Slab & Powdered Iron', 68000, 85, 85, 40, 6, 82000, false, 'Sculptural organic live-edge wooden outdoor coffee table with slender iron cage base, ideal for seaside or garden terraces.'),
  p('costa-outdoor-storage-trunk', 'Costa Teak Garden Storage Bench', 'Outdoor Furniture', 'Modern Craft', 'Natural Weathered Teak', 'Solid Teak & Weather-Sealed Joinery', 92000, 130, 60, 65, 5, 112000, false, 'Artisan-crafted weathered teak garden bench featuring curved arched slatted backrest and spacious outdoor comfort.'),
  p('toscana-terracotta-planters', 'Toscana Terracotta Garden Urns (Pair)', 'Outdoor Furniture', 'Artisan Mediterranean', 'Weathered Terracotta', 'Hand-Thrown Terracotta Clay', 34000, 45, 45, 60, 9, 42000, false, 'Pair of grand artisan hand-thrown clay planters with roll rims and pre-drilled drainage holes for outdoor trees and palms.')
]
