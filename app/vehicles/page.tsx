'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import VehicleCard from '@/components/VehicleCard'
import { Search, SlidersHorizontal, X } from 'lucide-react'

interface Vehicle {
  id: string; make: string; model: string; year: number; price: number
  mileage: number; transmission: string; fuel_type: string; drivetrain: string
  images: string[]; condition: string; status: string
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [filtered, setFiltered] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({ minPrice: '', maxPrice: '', transmission: '', fuelType: '', drivetrain: '', condition: '' })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => { fetchVehicles() }, [])
  useEffect(() => { applyFilters() }, [searchTerm, filters, vehicles])

  const fetchVehicles = async () => {
    setLoading(true)
    const { data } = await supabase.from('vehicles').select('*').eq('status', 'available').order('created_at', { ascending: false })
    setVehicles(data || [])
    setFiltered(data || [])
    setLoading(false)
  }

  const applyFilters = () => {
    let f = [...vehicles]
    if (searchTerm) f = f.filter(v => v.make.toLowerCase().includes(searchTerm.toLowerCase()) || v.model.toLowerCase().includes(searchTerm.toLowerCase()))
    if (filters.minPrice) f = f.filter(v => v.price >= parseInt(filters.minPrice))
    if (filters.maxPrice) f = f.filter(v => v.price <= parseInt(filters.maxPrice))
    if (filters.transmission) f = f.filter(v => v.transmission === filters.transmission)
    if (filters.fuelType) f = f.filter(v => v.fuel_type === filters.fuelType)
    if (filters.drivetrain) f = f.filter(v => v.drivetrain === filters.drivetrain)
    if (filters.condition) f = f.filter(v => v.condition === filters.condition)
    setFiltered(f)
  }

  const resetFilters = () => {
    setFilters({ minPrice: '', maxPrice: '', transmission: '', fuelType: '', drivetrain: '', condition: '' })
    setSearchTerm('')
  }

  const hasActiveFilters = searchTerm || Object.values(filters).some(Boolean)

  return (
    <div className="pt-16 min-h-screen bg-white">

      {/* Header */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="section-tag">
            <span className="w-5 h-px bg-primary inline-block" />
            Our Collection
          </div>
          <h1 className="font-display text-5xl md:text-6xl text-support mb-4">
            Browse <span className="text-primary">Vehicles</span>
          </h1>
          <p className="text-muted text-lg max-w-2xl">
            Quality vehicles with flexible financing. All inspected and ready to drive.
          </p>
        </div>
      </section>

      {/* Search + Filters */}
      <section className="py-6 bg-white border-b border-gray-100 sticky top-16 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                placeholder="Search make or model..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full border-2 text-sm font-semibold transition-all ${
                showFilters || hasActiveFilters ? 'bg-primary border-primary text-white' : 'border-gray-200 text-support hover:border-primary hover:text-primary'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {hasActiveFilters && <span className="w-2 h-2 bg-white rounded-full" />}
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-support uppercase tracking-wide mb-1.5">Min Price</label>
                  <input type="number" value={filters.minPrice} onChange={e => setFilters({ ...filters, minPrice: e.target.value })} className="input-field" placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-support uppercase tracking-wide mb-1.5">Max Price</label>
                  <input type="number" value={filters.maxPrice} onChange={e => setFilters({ ...filters, maxPrice: e.target.value })} className="input-field" placeholder="1 000 000" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-support uppercase tracking-wide mb-1.5">Transmission</label>
                  <select value={filters.transmission} onChange={e => setFilters({ ...filters, transmission: e.target.value })} className="input-field">
                    <option value="">All</option>
                    <option>Automatic</option>
                    <option>Manual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-support uppercase tracking-wide mb-1.5">Fuel Type</label>
                  <select value={filters.fuelType} onChange={e => setFilters({ ...filters, fuelType: e.target.value })} className="input-field">
                    <option value="">All</option>
                    <option>Petrol</option><option>Diesel</option><option>Electric</option><option>Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-support uppercase tracking-wide mb-1.5">Drivetrain</label>
                  <select value={filters.drivetrain} onChange={e => setFilters({ ...filters, drivetrain: e.target.value })} className="input-field">
                    <option value="">All</option>
                    <option value="4x2">4x2</option><option value="4x4">4x4</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-support uppercase tracking-wide mb-1.5">Condition</label>
                  <select value={filters.condition} onChange={e => setFilters({ ...filters, condition: e.target.value })} className="input-field">
                    <option value="">All</option>
                    <option>New</option><option>Used</option>
                  </select>
                </div>
              </div>
              {hasActiveFilters && (
                <button onClick={resetFilters} className="mt-3 flex items-center gap-1.5 text-sm text-primary hover:text-primary-dark transition-colors font-medium">
                  <X className="w-3.5 h-3.5" /> Clear all filters
                </button>
              )}
            </div>
          )}

          <p className="text-xs text-muted mt-3">
            Showing {filtered.length} of {vehicles.length} vehicles
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {loading ? (
            <div className="text-center py-24">
              <div className="inline-block w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="mt-4 text-muted text-sm">Loading vehicles...</p>
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(v => <VehicleCard key={v.id} vehicle={v} />)}
            </div>
          ) : (
            <div className="text-center py-24 bg-gray-50 rounded-3xl">
              <p className="text-support font-display text-2xl mb-2">No vehicles found</p>
              <p className="text-muted text-sm mb-6">Try adjusting your filters or search term.</p>
              <button onClick={resetFilters} className="btn-outline">Clear Filters</button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
