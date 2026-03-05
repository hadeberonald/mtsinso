import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Gauge, Fuel, Settings } from 'lucide-react'

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  price: number
  mileage: number
  transmission: string
  fuel_type: string
  images: string[]
  drivetrain: string
  condition?: string
  finance_available?: boolean
  estimated_monthly_payment?: number | null
}

export default function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const formatPrice = (p: number) =>
    new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', minimumFractionDigits: 0 }).format(p)

  const formatMileage = (m: number) =>
    new Intl.NumberFormat('en-ZA').format(m) + ' km'

  return (
    <Link href={`/vehicles/${vehicle.id}`} className="group block">
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/20 hover:-translate-y-1">

        {/* Image */}
        <div className="relative h-52 overflow-hidden bg-gray-100 rounded-t-2xl">
          {vehicle.images?.length > 0 ? (
            <Image
              src={vehicle.images[0]}
              alt={`${vehicle.make} ${vehicle.model}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-sm">
              No Image
            </div>
          )}

          {/* Price badge */}
          <div className="absolute top-3 left-3 bg-primary text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
            {formatPrice(vehicle.price)}
          </div>

          {/* Condition badge */}
          {vehicle.condition && (
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-support text-xs font-semibold px-2.5 py-1 rounded-full">
              {vehicle.condition}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-display text-xl text-support mb-1 leading-snug">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h3>

          {vehicle.finance_available && vehicle.estimated_monthly_payment && (
            <p className="text-xs text-muted mb-3">
              From {formatPrice(vehicle.estimated_monthly_payment)}/month
            </p>
          )}

          {/* Specs */}
          <div className="grid grid-cols-2 gap-2 my-4">
            {[
              { Icon: Calendar, value: String(vehicle.year) },
              { Icon: Gauge,    value: formatMileage(vehicle.mileage) },
              { Icon: Settings, value: vehicle.transmission },
              { Icon: Fuel,     value: vehicle.fuel_type },
            ].map(({ Icon, value }) => (
              <div key={value} className="flex items-center gap-2 text-xs text-muted">
                <Icon className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span className="truncate">{value}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="pt-3 border-t border-gray-100">
            <span className="btn-outline w-full text-sm py-2.5 block text-center rounded-xl">
              View Details
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
