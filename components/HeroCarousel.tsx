'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'


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

export default function HeroCarousel({ slides }: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (slides.length === 0) return

    const timer = setInterval(() => {
      nextSlide()
    }, 6000)

    return () => clearInterval(timer)
  }, [currentSlide, slides.length])

  const nextSlide = () => {
    if (isAnimating || slides.length === 0) return
    setIsAnimating(true)
    setCurrentSlide((prev) => (prev + 1) % slides.length)
    setTimeout(() => setIsAnimating(false), 500)
  }

  const prevSlide = () => {
    if (isAnimating || slides.length === 0) return
    setIsAnimating(true)
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    setTimeout(() => setIsAnimating(false), 500)
  }

  if (slides.length === 0) {
    return (
      <section className="relative h-[600px] bg-black overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-6">
            <h1 className="text-5xl md:text-7xl font-display mb-6">
              Welcome to <span className="text-gold">IC Cars</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
              Your trusted dealership in Pretoria. Browse our extensive collection of quality vehicles.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative h-[600px] bg-black overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-all duration-700 ${
            index === currentSlide
              ? 'opacity-100 translate-x-0'
              : index < currentSlide
              ? 'opacity-0 -translate-x-full'
              : 'opacity-0 translate-x-full'
          }`}
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src={slide.image_url}
              alt={slide.title}
              fill
              className="object-cover"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative h-full flex items-center">
            <div className="max-w-7xl mx-auto px-6 w-full">
              <div className="max-w-2xl">
                <h1 className="text-5xl md:text-7xl font-display text-white mb-6 leading-tight">
                  {slide.title}
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 mb-8">
                  {slide.subtitle}
                </p>
                <button className="btn-hollow btn-hollow-gold text-lg">
                  Explore Collection
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

    

      {/* Slide Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (!isAnimating) {
                  setIsAnimating(true)
                  setCurrentSlide(index)
                  setTimeout(() => setIsAnimating(false), 500)
                }
              }}
              className={`h-1 transition-all duration-300 ${
                index === currentSlide ? 'w-12 bg-gold' : 'w-8 bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
