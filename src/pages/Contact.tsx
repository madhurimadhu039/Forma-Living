import { useState, FormEvent } from 'react'

export default function Contact() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', subject: 'Design Advice', message: '' })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
      <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
        <p className="text-xs font-bold tracking-[0.25em] text-[#BD6024] uppercase">We’re Here to Help</p>
        <h1 className="mt-3 font-sans font-extrabold text-4xl sm:text-5xl text-[#2B231D] tracking-tight">
          Get in Touch
        </h1>
        <p className="mt-4 text-base text-[#6E6359] leading-relaxed">
          Have questions about a piece, custom dimensions, or order tracking? Our design concierge team is ready to assist you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Left: Contact Info & Showrooms */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EFE8DC] shadow-2xs">
            <h2 className="font-bold text-lg text-[#2B231D] mb-4">Direct Communication</h2>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#FCEEE2] text-[#BD6024] flex items-center justify-center shrink-0">
                  ✉️
                </div>
                <div>
                  <p className="text-xs text-[#82756A]">Email Support</p>
                  <p className="font-semibold text-[#2B231D] mt-0.5">hello@formaliving.com</p>
                  <p className="text-xs text-[#82756A] mt-0.5">Response within 24 business hours</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#FCEEE2] text-[#BD6024] flex items-center justify-center shrink-0">
                  📞
                </div>
                <div>
                  <p className="text-xs text-[#82756A]">Phone Consultation</p>
                  <p className="font-semibold text-[#2B231D] mt-0.5">+1 (800) 482-3676</p>
                  <p className="text-xs text-[#82756A] mt-0.5">Mon–Fri: 9:00 AM – 6:00 PM EST</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#FCEEE2] text-[#BD6024] flex items-center justify-center shrink-0">
                  📍
                </div>
                <div>
                  <p className="text-xs text-[#82756A]">Flagship Design Studio</p>
                  <p className="font-semibold text-[#2B231D] mt-0.5">428 Forma Avenue, Suite 100</p>
                  <p className="text-xs text-[#82756A] mt-0.5">Design District, NY 10012</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#FAF7F2] rounded-3xl p-6 border border-[#EFE8DC] shadow-2xs">
            <h3 className="font-bold text-sm text-[#2B231D] mb-2">Trade &amp; Interior Designers</h3>
            <p className="text-xs text-[#6E6359] leading-relaxed">
              We offer exclusive trade discounts, swatch sampling, and bespoke dimension tailoring for licensed architects and interior decorators. Contact <span className="font-semibold text-[#BD6024]">trade@formaliving.com</span>.
            </p>
          </div>
        </div>

        {/* Right: Message Form */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#EFE8DC] shadow-sm">
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-[#FCEEE2] text-[#BD6024] flex items-center justify-center text-2xl mx-auto mb-4">
                  ✓
                </div>
                <h3 className="text-2xl font-bold text-[#2B231D]">Message Sent Successfully</h3>
                <p className="mt-2 text-sm text-[#6E6359] max-w-sm mx-auto">
                  Thank you for reaching out, {form.name || 'there'}! A Forma design specialist will get back to you shortly at {form.email}.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false)
                    setForm({ name: '', email: '', subject: 'Design Advice', message: '' })
                  }}
                  className="mt-6 px-6 py-2.5 rounded-xl bg-[#2B231D] text-white text-xs font-semibold hover:bg-[#3F332B] transition"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="font-bold text-xl text-[#2B231D] pb-2 border-b border-[#EFE8DC]">
                  Send a Direct Inquiry
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#6E6359] mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-[#FAF7F2] border border-[#EFE8DC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#BD6024]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#6E6359] mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="jane@example.com"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      className="w-full bg-[#FAF7F2] border border-[#EFE8DC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#BD6024]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#6E6359] mb-1">Inquiry Purpose</label>
                  <select
                    value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#EFE8DC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#BD6024] text-[#2B231D]"
                  >
                    <option value="Design Advice">Interior Styling &amp; Advice</option>
                    <option value="Order Status">Order Status &amp; Shipping</option>
                    <option value="Custom Dimensions">Custom Dimensions or Finishes</option>
                    <option value="Trade Partnership">Trade &amp; Commercial Projects</option>
                    <option value="Returns & Warranty">Returns &amp; Warranty Questions</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#6E6359] mb-1">Your Message</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell us about your space or questions regarding a specific piece..."
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#EFE8DC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#BD6024] resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-[#BD6024] hover:bg-[#a5511c] text-white font-semibold text-base shadow-sm hover:shadow transition"
                >
                  Send Message →
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

