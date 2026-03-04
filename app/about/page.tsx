import Link from 'next/link'
import { MapPin, ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'About Us | IC Cars Pretoria North',
  description: 'Learn about IC Cars — your premier destination for quality pre-owned vehicles in Pretoria North.',
}

export default function AboutPage() {
  return (
    <div className="pt-20 min-h-screen bg-white overflow-hidden">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative bg-black min-h-[480px] flex items-center">

        {/* Diagonal gold accent bar */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
        >
          {/* Right-side large diagonal slash */}
          <div
            className="absolute right-0 top-0 h-full w-1/2 bg-[#b8953a]/8"
            style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)' }}
          />
          {/* Thin gold rule — vertical left accent */}
          <div className="absolute left-0 top-0 h-full w-[3px] bg-gold" />
          {/* Geometric grid lines — subtle */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#b8953a" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <p className="text-gold text-xs uppercase tracking-[0.3em] font-semibold mb-4">
            Who We Are
          </p>
          <h1 className="text-5xl md:text-7xl font-display text-white leading-[1.05] mb-6 max-w-3xl">
            Driving Trust.<br />
            <span className="text-gold">Since Day One.</span>
          </h1>
          <div className="h-[2px] w-24 bg-gold mb-6" />
          <p className="text-gray-400 text-lg max-w-xl leading-relaxed">
            Pretoria North's premier destination for quality pre-owned vehicles — where every transaction is built on transparency, expertise, and genuine care.
          </p>
        </div>
      </section>

      {/* ── Story section ─────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left — text */}
            <div>
              <p className="text-gold text-xs uppercase tracking-[0.3em] font-semibold mb-4">
                Our Story
              </p>
              <h2 className="text-4xl font-display text-dark mb-6 leading-tight">
                Welcome to IC Cars<br />Pretoria North
              </h2>
              <div className="space-y-5 text-gray-600 leading-relaxed">
                <p>
                  Welcome to IC Cars Pretoria North, your premier destination for quality pre-owned vehicles. As a trusted partner in the automotive industry, we pride ourselves on offering an unparalleled car-buying experience that exceeds your expectations.
                </p>
                <p>
                  Our extensive range of carefully selected, quality pre-owned cars caters to diverse tastes, budgets, and lifestyles. From luxurious sedans to rugged SUVs, our inventory is meticulously maintained to ensure that every vehicle meets our exceptional standards.
                </p>
                <p>
                  At IC Cars, our customers are at the heart of everything we do. Our team of knowledgeable, friendly, and dedicated professionals is committed to providing personalized service, expert advice, and transparent transactions. We strive to make every interaction with us informative, enjoyable, and hassle-free.
                </p>
              </div>

              {/* Address block */}
              <div className="mt-8 flex items-start gap-3 border-l-2 border-gold pl-5">
                <MapPin className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold text-dark text-sm uppercase tracking-wide mb-0.5">Visit Us</p>
                  <p className="text-gray-500 text-sm">505 Rachel de Beer Street<br />Pretoria North</p>
                </div>
              </div>
            </div>

            {/* Right — decorative card stack */}
            <div className="relative h-[420px] hidden lg:block">
              {/* Background card */}
              <div
                className="absolute top-8 right-8 w-full h-full bg-black border-2 border-gold/20"
                style={{ clipPath: 'polygon(0 0,100% 0,100% calc(100% - 16px),calc(100% - 16px) 100%,0 100%)' }}
              />
              {/* Foreground card */}
              <div
                className="absolute top-0 right-0 w-[92%] h-[92%] bg-[#f5f0e8] border-2 border-dark-light overflow-hidden"
                style={{ clipPath: 'polygon(0 0,100% 0,100% calc(100% - 16px),calc(100% - 16px) 100%,0 100%)' }}
              >
                {/* Interior pattern */}
                <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="diag" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                      <line x1="0" y1="0" x2="0" y2="40" stroke="#1a1a1a" strokeWidth="1.5"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#diag)" />
                </svg>
                {/* Tagline centred */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-10">
                  <div className="w-16 h-[2px] bg-gold mb-6" />
                  <p className="font-display text-3xl text-dark leading-snug">
                    Your Journey.<br />
                    <span className="text-gold">Our Priority.</span>
                  </p>
                  <div className="w-16 h-[2px] bg-gold mt-6" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Pillars ───────────────────────────────────────────────────────── */}
      <section className="py-24 bg-black relative overflow-hidden">
        {/* Subtle background texture */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" width="32" height="32" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="#b8953a"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
          {/* Bottom-right gold slash accent */}
          <div
            className="absolute bottom-0 right-0 w-96 h-96 bg-gold/5"
            style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-gold text-xs uppercase tracking-[0.3em] font-semibold mb-4">
              What Sets Us Apart
            </p>
            <h2 className="text-4xl md:text-5xl font-display text-white">
              Built on Three Principles
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gold/10">
            {[
              {
                number: '01',
                title: 'Curated Quality',
                body: 'Every vehicle in our inventory is hand-selected and rigorously inspected. We carry only cars we would be proud to put our name on.',
              },
              {
                number: '02',
                title: 'Transparent Dealings',
                body: 'No hidden fees, no pressure tactics. We believe the right car sells itself — our role is to give you the honest information you need to decide.',
              },
              {
                number: '03',
                title: 'Personal Service',
                body: 'Our team takes the time to understand your needs, your budget, and your lifestyle, then matches you with the vehicle that genuinely fits.',
              },
            ].map(({ number, title, body }) => (
              <div
                key={number}
                className="bg-black p-10 group hover:bg-[#0d0d0d] transition-colors duration-300"
              >
                <p className="text-gold/30 font-display text-6xl font-bold leading-none mb-6 group-hover:text-gold/50 transition-colors duration-300">
                  {number}
                </p>
                <h3 className="text-white font-display text-xl mb-3">{title}</h3>
                <div className="h-[1px] w-10 bg-gold mb-4" />
                <p className="text-gray-400 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div
            className="relative bg-black overflow-hidden p-12 md:p-16 text-center"
            style={{ clipPath: 'polygon(0 0,100% 0,100% calc(100% - 20px),calc(100% - 20px) 100%,0 100%)' }}
          >
            {/* Gold corner accent */}
            <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-gold" />
            <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-gold opacity-40" />

            <p className="text-gold text-xs uppercase tracking-[0.3em] font-semibold mb-4">
              Pretoria North
            </p>
            <h2 className="text-4xl md:text-5xl font-display text-white mb-4">
              Come See Us in Person
            </h2>
            <p className="text-gray-400 text-lg mb-2 max-w-lg mx-auto">
              505 Rachel de Beer Street, Pretoria North
            </p>
            <p className="text-gray-500 text-sm mb-10">
              Our doors are open — no appointment necessary.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/vehicles">
                <button className="btn-filled btn-filled-gold text-sm tracking-wide">
                  Browse Our Stock
                </button>
              </Link>
              <Link href="/contact">
                <button className="btn-hollow btn-hollow-white text-sm tracking-wide">
                  Get in Touch
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}