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
  p('wooden-table', 'Wooden Dining Table', 'Dining Room', 'Minimalist', 'Natural Oak', 'Solid Oak', 299, 160, 85, 76, 6, 359, true, 'Hand-finished solid European oak dining table featuring smooth rounded perimeter edges, natural oiled grain, and sturdy tapered timber legs.'),
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

  // ─── LIGHTING COLLECTION (EXPANDED WITH DISTINCT IMAGES) ─────────────────────────
  p('stylish-lamp', 'Stylish Dome Lamp', 'Lighting', 'Modern', 'Mustard & Ceramic', 'Ceramic & Brass', 89, 28, 28, 42, 15, 119, true, 'Architectural mushroom dome table lamp with a warm mustard glazed dome and speckled ceramic pedestal base.'),
  p('rae-pendant', 'Rae Pendant Light', 'Lighting', 'Contemporary', 'Brushed Brass', 'Spun Brass & Glass', 119, 35, 35, 40, 20, 149, false, 'Modern sculptural pendant with hand-brushed brass finish and diffused warm illumination.'),
  p('solis-glass-pendant', 'Solis Fluted Glass Pendant', 'Lighting', 'Contemporary', 'Amber & Brass', 'Ribbed Glass & Brass', 139, 30, 30, 36, 18, 169, false, 'Hand-blown fluted amber glass globe pendant light casting warm radiating ripples of ambient light.'),
  p('aura-brass-chandelier', 'Aura Branching Brass Chandelier', 'Lighting', 'Modern Luxury', 'Brushed Brass & Opal', 'Spun Brass & Opal Glass', 389, 95, 75, 60, 5, 459, true, 'Sculptural branching chandelier with 6 hand-finished brass arms and frosted dual-layer glass globes.'),
  p('nordic-paper-pendant', 'Nordic Folded Paper Pendant', 'Lighting', 'Scandinavian', 'Warm White Washi', 'Artisan Paper & Ash', 109, 45, 45, 48, 12, 139, false, 'Organic geometric folded washi paper shade with natural ash wood cap for soft glare-free illumination.'),
  p('kyoto-bamboo-lantern', 'Kyoto Woven Bamboo Lantern', 'Lighting', 'Japandi', 'Natural Bamboo', 'Handwoven Bamboo & Linen', 129, 38, 38, 52, 14, 159, false, 'Traditional artisan handwoven bamboo lattice pendant lantern with interior cream linen light diffuser.'),
  p('arc-brass-floor-lamp', 'Arc Modern Brass Floor Lamp', 'Lighting', 'Modern Classic', 'Warm Brass & Marble', 'Solid Brass & Carrara Marble', 299, 110, 40, 195, 6, 369, true, 'Dramatic cantilevered arched floor lamp anchored by a heavy white marble base and dome brass shade.'),
  p('astrid-tripod-lamp', 'Astrid Solid Ash Tripod Lamp', 'Lighting', 'Scandinavian', 'Natural Ash & Linen', 'Solid Ash & Belgian Linen', 219, 55, 55, 150, 8, 269, false, 'Mid-century tripod standing floor lamp crafted with tapered solid ash legs and oversized linen drum shade.'),
  p('monolith-fluted-floor-lamp', 'Monolith Ceramic Fluted Floor Lamp', 'Lighting', 'Modern Organic', 'Cream Ceramic', 'Textured Ceramic & Linen', 269, 35, 35, 140, 7, 329, false, 'Architectural fluted ceramic totem floor lamp that doubles as a minimalist illuminated interior sculpture.'),
  p('luna-globe-floor-lamp', 'Luna Dual Globe Floor Lamp', 'Lighting', 'Contemporary Luxury', 'Brushed Brass & White', 'Brushed Brass & Opal Glass', 249, 32, 32, 165, 9, 299, false, 'Slender vertical floor lamp featuring two offset milky glass spheres emitting warm dimmable 360-degree light.'),
  p('verona-travertine-lamp', 'Verona Travertine Cube Lamp', 'Lighting', 'Contemporary Luxury', 'Honed Travertine & Linen', 'Roman Travertine & Pleated Linen', 159, 22, 22, 38, 12, 199, false, 'Heavy carved Roman travertine stone block table lamp crowned with an ivory accordion-pleated shade.'),
  p('clara-mushroom-lamp', 'Clara Cordless Brass Lamp', 'Lighting', 'Modern Minimalist', 'Satin Brass', 'Spun Aluminum & Brass', 99, 20, 20, 30, 20, 129, false, 'Rechargeable cordless portable mushroom accent lamp with 3-stage touch dimmer and 14-hour battery life.'),
  p('kaito-architect-lamp', 'Kaito Studio Task Lamp', 'Lighting', 'Industrial Modern', 'Matte Black & Walnut', 'Steel & American Walnut', 119, 45, 18, 55, 15, 149, false, 'Precision engineered articulating desk lamp with counterbalanced walnut arm and directed task light beam.'),
  p('soren-ceramic-table-lamp', 'Soren Terracotta Accent Lamp', 'Lighting', 'Japandi Modern', 'Terracotta & Raffia', 'Stoneware & Natural Raffia', 139, 28, 28, 44, 11, 169, false, 'Organic textured terracotta vase lamp with handcrafted natural woven raffia shade for rich evening ambiance.'),
  p('haven-brass-sconce', 'Haven Articulating Wall Sconce', 'Lighting', 'Modern Luxury', 'Brushed Brass', 'Solid Brass & Steel', 129, 18, 38, 28, 16, 159, false, 'Hardwired swing-arm bedside and reading wall sconce with rotatable brass cone shade and integrated switch.'),
  p('zen-linen-sconce', 'Zen Pleated Wall Sconce', 'Lighting', 'Japandi', 'Warm Sand Linen', 'Linen Fabric & Oiled Oak', 109, 24, 15, 32, 18, 139, false, 'Soft ambient wall sconce crafted from folded Belgian linen over an oiled oak backplate for gentle glow.'),

  // ─── BALCONY COLLECTION (EXPANDED WITH DISTINCT IMAGES) ───────────────────────────
  p('vale-chair', 'Vale Balcony Chair', 'Balcony', 'Bohemian', 'Natural Tan', 'Handwoven Rattan', 189, 62, 65, 84, 9, 219, true, 'Breathable handwoven natural rattan chair with weather-resistant clear protective coat.'),
  p('rio-terrazzo-bistro-table', 'Rio Terrazzo Bistro Table', 'Balcony', 'Modern Resort', 'Forest Green & Terrazzo', 'Terrazzo & Powder-Coated Steel', 199, 70, 70, 75, 8, 249, true, 'Compact circular balcony table with heavy polished white terrazzo top and UV-resistant sage steel base.'),
  p('cannes-folding-bistro-set', 'Cannes 3-Piece Folding Bistro Set', 'Balcony', 'French Provincial', 'Warm Honey Acacia', 'FSC Solid Acacia Wood', 249, 65, 65, 74, 10, 299, true, 'Space-saving outdoor dining set including one foldable square bistro table and two matching folding slatted chairs.'),
  p('sorrento-mosaic-bistro-table', 'Sorrento Mosaic Balcony Table', 'Balcony', 'Mediterranean', 'Terracotta & Iron', 'Hand-Laid Ceramic & Cast Iron', 179, 60, 60, 72, 7, 219, false, 'Artisanal outdoor cafe table featuring hand-cut ceramic mosaic tile in warm earth tones atop an anti-rust cast iron pedestal.'),
  p('tulum-acapulco-chair', 'Tulum Woven Acapulco Chair', 'Balcony', 'Bohemian Modern', 'Olive Green', 'Weatherproof Cord & Steel', 149, 72, 80, 85, 12, 179, false, 'Ergonomic retro-modern string weave balcony lounge chair crafted with flexible UV-resistant vinyl cord on powder-coated steel.'),
  p('palma-rattan-rocker', 'Palma All-Weather Rattan Rocker', 'Balcony', 'Coastal Minimalist', 'Natural Sand', 'Synthetic Resin Wicker & Teak', 269, 68, 88, 82, 6, 329, false, 'Relaxing balcony rocking chair hand-woven with weather-resistant all-weather wicker over a smooth solid teak rocking base.'),
  p('bali-hanging-egg-chair', 'Bali Hanging Rattan Swing Chair', 'Balcony', 'Bohemian Luxury', 'Natural Tan & Cream', 'Synthetic Rattan & Steel', 389, 95, 95, 195, 4, 469, true, 'Suspended outdoor cocoon egg swing chair with heavy-duty stand, safety spring chain, and plush water-repellent pillow.'),
  p('capri-compact-lounger', 'Capri Folding Teak Sun Lounger', 'Balcony', 'Modern Resort', 'Natural Teak & Sand', 'Grade-A Teak & Batyline Mesh', 299, 65, 160, 80, 5, 369, false, 'Slimline folding balcony chaise lounger with 4 adjustable reclining angles and breathable quick-drying sling fabric.'),
  p('santorini-rope-armchair', 'Santorini Braided Rope Armchair', 'Balcony', 'Contemporary Outdoor', 'Charcoal & Grey', 'Olefin Rope & Aluminum', 199, 60, 62, 78, 9, 239, false, 'Sleek architectural balcony dining armchair featuring hand-braided marine olefin rope backrest and quick-dry cushion.'),
  p('ibiza-slat-teak-bench', 'Ibiza Slatted Teak Balcony Bench', 'Balcony', 'Scandinavian Outdoor', 'Natural Teak', 'FSC Certified Solid Teak', 279, 115, 48, 82, 6, 339, false, 'Compact 2-seater slatted outdoor bench crafted from natural oil-rich teak that patinas beautifully to silver-grey.'),
  p('marseille-compact-daybed', 'Marseille Compact Balcony Loveseat', 'Balcony', 'Modern Luxury', 'Warm Oatmeal', 'All-Weather Wicker & Olefin', 449, 135, 75, 76, 3, 539, false, 'Cozy 2-seater outdoor balcony loveseat sofa with deep high-density water-resistant cushions and powder-coated frame.'),
  p('sol-tiered-plant-stand', 'Sol 3-Tier Corner Plant Stand', 'Balcony', 'Japandi Outdoor', 'Matte Black & Teak', 'Powdered Steel & Solid Teak', 119, 45, 45, 95, 15, 149, false, 'Vertical three-tier quarter-round corner plant display designed to maximize leafy greenery on compact apartment balconies.'),
  p('porto-fluted-planter-set', 'Porto Fluted Fiberstone Planters (Trio)', 'Balcony', 'Modern Organic', 'Muted Chalk White', 'Lightweight Fiberstone Composite', 139, 36, 36, 48, 11, 169, false, 'Set of three nesting fluted outdoor balcony planters equipped with internal drainage holes and frost-resistant finish.'),
  p('zen-vertical-herb-wall', 'Zen Cedar Vertical Balcony Planter', 'Balcony', 'Urban Garden', 'Natural Cedar', 'Western Red Cedar Wood', 129, 60, 18, 110, 8, 159, false, 'Wall-hanging four-box vertical herb and floral planter crafted with rot-resistant cedar wood and removable planter liners.'),
  p('amalfi-solar-floor-lantern', 'Amalfi Teak & Solar Floor Lantern', 'Balcony', 'Modern Resort', 'Natural Teak & Glass', 'Plantation Teak & Frosted Glass', 99, 22, 22, 45, 16, 129, false, 'Cordless outdoor solar lantern with dusk-to-dawn sensor, warm amber LED candlelight mode, and solid teak handle.'),
  p('toscana-ceramic-side-table', 'Toscana Glazed Outdoor Garden Stool', 'Balcony', 'Artisan Mediterranean', 'Sage Green Glaze', 'High-Fired Stoneware Ceramic', 119, 34, 34, 45, 14, 149, false, 'Multi-functional glazed ceramic balcony drum table suitable as an outdoor drinks perch, plant pedestal, or extra stool.'),

  // ─── HOME OFFICE COLLECTION (EXPANDED WITH DISTINCT IMAGES) ───────────────────────
  p('kaito-desk', 'Kaito Work Desk', 'Home Office', 'Japandi', 'Warm Walnut', 'Walnut & Steel', 279, 140, 65, 75, 7, 329, true, 'Refined workspace desk with cord management groove, slim drawer, and solid wood legs.'),
  p('nordic-standing-desk', 'Nordic Motorized Standing Desk', 'Home Office', 'Scandinavian Modern', 'Natural White Oak', 'FSC Solid Oak & Dual Motors', 599, 150, 75, 120, 6, 699, true, 'Height-adjustable standing desk featuring dual whisper-quiet electric motors, programmable 4-height memory, and cable tray.'),
  p('kyoto-minimalist-desk', 'Kyoto Japandi Writing Desk', 'Home Office', 'Japandi', 'Natural Ash Wood', 'Solid Ash & Cast Brass', 349, 130, 60, 75, 8, 419, true, 'Minimalist solid ash study desk featuring twin soft-glide stationery drawers, beveled edges, and delicate brass hardware.'),
  p('verona-executive-desk', 'Verona Executive Walnut Desk', 'Home Office', 'Modern Executive', 'American Walnut & Saddle', 'Solid Walnut & Italian Leather', 699, 170, 80, 76, 4, 849, false, 'Stately executive office desk detailed with an integrated top-grain leather blotter, concealed power docks, and locking drawers.'),
  p('oslo-corner-desk', 'Oslo Modern L-Shaped Corner Desk', 'Home Office', 'Scandinavian', 'Bleached Oak & White', 'White Oak & Steel Frame', 479, 160, 120, 75, 5, 579, false, 'Spacious modular corner workstation optimizing corner floor area with wide dual-monitor returns and cord management troughs.'),
  p('ergon-mesh-chair', 'Ergon Pro Breathable Task Chair', 'Home Office', 'Ergonomic High-Tech', 'Matte Charcoal & Silver', 'Aerated Mesh & Polished Aluminum', 329, 68, 68, 108, 12, 399, true, 'Fully adjustable ergonomic work chair equipped with dynamic 4D armrests, self-adjusting lumbar support, and breathable elastomeric mesh.'),
  p('clara-leather-office-chair', 'Clara Executive Swivel Chair', 'Home Office', 'Mid-Century Modern', 'Caramel Top-Grain Leather', 'Top-Grain Leather & Matte Bronze', 389, 65, 65, 96, 7, 469, false, 'Luxurious high-back executive desk chair upholstered in supple aniline leather with smooth pneumatic height lift and tilt lock.'),
  p('soren-upholstered-desk-chair', 'Soren Swivel Task Armchair', 'Home Office', 'Modern Organic', 'Warm Boucle & Oak', 'Tactile Boucle & Oiled Oak', 249, 62, 60, 88, 9, 299, false, 'Comfort-first home study chair wrapped in tactile cream boucle with padded arm contours, silent castors, and 360-degree swivel.'),
  p('sol-drafting-stool', 'Sol Adjustable Drafting Stool', 'Home Office', 'Industrial Modern', 'Saddle Tan & Iron', 'Top-Grain Leather & Steel', 179, 46, 46, 78, 10, 219, false, 'Architectural height-adjustable drafting stool featuring a contoured saddle seat and circular footrest ring for standing desks.'),
  p('arura-office-bookcase', 'Arura Architectural Bookshelf', 'Home Office', 'Minimalist', 'White Oak & Charcoal', 'Solid Oak & Powdered Steel', 369, 110, 36, 185, 5, 449, false, 'Five-tier open display bookcase designed for binders, reference books, sculptural accents, and ambient storage baskets.'),
  p('koben-mobile-file-cabinet', 'Koben 3-Drawer Under-Desk Pedestal', 'Home Office', 'Japandi', 'Natural White Oak', 'Solid White Oak & Alloy', 229, 42, 50, 62, 8, 279, false, 'Mobile under-desk storage cabinet featuring full-extension drawer glides, key-lockable document drawer, and hidden casters.'),
  p('zen-office-credenza', 'Zen Lowline Office Sideboard', 'Home Office', 'Scandinavian', 'Warm Bleached Ash', 'Solid Ash & Tambour Slats', 459, 160, 45, 75, 4, 549, false, 'Streamlined office credenza with acoustic tambour sliding doors, internal cable pass-throughs, and adjustable storage partitions.'),
  p('tala-leather-desk-mat', 'Tala Full-Grain Leather Desk Mat', 'Home Office', 'Artisan Craft', 'Cognac Tan Leather', 'Full-Grain Tuscan Leather', 79, 85, 45, 1, 25, 99, false, 'Smooth vegetable-tanned leather desk blotter pad with non-slip suede underside, magnetic cable clip, and edge stitching.'),
  p('haven-monitor-riser', 'Haven Dual Monitor Riser Stand', 'Home Office', 'Modern Minimalist', 'American Walnut & Aluminum', 'Solid Walnut & Anodized Aluminum', 99, 105, 24, 11, 20, 129, false, 'Solid timber desktop shelf providing ergonomic eye-level screen elevation with stowing clearance for keyboards and docks underneath.'),
  p('monolith-desk-organizer', 'Monolith Travertine Desk Set', 'Home Office', 'Contemporary Luxury', 'Warm Roman Travertine', 'Honed Roman Travertine Stone', 69, 28, 14, 5, 22, 89, false, 'Set of two sculpted Roman travertine stationery trays designed to organize fountain pens, stylus, and desktop essentials.'),
  p('lumiere-linear-task-lamp', 'Lumiere Minimalist LED Desk Bar', 'Home Office', 'Contemporary', 'Brushed Brass & Acrylic', 'Solid Brass & Glare-Free LED', 139, 65, 15, 42, 14, 169, false, 'Ultra-slim architectural horizontal LED desk bar lamp providing wide, even, shadow-free illumination across documents.'),

  // ─── OTHER ROOM CATEGORIES ───────────────────────────────────────────────────────────
  p('arc-shelf', 'Arc Bookshelf', 'Storage', 'Industrial Modern', 'Matte Black', 'Powdered Steel & Oak', 229, 85, 35, 175, 6, 269, false, 'Geometric open-frame shelving unit designed to display ceramics, books, and green botanicals.'),
  p('tala-vase', 'Tala Ceramic Vase', 'Decor', 'Minimalist', 'Muted Sand', 'Artisan Stoneware', 49, 16, 16, 32, 25, 65, false, 'Matte textured ceramic vessel hand-thrown by artisan potters, ideal for dried florals or branches.'),
  p('haven-lounge', 'Haven Outdoor Lounge', 'Outdoor Furniture', 'Modern Resort', 'Teak & Charcoal', 'Weatherproof Teak', 459, 150, 85, 72, 3, 529, false, 'Grade-A teak outdoor lounge bench equipped with sun-proof, water-repellent quick-dry foam cushions.'),
  p('zen-credenza', 'Zen Fluted Credenza', 'Storage', 'Japandi', 'Natural White Oak', 'Oak & Ribbed Glass', 489, 160, 45, 82, 4, 569, false, 'Four-door low credenza featuring tambour fluted sliding doors and soft interior adjustable shelving.'),
  p('sol-mirror', 'Sol Arched Floor Mirror', 'Decor', 'Modern Luxury', 'Brushed Brass', 'Brass & Annealed Glass', 159, 60, 4, 170, 8, 189, false, 'Full-length arched statement mirror with slender brushed brass frame and shatterproof mirror glass.')
]
