'use client'

import Link from 'next/link'
import { Shield, Clock, ArrowRight } from 'lucide-react'

export default function FinanceBanner() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative overflow-hidden bg-primary rounded-3xl">

          {/* Background texture */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/4" />
          </div>

          <div className="relative px-8 py-10 md:py-12 flex flex-col md:flex-row items-center gap-8 md:gap-12">

            {/* Left: Icon + Text */}
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 text-white/70 text-xs font-bold uppercase tracking-widest mb-3">
                <Shield className="w-3.5 h-3.5" />
                NCR Compliant
              </div>
              <h2 className="text-2xl md:text-3xl font-display text-white mb-3 leading-tight">
                Get Pre-Approved for Vehicle Finance
              </h2>
              <p className="text-white/70 text-sm md:text-base max-w-xl leading-relaxed">
                Complete our quick application and receive a pre-approval estimate. Our team will contact you within 24 hours.
              </p>
            </div>

            {/* Stats */}
            <div className="hidden lg:flex items-center gap-8 flex-shrink-0">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 text-white mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-lg font-bold">5 min</span>
                </div>
                <div className="text-xs text-white/60 uppercase tracking-wide">To apply</div>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 text-white mb-1">
                  <Shield className="w-4 h-4" />
                  <span className="text-lg font-bold">NCR</span>
                </div>
                <div className="text-xs text-white/60 uppercase tracking-wide">Compliant</div>
              </div>
            </div>

            {/* CTA */}
            <div className="flex-shrink-0">
              <Link href="/finance/apply" className="inline-flex items-center gap-2 bg-white text-primary px-7 py-3.5 rounded-full font-bold text-sm hover:bg-gray-100 transition-all duration-300 shadow-lg">
                Apply Now
                <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="text-xs text-white/50 mt-2 text-center">No obligation · Free estimate</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
