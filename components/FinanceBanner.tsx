'use client'

import Link from 'next/link'
import { Shield, TrendingUp, Clock, ChevronRight } from 'lucide-react'

// ============================================================
// FinanceBanner — drop between sections on homepage
// Usage: <FinanceBanner />
// ============================================================

export default function FinanceBanner() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="relative overflow-hidden bg-black border-2 border-gold/30" style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)' }}>
          
          {/* Subtle gold diagonal accent */}
          <div className="absolute top-0 right-0 w-64 h-full opacity-5"
            style={{ background: 'linear-gradient(135deg, transparent 40%, #C9A84C 40%, #C9A84C 60%, transparent 60%)' }}
          />
          <div className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent opacity-60" />
          <div className="absolute -bottom-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent opacity-60" />

          <div className="relative px-8 py-10 md:py-12 flex flex-col md:flex-row items-center gap-8 md:gap-12">
            
            {/* Left: Text */}
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 text-gold text-xs font-bold uppercase tracking-widest mb-3">
                <Shield className="w-3.5 h-3.5" />
                NCR Compliant 
              </div>
              <h2 className="text-2xl md:text-3xl font-display text-white mb-3 leading-tight">
                Get Pre-Approved for <span className="text-gold">Vehicle Finance</span>
              </h2>
              <p className="text-gray-400 text-sm md:text-base max-w-xl leading-relaxed">
                Complete our quick application and receive a pre-approval estimate. Our team will contact you within 24 hours.
              </p>
            </div>

            {/* Centre: Stats */}
            <div className="hidden lg:flex items-center gap-8 flex-shrink-0">
              <Stat icon={<Clock className="w-4 h-4" />} value="5 min" label="To apply" />
              <div className="w-px h-10 bg-gold/20" />
              <div className="w-px h-10 bg-gold/20" />
              <Stat icon={<Shield className="w-4 h-4" />} value="NCR" label="Compliant" />
            </div>

            {/* Right: CTA */}
            <div className="flex-shrink-0">
              <Link
                href="/finance/apply"
                className="group inline-flex items-center gap-3 bg-gold text-black px-7 py-4 font-bold text-sm uppercase tracking-wide hover:bg-white transition-all duration-300"
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)' }}
              >
                Apply Now
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <p className="text-xs text-gray-600 mt-2 text-center">No obligation · Free estimate</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1.5 text-gold mb-1">
        {icon}
        <span className="text-lg font-bold">{value}</span>
      </div>
      <div className="text-xs text-gray-500 uppercase tracking-wide">{label}</div>
    </div>
  )
}