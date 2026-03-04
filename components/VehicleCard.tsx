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
}

interface VehicleCardProps {
  vehicle: Vehicle
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat('en-ZA').format(mileage) + ' km'
  }

  return (
    <Link href={`/vehicles/${vehicle.id}`} className="group block">
      <div className="card-angled bg-white border-2 border-dark-light overflow-hidden transition-all duration-300 hover:border-gold hover:shadow-xl">
        {/* Image */}
        <div className="relative h-56 overflow-hidden bg-gray-100">
          {vehicle.images && vehicle.images.length > 0 ? (
            <Image
              src={vehicle.images[0]}
              alt={`${vehicle.make} ${vehicle.model}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
          {/* Price Tag */}
          <div className="absolute top-4 left-4 bg-gold text-black px-4 py-2 font-bold">
            {formatPrice(vehicle.price)}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-2xl font-display text-dark mb-2">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h3>

          {/* Specs Grid */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2 text-gold" />
              <span>{vehicle.year}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Gauge className="w-4 h-4 mr-2 text-gold" />
              <span>{formatMileage(vehicle.mileage)}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Settings className="w-4 h-4 mr-2 text-gold" />
              <span>{vehicle.transmission}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Fuel className="w-4 h-4 mr-2 text-gold" />
              <span>{vehicle.fuel_type}</span>
            </div>
          </div>

          {/* View Details Button */}
          <div className="mt-6">
            <button className="w-full btn-hollow btn-hollow-gold">
              View Details
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
