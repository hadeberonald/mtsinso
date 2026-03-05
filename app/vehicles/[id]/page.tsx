'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { FEATURE_CATEGORIES } from '@/lib/vehicle-features'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft, Calendar, Gauge, Fuel, Settings, Palette,
  ShieldCheck, Car, ChevronLeft, ChevronRight,
  Users, Wrench, Check, X, TrendingUp
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'

// ── WhatsApp config ──────────────────────────────────────────────────────────
const WHATSAPP_NUMBER = '27795362485'

function buildVehicleWhatsAppUrl(vehicle: Vehicle) {
  const price = new Intl.NumberFormat('en-ZA', {
    style: 'currency', currency: 'ZAR', minimumFractionDigits: 0,
  }).format(vehicle.price)
  const mileage = new Intl.NumberFormat('en-ZA').format(vehicle.mileage)
  const message =
`Hi Mtsinso Car Sales! I'm interested in the following vehicle:

*${vehicle.year} ${vehicle.make} ${vehicle.model}*
Price: ${price}
Mileage: ${mileage} km
Colour: ${vehicle.color}

Could you please provide more details or arrange a test drive?

(Vehicle ref: ${vehicle.id})`
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}
// ────────────────────────────────────────────────────────────────────────────

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  price: number
  mileage: number
  description: string
  transmission: string
  fuel_type: string
  drivetrain: string
  color: string
  interior_color: string | null
  condition: string
  body_type: string
  engine_size: string | null
  doors: number
  seats: number
  cylinders: number
  vin: string | null
  license_plate: string | null
  registration_date: string | null
  warranty: boolean
  warranty_expiry: string | null
  service_history: boolean
  finance_available: boolean
  estimated_monthly_payment: number | null
  images: string[]
  status: string
  abs: boolean; airbags: number; traction_control: boolean; stability_control: boolean
  hill_assist: boolean; lane_assist: boolean; blind_spot_monitor: boolean; rear_cross_traffic: boolean
  adaptive_cruise: boolean; auto_emergency_brake: boolean; alarm_system: boolean; immobilizer: boolean
  central_locking: boolean; isofix: boolean; aircon: boolean; climate_control: boolean
  rear_ac: boolean; cruise_control: boolean; power_steering: boolean; electric_seats: boolean
  memory_seats: boolean; heated_seats: boolean; leather_seats: boolean; bluetooth: boolean
  usb_port: boolean; aux_input: boolean; touchscreen: boolean; navigation: boolean
  multimedia_system: boolean; apple_carplay: boolean; android_auto: boolean; reverse_camera: boolean
  parking_sensors: boolean; electric_windows: boolean; electric_mirrors: boolean; keyless_entry: boolean
  keyless_start: boolean; sunroof: boolean; panoramic_roof: boolean; paddle_shifters: boolean
  sport_mode: boolean; eco_mode: boolean; alloy_wheels: boolean; fog_lights: boolean
  xenon_lights: boolean; led_lights: boolean; daytime_running_lights: boolean; tow_bar: boolean
  roof_rails: boolean; warranty_remaining: boolean; owners_count: number
}

