import { supabase } from '@/lib/supabase'
import HeroCarousel from '@/components/HeroCarousel'
import VehicleCard from '@/components/VehicleCard'
import FinanceBanner from '@/components/FinanceBanner'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

async function getHeroSlides() {
  const { data, error } = await supabase
    .from('hero_carousel')
    .select('*')
    .eq('active', true)
    .order('order_index', { ascending: true })
  if (error) { console.error('Error fetching hero slides:', error); return [] }
  return data || []
}

async function getFeaturedVehicles() {
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('status', 'available')
    .order('created_at', { ascending: false })
    .limit(6)
  if (error) { console.error('Error fetching vehicles:', error); return [] }
  return data || []
}

export const revalidate = 60

export default async function HomePage() {
  const [heroSlides, vehicles] = await Promise.all([getHeroSlides(), getFeaturedVehicles()])

  return (
    <div className="pt-20">
      {/* Hero Carousel */}
      <HeroCarousel slides={heroSlides} />

      {/* In Stock Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-display text-dark mb-4">
              Vehicles <span className="text-gold">In Stock</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Browse our current selection of quality vehicles. Each vehicle is thoroughly inspected
              and comes with financing options.
            </p>
          </div>

          {vehicles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {vehicles.map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>
              <div className="text-center mt-12">
                <Link href="/vehicles" className="inline-flex items-center group">
                  <span className="text-lg font-medium text-dark group-hover:text-gold transition-colors duration-300 mr-2">
                    View All Vehicles
                  </span>
                  <ArrowRight className="w-5 h-5 text-gold group-hover:translate-x-2 transition-transform duration-300" />
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No vehicles available at the moment. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Finance Pre-Approval Banner ── */}
      <FinanceBanner />

      {/* Why Choose Us */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display text-white mb-4">
              Why Choose <span className="text-gold">IC Cars</span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Your trusted partner for quality vehicles in Pretoria
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { n: '1', title: 'Quality Assured', body: 'Every vehicle undergoes thorough inspection and quality checks before being listed for sale.' },
              { n: '2', title: 'Flexible Financing', body: 'We work with leading financial institutions to offer competitive financing options tailored to your needs.' },
              { n: '3', title: 'Expert Service', body: 'Our experienced team is dedicated to helping you find the perfect vehicle for your lifestyle and budget.' },
            ].map(({ n, title, body }) => (
              <div key={n} className="card-angled bg-dark-light border-2 border-gold p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-gold flex items-center justify-center text-3xl font-bold text-black">{n}</div>
                <h3 className="text-2xl font-display text-gold mb-4">{title}</h3>
                <p className="text-gray-400">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="card-angled bg-black p-12 md:p-16 text-center">
            <h2 className="text-4xl md:text-5xl font-display text-white mb-6">
              Ready to Find Your <span className="text-gold">Perfect Vehicle?</span>
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Visit our showroom in Pretoria or contact us today to schedule a test drive.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/vehicles">
                <button className="btn-filled btn-filled-gold text-lg">Browse Vehicles</button>
              </Link>
              <Link href="/contact">
                <button className="btn-hollow btn-hollow-white text-lg">Contact Us</button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}