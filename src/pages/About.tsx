import { Link } from 'react-router-dom'

export default function About() {
  return (
    <div className="space-y-16 sm:space-y-20 pb-16">
      {/* Hero Section */}
      <section className="pt-8 sm:pt-14 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-xs font-bold tracking-[0.25em] text-[#BD6024] uppercase">Our Story</p>
          <h1 className="mt-3 font-sans font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[#2B231D] tracking-tight leading-tight">
            Crafting Spaces That Inspire <br className="hidden sm:inline" />
            <span className="text-[#BD6024]">&amp; Endure.</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-[#6E6359] max-w-2xl mx-auto leading-relaxed">
            Forma Living was founded on a simple principle: furniture should be an extension of your life’s best moments — thoughtfully designed, sustainably crafted, and built to last generations.
          </p>
        </div>
      </section>

      {/* Visual Banner */}
      <section className="px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="relative rounded-3xl overflow-hidden h-72 sm:h-96 shadow-md border border-[#EFE8DC]">
            <img
              src="/images/hero-living-room.jpg"
              alt="Forma Living modern interior showcase"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6 sm:p-10">
              <p className="text-white font-sans text-xl sm:text-2xl font-bold max-w-md">
                “Shape your space, shape your life.”
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2B231D] tracking-tight">
              The Forma Standard
            </h2>
            <p className="mt-2 text-sm text-[#82756A]">Four pillars guiding every piece we design and produce.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-[#EFE8DC] shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-[#FCEEE2] text-[#BD6024] flex items-center justify-center text-xl mb-4 font-bold">
                🌱
              </div>
              <h3 className="font-bold text-[#2B231D] text-base">Sustainably Sourced</h3>
              <p className="mt-2 text-xs sm:text-sm text-[#6E6359] leading-relaxed">
                FSC-certified solid oak, walnut, and eco-friendly boucles harvested with environmental stewardship.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-[#EFE8DC] shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-[#FCEEE2] text-[#BD6024] flex items-center justify-center text-xl mb-4 font-bold">
                ✨
              </div>
              <h3 className="font-bold text-[#2B231D] text-base">Artisan Precision</h3>
              <p className="mt-2 text-xs sm:text-sm text-[#6E6359] leading-relaxed">
                Master woodworkers and upholsterers shaping timeless joinery and seamless silhouettes.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-[#EFE8DC] shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-[#FCEEE2] text-[#BD6024] flex items-center justify-center text-xl mb-4 font-bold">
                ⚖️
              </div>
              <h3 className="font-bold text-[#2B231D] text-base">Honest Pricing</h3>
              <p className="mt-2 text-xs sm:text-sm text-[#6E6359] leading-relaxed">
                Direct-from-studio distribution eliminates traditional showroom markups without sacrificing quality.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-[#EFE8DC] shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-[#FCEEE2] text-[#BD6024] flex items-center justify-center text-xl mb-4 font-bold">
                🛡️
              </div>
              <h3 className="font-bold text-[#2B231D] text-base">Built to Last</h3>
              <p className="mt-2 text-xs sm:text-sm text-[#6E6359] leading-relaxed">
                Structural warranties and durable stain-resistant textiles designed for real everyday living.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="px-4 sm:px-6">
        <div className="mx-auto max-w-4xl rounded-3xl bg-[#344030] p-8 sm:p-12 text-center text-white shadow-md">
          <h2 className="text-2xl sm:text-3xl font-bold font-sans">Ready to transform your home?</h2>
          <p className="mt-3 text-sm sm:text-base text-[#CAD5C6] max-w-md mx-auto">
            Explore our curated catalog of chairs, sofas, tables, and lighting.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link
              to="/shop"
              className="px-8 py-3.5 bg-[#BD6024] hover:bg-[#a5511c] text-white rounded-2xl font-semibold text-sm transition shadow-sm"
            >
              Shop Collections →
            </Link>
            <Link
              to="/contact"
              className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-semibold text-sm transition border border-white/20"
            >
              Contact Our Designers
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