// ── Lightbox ─────────────────────────────────────────────────────────────────
function Lightbox({ imgs, startIdx, onClose }: { imgs: string[]; startIdx: number; onClose: () => void }) {
  const [idx, setIdx] = useState(startIdx)

  const prev = useCallback(() => setIdx(i => (i - 1 + imgs.length) % imgs.length), [imgs.length])
  const next = useCallback(() => setIdx(i => (i + 1) % imgs.length), [imgs.length])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, prev, next])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col" onClick={onClose}>
      {/* Top bar */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-black/80"
        onClick={e => e.stopPropagation()}
      >
        <span className="text-white/60 text-sm font-medium">{idx + 1} / {imgs.length}</span>
        <button
          onClick={onClose}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white transition-colors touch-manipulation"
          aria-label="Close lightbox"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main image */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden" onClick={e => e.stopPropagation()}>
        <Image key={idx} src={imgs[idx]} alt={`Image ${idx + 1}`} fill className="object-contain" sizes="100vw" priority />

        {imgs.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 sm:left-5 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-black/60 hover:bg-primary text-white transition-colors touch-manipulation"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-7 h-7" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 sm:right-5 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-black/60 hover:bg-primary text-white transition-colors touch-manipulation"
              aria-label="Next image"
            >
              <ChevronRight className="w-7 h-7" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {imgs.length > 1 && (
        <div className="flex-shrink-0 bg-black/80 py-3 px-4" onClick={e => e.stopPropagation()}>
          <div className="flex gap-2 justify-center overflow-x-auto pb-1">
            {imgs.map((img, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`relative h-14 w-20 flex-shrink-0 rounded-lg border-2 transition-all overflow-hidden touch-manipulation
                  ${i === idx ? 'border-primary' : 'border-white/20 hover:border-primary/60'}`}
              >
                <Image src={img} alt="" fill className="object-cover" sizes="80px" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
// ────────────────────────────────────────────────────────────────────────────

export default function VehicleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [vehicle, setVehicle]              = useState<Vehicle | null>(null)
  const [loading, setLoading]              = useState(true)
  const [currentImageIndex, setCurrentIdx] = useState(0)
  const [lightboxOpen, setLightboxOpen]    = useState(false)
  const [lightboxStart, setLightboxStart]  = useState(0)

  useEffect(() => { if (params.id) fetchVehicle(params.id as string) }, [params.id])

  const fetchVehicle = async (id: string) => {
    setLoading(true)
    const { data, error } = await supabase.from('vehicles').select('*').eq('id', id).single()
    if (error) router.push('/vehicles')
    else setVehicle(data)
    setLoading(false)
  }

  const formatPrice   = (p: number) => new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', minimumFractionDigits: 0 }).format(p)
  const formatMileage = (m: number) => new Intl.NumberFormat('en-ZA').format(m) + ' km'
  const wrap          = (i: number, len: number) => ((i % len) + len) % len

  const openLightbox = (idx: number) => { setLightboxStart(idx); setLightboxOpen(true) }

  const financeUrl = vehicle
    ? `/finance/apply?vehicleId=${vehicle.id}&vehicleDetails=${encodeURIComponent(`${vehicle.year} ${vehicle.make} ${vehicle.model}`)}&price=${vehicle.price}`
    : '/finance/apply'

  if (loading) return (
    <div className="pt-20 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-muted">Loading vehicle details...</p>
      </div>
    </div>
  )

  if (!vehicle) return (
    <div className="pt-20 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-xl text-muted">Vehicle not found</p>
        <Link href="/vehicles" className="mt-4 inline-block btn-outline">Back to Vehicles</Link>
      </div>
    </div>
  )

  const imgs = vehicle.images || []

  return (
    <div className="pt-20 min-h-screen bg-white">

      {lightboxOpen && imgs.length > 0 && (
        <Lightbox imgs={imgs} startIdx={lightboxStart} onClose={() => setLightboxOpen(false)} />
      )}

      {/* Back bar */}
      <div className="bg-support py-4">
        <div className="max-w-7xl mx-auto px-6">
          <Link href="/vehicles" className="inline-flex items-center text-white hover:text-primary/80 transition-colors text-sm">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to All Vehicles
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* ── Image gallery ── */}
          <div>
            <div
              className="relative h-96 md:h-[500px] mb-3 rounded-2xl overflow-hidden border border-gray-200 cursor-pointer group"
              onClick={() => openLightbox(currentImageIndex)}
            >
              {imgs.length > 0 ? (
                <>
                  <Image
                    src={imgs[currentImageIndex]}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30">
                    <div className="bg-white text-support text-sm px-4 py-2 rounded-lg font-semibold">
                      Click to Enlarge
                    </div>
                  </div>
                  {imgs.length > 1 && (
                    <>
                      <button
                        onClick={e => { e.stopPropagation(); setCurrentIdx(i => wrap(i - 1, imgs.length)) }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-xl bg-black/50 text-white hover:bg-primary transition-colors touch-manipulation"
                        aria-label="Previous"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); setCurrentIdx(i => wrap(i + 1, imgs.length)) }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-xl bg-black/50 text-white hover:bg-primary transition-colors touch-manipulation"
                        aria-label="Next"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-muted">
                  No Image Available
                </div>
              )}
              {/* Condition badge */}
              <div className="absolute top-4 left-4 badge-primary">
                {vehicle.condition}
              </div>
              {imgs.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full font-medium">
                  {currentImageIndex + 1}/{imgs.length}
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {imgs.length > 1 && (
              <div className="grid grid-cols-6 gap-1.5">
                {imgs.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => { setCurrentIdx(i); openLightbox(i) }}
                    className={`relative h-16 rounded-xl overflow-hidden border-2 transition-all hover:scale-105 touch-manipulation
                      ${i === currentImageIndex ? 'border-primary' : 'border-gray-200 hover:border-primary/50'}`}
                  >
                    <Image src={img} alt="" fill className="object-cover" sizes="80px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Vehicle details ── */}
          <div>
            <div className="mb-6">
              <p className="text-sm text-muted uppercase tracking-widest mb-1">
                {vehicle.body_type} · {vehicle.condition}
              </p>
              <h1 className="text-3xl md:text-4xl font-display text-support mb-4 leading-tight">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h1>
              <div className="flex items-baseline gap-4 flex-wrap">
                <span className="text-4xl font-bold text-primary">{formatPrice(vehicle.price)}</span>
                {vehicle.finance_available && vehicle.estimated_monthly_payment && (
                  <span className="text-sm text-muted">
                    or from {formatPrice(vehicle.estimated_monthly_payment)}/month
                  </span>
                )}
              </div>
            </div>

            {/* Key specs grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { Icon: Calendar, label: 'Year',         value: vehicle.year },
                { Icon: Gauge,    label: 'Mileage',      value: formatMileage(vehicle.mileage) },
                { Icon: Settings, label: 'Transmission', value: vehicle.transmission },
                { Icon: Fuel,     label: 'Fuel Type',    value: vehicle.fuel_type },
                { Icon: Car,      label: 'Drivetrain',   value: vehicle.drivetrain },
                { Icon: Palette,  label: 'Colour',       value: vehicle.color },
              ].map(({ Icon, label, value }) => (
                <div key={label} className="rounded-2xl bg-gray-50 p-4 border border-gray-200">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Icon className="w-4 h-4 text-primary" />
                    <span className="text-xs text-muted uppercase tracking-wide">{label}</span>
                  </div>
                  <p className="text-lg font-bold text-support">{value}</p>
                </div>
              ))}
            </div>

            {/* Specs table */}
            <div className="rounded-2xl bg-gray-50 p-5 border border-gray-200 mb-6">
              <h3 className="text-base font-bold text-support mb-3 pb-2 border-b border-gray-200">
                Specifications
              </h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {([
                  ['Body Type', vehicle.body_type],
                  ['Doors',     String(vehicle.doors)],
                  ['Seats',     String(vehicle.seats)],
                  vehicle.engine_size    ? ['Engine',   `${vehicle.engine_size}L`]   : null,
                  ['Cylinders', String(vehicle.cylinders)],
                  vehicle.interior_color ? ['Interior', vehicle.interior_color] : null,
                ] as ([string, string] | null)[])
                  .filter((row): row is [string, string] => row !== null)
                  .map(([label, value]) => (
                    <div key={label} className="flex justify-between py-0.5 border-b border-gray-100 last:border-0">
                      <span className="text-muted">{label}</span>
                      <span className="font-semibold text-support">{value}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href={financeUrl} className="flex-1">
                <button className="w-full btn-primary font-bold tracking-wide">
                  Get Pre-Approved
                </button>
              </Link>
              <a href={buildVehicleWhatsAppUrl(vehicle)} target="_blank" rel="noopener noreferrer" className="flex-1">
                <button className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1da851] active:bg-[#199c47] text-white font-bold tracking-wide px-6 py-3 rounded-2xl transition-colors duration-200 touch-manipulation">
                  <WhatsAppIcon className="w-5 h-5" />
                  Inquire on WhatsApp
                </button>
              </a>
            </div>

            <p className="text-xs text-muted mt-2 text-center">
              or{' '}
              <a href={buildVehicleWhatsAppUrl(vehicle)} target="_blank" rel="noopener noreferrer" className="underline hover:text-[#25D366] transition-colors">
                schedule a test drive via WhatsApp
              </a>
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="mt-16">
          <h2 className="text-3xl font-display text-support mb-5">Vehicle Description</h2>
          <div className="rounded-2xl bg-gray-50 border border-gray-200 p-8">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{vehicle.description}</p>
          </div>
        </div>

        {/* Features & Equipment */}
        <div className="mt-16">
          <h2 className="text-3xl font-display text-support mb-5">Features & Equipment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {Object.entries(FEATURE_CATEGORIES).map(([catKey, cat]) => {
              const enabled = cat.features.filter(f => vehicle[f.key as keyof Vehicle] === true)
              if (enabled.length === 0 && catKey !== 'safety' && catKey !== 'history') return null
              return (
                <div key={catKey} className="rounded-2xl bg-white border border-gray-200 p-6">
                  <h3 className="text-lg font-display text-support mb-4 pb-2 border-b-2 border-primary">
                    {cat.title}
                  </h3>
                  <div className="space-y-2">
                    {catKey === 'safety' && vehicle.airbags > 0 && (
                      <div className="flex items-center gap-2 text-sm text-support">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {vehicle.airbags} Airbags
                      </div>
                    )}
                    {enabled.map(f => (
                      <div key={f.key} className="flex items-center gap-2 text-sm text-support">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {f.label}
                      </div>
                    ))}
                    {catKey === 'history' && (
                      <div className="flex items-center gap-2 text-sm text-support mt-2 pt-2 border-t border-gray-100">
                        <Users className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="font-medium">
                          {vehicle.owners_count === 0 ? 'Brand New' :
                           vehicle.owners_count === 1 ? '1 Previous Owner' :
                           `${vehicle.owners_count} Previous Owners`}
                        </span>
                      </div>
                    )}
                    {enabled.length === 0 && catKey !== 'safety' && catKey !== 'history' && (
                      <p className="text-muted text-sm italic">No features listed</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Vehicle History & Documentation */}
        {(vehicle.service_history || vehicle.warranty || vehicle.vin || vehicle.license_plate) && (
          <div className="mt-16">
            <h2 className="text-3xl font-display text-support mb-5">Vehicle History & Documentation</h2>
            <div className="rounded-2xl bg-gray-50 border border-gray-200 p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {vehicle.service_history && (
                  <div className="flex items-start gap-3">
                    <Wrench className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-support mb-0.5">Full Service History</h4>
                      <p className="text-sm text-muted">Complete service records available</p>
                    </div>
                  </div>
                )}
                {vehicle.warranty && (
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-support mb-0.5">Warranty Coverage</h4>
                      <p className="text-sm text-muted">
                        {vehicle.warranty_expiry
                          ? `Valid until ${new Date(vehicle.warranty_expiry).toLocaleDateString()}`
                          : 'Active warranty included'}
                      </p>
                    </div>
                  </div>
                )}
                {vehicle.vin && (
                  <div>
                    <h4 className="font-bold text-support mb-0.5">VIN Number</h4>
                    <p className="text-sm text-muted font-mono">{vehicle.vin}</p>
                  </div>
                )}
                {vehicle.license_plate && (
                  <div>
                    <h4 className="font-bold text-support mb-0.5">License Plate</h4>
                    <p className="text-sm text-muted font-mono">{vehicle.license_plate}</p>
                  </div>
                )}
                {vehicle.registration_date && (
                  <div>
                    <h4 className="font-bold text-support mb-0.5">First Registration</h4>
                    <p className="text-sm text-muted">{new Date(vehicle.registration_date).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bottom trust cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { title: 'Quality Assured',  body: 'All vehicles undergo comprehensive inspection before sale.' },
            { title: 'Trade-In Welcome', body: 'Get the best value for your current vehicle with our trade-in program.' },
            { title: 'Warranty Options', body: 'Extended warranty packages available for peace of mind.' },
          ].map(({ title, body }) => (
            <div key={title} className="rounded-2xl bg-support text-white p-6 border border-support">
              <h3 className="text-lg font-display text-primary mb-2">{title}</h3>
              <p className="text-gray-400 text-sm">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}