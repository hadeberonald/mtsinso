'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'

interface CarouselSlide {
  id: string
  title: string
  subtitle: string
  image_url: string
  order_index: number
}

interface HeroCarouselProps {
  slides: CarouselSlide[]
}

const DEFAULT_SLIDES = [
  {
    id: 'default-1',
    title: 'Drive Home in Your Dream Vehicle',
    subtitle: 'Trusted dealership with a curated selection of quality vehicles. Flexible finance. Honest service.',
    image_url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=900&q=80',
    order_index: 0,
  },
  {
    id: 'default-2',
    title: 'Finance Made Simple',
    subtitle: 'Get pre-approved in minutes. We work with top lenders to find terms that fit your budget.',
    image_url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=900&q=80',
    order_index: 1,
  },
  {
    id: 'default-3',
    title: 'Every Vehicle Inspected',
    subtitle: 'We only stock vehicles we are proud to put our name on. Quality you can trust.',
    image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900&q=80',
    order_index: 2,
  },
]

export default function HeroCarousel({ slides }: HeroCarouselProps) {
  const items = slides.length > 0 ? slides : DEFAULT_SLIDES
  const [current, setCurrent] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [direction, setDirection] = useState<'next' | 'prev'>('next')

  const go = useCallback((idx: number, dir: 'next' | 'prev') => {
    if (animating) return
    setAnimating(true)
    setDirection(dir)
    setCurrent(idx)
    setTimeout(() => setAnimating(false), 600)
  }, [animating])

  const next = useCallback(() => go((current + 1) % items.length, 'next'), [current, items.length, go])
  const prev = useCallback(() => go((current - 1 + items.length) % items.length, 'prev'), [current, items.length, go])

  useEffect(() => {
    const t = setInterval(next, 7000)
    return () => clearInterval(t)
  }, [next])

  const slide = items[current]

  return (
    <section className="pt-2 bg-gray-50 min-h-[92vh] flex items-center overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full py-10 md:py-16">

        {/* Split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">

          {/* Image — top on mobile, left on desktop */}
          <div className="relative order-1 lg:order-2">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl shadow-support/20">
              {items.map((s, i) => (
                <div
                  key={s.id}
                  className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                    i === current ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                  }`}
                >
                  <Image
                    src={s.image_url}
                    alt={s.title}
                    fill
                    className="object-cover"
                    priority={i === 0}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              ))}

              {/* Subtle overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-support/30 to-transparent pointer-events-none rounded-3xl" />

              {/* Slide counter pill */}
              <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm text-support text-xs font-bold px-3 py-1.5 rounded-full">
                {current + 1} / {items.length}
              </div>
            </div>

            {/* Decorative blob behind image */}
            <div className="absolute -inset-4 -z-10 rounded-3xl bg-primary/8 blur-2xl" />
          </div>

          {/* Text content — bottom on mobile, right on desktop */}
          <div className="order-2 lg:order-1 flex flex-col">

            {/* Tag */}
            <div className="section-tag">
              <span className="w-5 h-px bg-primary inline-block" />
              Mtsinso Car Sales
            </div>

            {/* Title */}
            <div className="relative overflow-hidden mb-5">
              {items.map((s, i) => (
                <h1
                  key={s.id}
                  className={`font-display text-4xl sm:text-5xl lg:text-[3.25rem] leading-[1.1] text-support transition-all duration-600 ${
                    i === current
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 absolute top-0 left-0 translate-y-4'
                  }`}
                >
                  {s.title}
                </h1>
              ))}
              {/* Spacer so container doesn't collapse */}
              <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.25rem] leading-[1.1] opacity-0 pointer-events-none select-none" aria-hidden>
                {slide.title}
              </h1>
            </div>

            {/* Subtitle */}
            <div className="relative overflow-hidden mb-8 min-h-[3.5rem]">
              {items.map((s, i) => (
                <p
                  key={s.id}
                  className={`text-muted text-base sm:text-lg leading-relaxed max-w-lg transition-all duration-600 delay-75 ${
                    i === current
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 absolute top-0 left-0 translate-y-3'
                  }`}
                >
                  {s.subtitle}
                </p>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 mb-10">
              <Link href="/vehicles" className="btn-primary gap-2">
                Browse Vehicles
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/finance/apply" className="btn-outline">
                Get Pre-Approved
              </Link>
            </div>

            {/* Navigation controls */}
            <div className="flex items-center gap-4">
              <button
                onClick={prev}
                className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-muted hover:border-primary hover:text-primary transition-all duration-200"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={next}
                className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-muted hover:border-primary hover:text-primary transition-all duration-200"
                aria-label="Next slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Dot indicators */}
              <div className="flex gap-2 ml-2">
                {items.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => go(i, i > current ? 'next' : 'prev')}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === current ? 'bg-primary w-8' : 'bg-gray-300 w-2 hover:bg-muted'
                    }`}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}