import Link from 'next/link'
import { MapPin, ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'About Us | Mtsinso Motors',
  description: 'Learn about Mtsinso Motors — your trusted destination for quality vehicles.',
}

export default function AboutPage() {
  return (
    <div className="pt-16 min-h-screen bg-white">

      {/* Hero */}
      <section className="bg-gray-50 py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="section-tag">
            <span className="w-5 h-px bg-primary inline-block" />
            Who We Are
          </div>
          <h1 className="font-display text-5xl md:text-7xl text-support leading-[1.05] mb-6 max-w-3xl">
            Driving Trust.<br />
            <span className="text-primary">Since Day One.</span>
          </h1>
          <div className="w-16 h-1 bg-primary rounded-full mb-6" />
          <p className="text-muted text-lg max-w-xl leading-relaxed">
            Your trusted destination for quality vehicles — where every transaction is built on transparency, expertise, and genuine care.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Text */}
            <div>
              <div className="section-tag">
                <span className="w-5 h-px bg-primary inline-block" />
                Our Story
              </div>
              <h2 className="font-display text-4xl text-support mb-6 leading-tight">
                Welcome to Mtsinso Motors
              </h2>
              <div className="space-y-5 text-muted leading-relaxed text-sm">
                <p>
                  Welcome to Mtsinso Motors, your premier destination for quality pre-owned vehicles. As a trusted partner in the automotive industry, we pride ourselves on offering an unparalleled car-buying experience that exceeds your expectations.
                </p>
                <p>
                  Our extensive range of carefully selected vehicles caters to diverse tastes, budgets, and lifestyles. From practical family sedans to capable SUVs and bakkies, our inventory is meticulously maintained to ensure every vehicle meets our exceptional standards.
                </p>
                <p>
                  At Mtsinso, our customers are at the heart of everything we do. Our team of knowledgeable, friendly professionals is committed to providing personalised service, expert advice, and transparent transactions every step of the way.
                </p>
              </div>

              <div className="mt-8 flex items-start gap-3 bg-gray-50 rounded-2xl p-5">
                <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-support text-sm uppercase tracking-wide mb-0.5">Visit Us</p>
                  <p className="text-muted text-sm">505 Rachel de Beer Street, Pretoria North</p>
                </div>
              </div>
            </div>

            {/* Decorative card */}
            <div className="relative h-[380px] hidden lg:flex items-center justify-center">
              <div className="absolute inset-0 bg-primary/5 rounded-3xl" />
              <div className="relative bg-white rounded-3xl border border-gray-100 shadow-xl p-12 text-center max-w-sm">
                <div className="w-16 h-1 bg-primary rounded-full mx-auto mb-6" />
                <p className="font-display text-3xl text-support leading-snug">
                  Your Journey.<br />
                  <span className="text-primary">Our Priority.</span>
                </p>
                <div className="w-16 h-1 bg-primary rounded-full mx-auto mt-6" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-24 bg-support">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <div className="section-tag-white justify-center">
              <span className="w-5 h-px bg-white/40 inline-block" />
              What Sets Us Apart
            </div>
            <h2 className="font-display text-4xl md:text-5xl text-white">
              Built on Three Principles
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                number: '01',
                title: 'Curated Quality',
                body: 'Every vehicle in our inventory is hand-selected and rigorously inspected. We carry only cars we would be proud to put our name on.',
              },
              {
                number: '02',
                title: 'Transparent Dealings',
                body: 'No hidden fees, no pressure. We believe the right car sells itself — our role is to give you the honest information you need to decide.',
              },
              {
                number: '03',
                title: 'Personal Service',
                body: 'Our team takes time to understand your needs, budget, and lifestyle, then matches you with the vehicle that genuinely fits.',
              },
            ].map(({ number, title, body }) => (
              <div key={number} className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
                <p className="font-display text-5xl text-primary/30 font-bold leading-none mb-5">{number}</p>
                <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
                <div className="h-0.5 w-8 bg-primary rounded-full mb-4" />
                <p className="text-white/50 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-gray-50 rounded-3xl p-12 md:p-16 text-center">
            <div className="section-tag justify-center">
              <span className="w-5 h-px bg-primary inline-block" />
              Pretoria North
            </div>
            <h2 className="font-display text-4xl md:text-5xl text-support mb-4">
              Come See Us in Person
            </h2>
            <p className="text-muted text-lg mb-2 max-w-lg mx-auto">
              505 Rachel de Beer Street, Pretoria North
            </p>
            <p className="text-muted/60 text-sm mb-10">Our doors are open — no appointment necessary.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/vehicles" className="btn-primary">Browse Our Stock</Link>
              <Link href="/contact" className="btn-outline">Get in Touch</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
