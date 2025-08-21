'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  placeholder?: string
  quality?: number
  sizes?: string
  priority?: boolean
  onLoad?: () => void
  onError?: () => void
}

export function LazyImage({
  src,
  alt,
  className,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmNmY3ZjgiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNlNGU2ZTciLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cpIi8+PC9zdmc+',
  quality = 75,
  sizes,
  priority = false,
  onLoad,
  onError
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(priority)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) return // Skip lazy loading for priority images

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observerRef.current?.disconnect()
        }
      },
      {
        rootMargin: '50px' // Start loading 50px before the image comes into view
      }
    )

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current)
    }

    return () => {
      observerRef.current?.disconnect()
    }
  }, [priority])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    onError?.()
  }

  // Generate optimized image URL (if using a service like Vercel or Cloudinary)
  const getOptimizedSrc = (originalSrc: string) => {
    // If it's already a data URL or external URL, return as is
    if (originalSrc.startsWith('data:') || originalSrc.startsWith('http')) {
      return originalSrc
    }

    // For local images, you could add optimization parameters here
    // For example, with Vercel Image Optimization:
    // return `/_next/image?url=${encodeURIComponent(originalSrc)}&w=800&q=${quality}`
    
    return originalSrc
  }

  if (hasError) {
    return (
      <div 
        ref={imgRef}
        className={cn(
          'flex items-center justify-center bg-muted text-muted-foreground',
          className
        )}
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
      </div>
    )
  }

  return (
    <div ref={imgRef} className={cn('relative overflow-hidden', className)}>
      {/* Placeholder */}
      <img
        src={placeholder}
        alt=""
        className={cn(
          'absolute inset-0 w-full h-full object-cover transition-opacity duration-300',
          isLoaded ? 'opacity-0' : 'opacity-100'
        )}
        aria-hidden="true"
      />
      
      {/* Actual image */}
      {isInView && (
        <img
          src={getOptimizedSrc(src)}
          alt={alt}
          sizes={sizes}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
      )}

      {/* Loading indicator */}
      {isInView && !isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}

// Hook for preloading images
export function useImagePreloader() {
  const preloadedImages = useRef(new Set<string>())

  const preloadImage = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (preloadedImages.current.has(src)) {
        resolve()
        return
      }

      const img = new Image()
      img.onload = () => {
        preloadedImages.current.add(src)
        resolve()
      }
      img.onerror = reject
      img.src = src
    })
  }

  const preloadImages = async (srcs: string[]) => {
    try {
      await Promise.all(srcs.map(preloadImage))
    } catch (error) {
      console.warn('Some images failed to preload:', error)
    }
  }

  return { preloadImage, preloadImages }
}