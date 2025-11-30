"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BannerCarouselProps {
  banners: string[]
  autoRotate?: boolean
  rotationInterval?: number
  className?: string
}

export default function BannerCarousel({
  banners,
  autoRotate = true,
  rotationInterval = 2000,
  className = ""
}: BannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Auto-rotation effect
  useEffect(() => {
    if (!autoRotate || isPaused || banners.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, rotationInterval)

    return () => clearInterval(interval)
  }, [autoRotate, isPaused, banners.length, rotationInterval])

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  if (banners.length === 0) return null

  if (banners.length === 1) {
    return (
      <div className={`relative w-full ${className}`}>
        <Image
          src={banners[0]}
          alt="Banner"
          fill
          className="object-cover"
          priority
        />
      </div>
    )
  }

  return (
    <div 
      className={`relative w-full ${className} group`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Banner Images */}
      <div className="relative w-full h-full overflow-hidden">
        {banners.map((banner, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={banner}
              alt={`Banner ${index + 1}`}
              fill
              className="object-cover"
              priority={index === 0}
            />
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        className={`absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm transition-all duration-300 h-12 w-12 rounded-full border-2 border-white/30 flex items-center justify-center z-10 ${
          autoRotate ? 'opacity-0 group-hover:opacity-100' : 'opacity-80 hover:opacity-100 hover:scale-110'
        }`}
        onClick={goToPrevious}
        type="button"
      >
        <ChevronLeft className="h-7 w-7" />
      </button>
      <button
        className={`absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm transition-all duration-300 h-12 w-12 rounded-full border-2 border-white/30 flex items-center justify-center z-10 ${
          autoRotate ? 'opacity-0 group-hover:opacity-100' : 'opacity-80 hover:opacity-100 hover:scale-110'
        }`}
        onClick={goToNext}
        type="button"
      >
        <ChevronRight className="h-7 w-7" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex
                ? "bg-white w-8"
                : "bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
