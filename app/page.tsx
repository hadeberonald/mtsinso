import { supabase } from '@/lib/supabase'
import HeroCarousel from '@/components/HeroCarousel'
import VehicleCard from '@/components/VehicleCard'
import FinanceBanner from '@/components/FinanceBanner'
import Link from 'next/link'
import { ArrowRight, ShieldCheck, TrendingUp, Users } from 'lucide-react'

async function getHeroSlides() {
  const { data } = await supabase.from('hero_carousel').select('*').eq('active', true).order('order_index')
  return data || []
}

async function getFeaturedVehicles() {
  const { data } = await supabase.from('vehicles').select('*').eq('status', 'available').order('created_at', { ascending: false }).limit(6)
  return data || []
}

export const revalidate = 60

export default async function HomePage() {
  const [heroSlides, vehicles] = await Promise.all([getHeroSlides(), getFeaturedVehicles()])

  return (
    <div className="pt-8">

      {/* Hero */}
      <HeroCarousel slides={heroSlides} />

      {/* In Stock */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <div className="section-tag">
                <span className="w-5 h-px bg-primary inline-block" />
                Available Now
              </div>
              <h2 className="font-display text-4xl md:text-5xl text-support leading-tight">
                Vehicles <span className="text-primary">In Stock</span>
              </h2>
            </div>
            <Link href="/vehicles" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark transition-colors">
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {vehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map(v => <VehicleCard key={v.id} vehicle={v} />)}
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-3xl">
              <p className="text-muted text-lg">No vehicles available at the moment. Check back soon.</p>
            </div>
          )}
        </div>
      </section>

      {/* Finance banner */}
      <FinanceBanner />

      {/* Why Choose Us */}
      <section className="py-20 bg-support">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <div className="section-tag-white justify-center">
              <span className="w-5 h-px bg-white/40 inline-block" />
              Our Promise
            </div>
            <h2 className="font-display text-4xl md:text-5xl text-white">
              Why Choose <span className="text-primary-light">Mtsinso</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                Icon: ShieldCheck,
                title: 'Quality Assured',
                body: 'Every vehicle undergoes thorough inspection before listing. We only stock cars we are proud to put our name on.',
              },
              {
                Icon: TrendingUp,
                title: 'Flexible Financing',
                body: 'We work with leading financial institutions to offer competitive terms tailored to your needs and budget.',
              },
              {
                Icon: Users,
                title: 'Personal Service',
                body: 'Our team takes time to understand your needs, then matches you with the right vehicle at the right price.',
              },
            ].map(({ Icon, title, body }) => (
              <div key={title} className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 text-primary-light" />
                </div>
                <h3 className="font-display text-xl text-white mb-3">{title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-gray-50 rounded-3xl p-12 md:p-16 text-center">
            <div className="section-tag justify-center">
              <span className="w-5 h-px bg-primary inline-block" />
              Visit Us
            </div>
            <h2 className="font-display text-4xl md:text-5xl text-support mb-4">
              Ready to Find Your <span className="text-primary">Perfect Vehicle?</span>
            </h2>
            <p className="text-muted text-lg mb-10 max-w-2xl mx-auto">
              Visit our showroom or contact us today to schedule a test drive. No pressure, just honest service.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/vehicles" className="btn-primary">
                Browse Vehicles
              </Link>
              <Link href="/contact" className="btn-outline">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
