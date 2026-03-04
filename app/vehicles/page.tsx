'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import VehicleCard from '@/components/VehicleCard'
import { Search, SlidersHorizontal } from 'lucide-react'

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  price: number
  mileage: number
  transmission: string
  fuel_type: string
  drivetrain: string
  images: string[]
  condition: string
  status: string
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    transmission: '',
    fuelType: '',
    drivetrain: '',
    condition: '',
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchVehicles()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [searchTerm, filters, vehicles])

  const fetchVehicles = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('status', 'available')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching vehicles:', error)
    } else {
      setVehicles(data || [])
      setFilteredVehicles(data || [])
    }
    setLoading(false)
  }

  const applyFilters = () => {
    let filtered = [...vehicles]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (v) =>
          v.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
          v.model.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Price filters
    if (filters.minPrice) {
      filtered = filtered.filter((v) => v.price >= parseInt(filters.minPrice))
    }
    if (filters.maxPrice) {
      filtered = filtered.filter((v) => v.price <= parseInt(filters.maxPrice))
    }

    // Transmission filter
    if (filters.transmission) {
      filtered = filtered.filter((v) => v.transmission === filters.transmission)
    }

    // Fuel type filter
    if (filters.fuelType) {
      filtered = filtered.filter((v) => v.fuel_type === filters.fuelType)
    }

    // Drivetrain filter
    if (filters.drivetrain) {
      filtered = filtered.filter((v) => v.drivetrain === filters.drivetrain)
    }

    // Condition filter
    if (filters.condition) {
      filtered = filtered.filter((v) => v.condition === filters.condition)
    }

    setFilteredVehicles(filtered)
  }

  const resetFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      transmission: '',
      fuelType: '',
      drivetrain: '',
      condition: '',
    })
    setSearchTerm('')
  }

  return (
    <div className="pt-20 min-h-screen bg-white">
      {/* Header */}
      <section className="bg-black py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-5xl md:text-6xl font-display text-white mb-4">
            Browse Our <span className="text-gold">Collection</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl">
            Discover quality vehicles with flexible financing options. All vehicles are inspected and ready to drive.
          </p>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-gray-50 border-b-2 border-dark-light">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by make or model..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field w-full pl-12"
              />
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-hollow btn-hollow-gold flex items-center justify-center gap-2"
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span>Filters</span>
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 p-6 card-angled bg-white border-2 border-dark-light">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Min Price (ZAR)</label>
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                    className="input-field"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Max Price (ZAR)</label>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                    className="input-field"
                    placeholder="1000000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Transmission</label>
                  <select
                    value={filters.transmission}
                    onChange={(e) => setFilters({ ...filters, transmission: e.target.value })}
                    className="input-field"
                  >
                    <option value="">All</option>
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Fuel Type</label>
                  <select
                    value={filters.fuelType}
                    onChange={(e) => setFilters({ ...filters, fuelType: e.target.value })}
                    className="input-field"
                  >
                    <option value="">All</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Drivetrain</label>
                  <select
                    value={filters.drivetrain}
                    onChange={(e) => setFilters({ ...filters, drivetrain: e.target.value })}
                    className="input-field"
                  >
                    <option value="">All</option>
                    <option value="4x2">4x2</option>
                    <option value="4x4">4x4</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Condition</label>
                  <select
                    value={filters.condition}
                    onChange={(e) => setFilters({ ...filters, condition: e.target.value })}
                    className="input-field"
                  >
                    <option value="">All</option>
                    <option value="New">New</option>
                    <option value="Used">Used</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button onClick={resetFilters} className="text-gold hover:text-gold-dark transition-colors">
                  Reset Filters
                </button>
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredVehicles.length} of {vehicles.length} vehicles
          </div>
        </div>
      </section>

      {/* Vehicles Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Loading vehicles...</p>
            </div>
          ) : filteredVehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredVehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-xl text-gray-600">No vehicles found matching your criteria.</p>
              <button onClick={resetFilters} className="mt-4 btn-hollow btn-hollow-gold">
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
