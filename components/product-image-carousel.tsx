"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface ProductImageCarouselProps {
  images: string[]
  productName: string
  className?: string
}

export function ProductImageCarousel({ images, productName, className }: ProductImageCarouselProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // If there's only one image, don't show carousel functionality
  if (images.length <= 1) {
    return (
      <div className={cn("relative aspect-[4/3] bg-white overflow-hidden", className)}>
        <Image
          src={images[0] || "/placeholder.svg"}
          alt={productName}
          fill
          className="object-contain transition-transform duration-300 group-hover:scale-[1.01]"
        />
      </div>
    )
  }

  const handleDotClick = (index: number) => {
    setCurrentImageIndex(index)
  }

  const handleImageClick = () => {
    // Cycle to next image on click
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  return (
    <div className={cn("relative aspect-[4/3] bg-white overflow-hidden", className)}>
      {/* Current Image */}
      <div 
        className="cursor-pointer w-full h-full"
        onClick={handleImageClick}
      >
        <Image
          src={images[currentImageIndex] || "/placeholder.svg"}
          alt={`${productName} - صورة ${currentImageIndex + 1}`}
          fill
          className="object-contain transition-transform duration-300 group-hover:scale-[1.01]"
        />
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1.5 z-10">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation()
              handleDotClick(index)
            }}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-200 border border-white/50",
              currentImageIndex === index
                ? "bg-white shadow-md scale-110"
                : "bg-white/60 hover:bg-white/80"
            )}
            aria-label={`عرض الصورة ${index + 1}`}
          />
        ))}
      </div>

      {/* Image Counter (optional, for accessibility) */}
      {images.length > 1 && (
        <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
          {currentImageIndex + 1}/{images.length}
        </div>
      )}
    </div>
  )
}