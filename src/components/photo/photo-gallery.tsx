'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Heart,
  Share2,
  MoreVertical,
  ZoomIn,
  ZoomOut
} from 'lucide-react'
import type { RecipePhoto } from '@/types'

interface PhotoGalleryProps {
  photos: RecipePhoto[]
  initialIndex?: number
  onClose: () => void
  className?: string
}

export default function PhotoGallery({
  photos,
  initialIndex = 0,
  onClose,
  className
}: PhotoGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isZoomed, setIsZoomed] = useState(false)

  const currentPhoto = photos[currentIndex]

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1))
    setIsZoomed(false)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0))
    setIsZoomed(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        onClose()
        break
      case 'ArrowLeft':
        goToPrevious()
        break
      case 'ArrowRight':
        goToNext()
        break
    }
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(currentPhoto.photo_url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `recipe-photo-${currentIndex + 1}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Rezept Foto',
          text: 'Schau dir dieses leckere Rezept an!',
          url: currentPhoto.photo_url
        })
      } catch (error) {
        console.error('Sharing failed:', error)
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(currentPhoto.photo_url)
        // Could show a toast here
      } catch (error) {
        console.error('Copy failed:', error)
      }
    }
  }

  const getPhotoTypeLabel = (type: string) => {
    switch (type) {
      case 'main': return 'Hauptfoto'
      case 'step': return 'Schritt-Foto'
      case 'result': return 'Ergebnis-Foto'
      default: return 'Foto'
    }
  }

  return (
    <div 
      className={`fixed inset-0 z-50 bg-black/90 flex items-center justify-center ${className || ''}`}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center gap-3 text-white">
          <span className="text-sm font-medium">
            {getPhotoTypeLabel(currentPhoto.photo_type)}
          </span>
          <span className="text-sm text-white/70">
            {currentIndex + 1} von {photos.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsZoomed(!isZoomed)}
            className="text-white hover:bg-white/20"
          >
            {isZoomed ? <ZoomOut size={16} /> : <ZoomIn size={16} />}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="text-white hover:bg-white/20"
          >
            <Download size={16} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="text-white hover:bg-white/20"
          >
            <Share2 size={16} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
          >
            <MoreVertical size={16} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X size={20} />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      {photos.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="lg"
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:bg-white/20 w-12 h-12 p-0"
          >
            <ChevronLeft size={24} />
          </Button>

          <Button
            variant="ghost"
            size="lg"
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:bg-white/20 w-12 h-12 p-0"
          >
            <ChevronRight size={24} />
          </Button>
        </>
      )}

      {/* Main Image */}
      <div 
        className="relative max-w-full max-h-full flex items-center justify-center cursor-pointer"
        onClick={() => setIsZoomed(!isZoomed)}
      >
        <img
          src={currentPhoto.photo_url}
          alt={getPhotoTypeLabel(currentPhoto.photo_type)}
          className={`max-w-full max-h-full object-contain transition-transform duration-300 ${
            isZoomed ? 'scale-150' : 'scale-100'
          }`}
          draggable={false}
        />
      </div>

      {/* Thumbnail Strip */}
      {photos.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
          <div className="flex justify-center gap-2 overflow-x-auto max-w-full">
            {photos.map((photo, index) => (
              <button
                key={photo.id}
                onClick={() => {
                  setCurrentIndex(index)
                  setIsZoomed(false)
                }}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentIndex 
                    ? 'border-white scale-110' 
                    : 'border-white/30 hover:border-white/70'
                }`}
              >
                <img
                  src={photo.photo_url}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      <div 
        className="absolute inset-0 -z-10"
        onClick={onClose}
      />
    </div>
  )
}