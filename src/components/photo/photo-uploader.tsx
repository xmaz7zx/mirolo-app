'use client'

import { useState, useCallback, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading'
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  AlertCircle,
  Camera,
  Plus
} from 'lucide-react'
import { uploadRecipePhoto, deleteRecipePhoto } from '@/lib/photos'
import { compressImage } from '@/lib/image-utils'
import type { PhotoType } from '@/types'

interface PhotoUploaderProps {
  recipeId: string
  photoType: PhotoType
  existingPhotos?: Array<{
    id: string
    photo_url: string
    photo_type: PhotoType
  }>
  onPhotosChange: (photos: Array<{
    id: string
    photo_url: string
    photo_type: PhotoType
  }>) => void
  maxPhotos?: number
  className?: string
}

export default function PhotoUploader({
  recipeId,
  photoType,
  existingPhotos = [],
  onPhotosChange,
  maxPhotos = photoType === 'main' ? 1 : 10,
  className
}: PhotoUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const canUploadMore = existingPhotos.length < maxPhotos

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!canUploadMore) return

    setUploading(true)
    setError(null)

    try {
      const filesToUpload = acceptedFiles.slice(0, maxPhotos - existingPhotos.length)
      const uploadedPhotos = []

      for (const file of filesToUpload) {
        // Compress image before upload
        const compressedFile = await compressImage(file, {
          maxWidth: photoType === 'main' ? 1200 : 800,
          maxHeight: photoType === 'main' ? 800 : 600,
          quality: 0.8
        })

        // Upload to Supabase Storage
        const photo = await uploadRecipePhoto(recipeId, compressedFile, photoType)
        uploadedPhotos.push(photo)
      }

      onPhotosChange([...existingPhotos, ...uploadedPhotos])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload fehlgeschlagen')
    } finally {
      setUploading(false)
    }
  }, [recipeId, photoType, existingPhotos, maxPhotos, canUploadMore, onPhotosChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: maxPhotos - existingPhotos.length,
    disabled: uploading || !canUploadMore
  })

  const handleDelete = async (photoId: string) => {
    try {
      await deleteRecipePhoto(photoId)
      onPhotosChange(existingPhotos.filter(p => p.id !== photoId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Löschen fehlgeschlagen')
    }
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const getPhotoTypeLabel = (type: PhotoType) => {
    switch (type) {
      case 'main': return 'Hauptfoto'
      case 'step': return 'Schritt-Foto'
      case 'result': return 'Ergebnis-Foto'
      default: return 'Foto'
    }
  }

  return (
    <div className={`space-y-4 ${className || ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-foreground">
          {getPhotoTypeLabel(photoType)}
          {photoType === 'main' && ' (empfohlen)'}
        </h3>
        <span className="text-sm text-muted-foreground">
          {existingPhotos.length}/{maxPhotos}
        </span>
      </div>

      {/* Existing Photos */}
      {existingPhotos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {existingPhotos.map((photo, index) => (
            <div key={photo.id} className="relative group aspect-square">
              <img
                src={photo.photo_url}
                alt={`${getPhotoTypeLabel(photoType)} ${index + 1}`}
                className="w-full h-full object-cover rounded-lg border border-border"
              />
              
              {/* Delete Button */}
              <button
                onClick={() => handleDelete(photo.id)}
                className="absolute top-2 right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>

              {/* Main Photo Badge */}
              {photoType === 'main' && (
                <div className="absolute bottom-2 left-2">
                  <span className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-medium">
                    Hauptfoto
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {canUploadMore && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
            isDragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-primary/50 hover:bg-muted/50'
          } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
        >
          <input {...getInputProps()} />
          <input
            ref={fileInputRef}
            type="file"
            multiple={maxPhotos > 1}
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files || [])
              if (files.length > 0) {
                onDrop(files)
              }
            }}
          />

          {uploading ? (
            <div className="space-y-3">
              <LoadingSpinner size="lg" />
              <p className="text-sm text-muted-foreground">
                Foto wird hochgeladen...
              </p>
            </div>
          ) : isDragActive ? (
            <div className="space-y-3">
              <Upload size={32} className="mx-auto text-primary" />
              <p className="text-primary font-medium">
                Fotos hier ablegen
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto">
                <ImageIcon size={20} className="text-muted-foreground" />
              </div>
              
              <div className="space-y-1">
                <p className="font-medium text-foreground">
                  {existingPhotos.length === 0 
                    ? `${getPhotoTypeLabel(photoType)} hinzufügen`
                    : 'Weitere Fotos hinzufügen'
                  }
                </p>
                <p className="text-sm text-muted-foreground">
                  Drag & Drop oder klicken zum Auswählen
                </p>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG oder WebP • Max. 10 MB pro Foto
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleFileSelect}
                  className="h-9"
                >
                  <Plus size={14} className="mr-2" />
                  Dateien wählen
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9"
                  onClick={() => {
                    // Mobile camera access
                    if (fileInputRef.current) {
                      fileInputRef.current.setAttribute('capture', 'environment')
                      fileInputRef.current.click()
                    }
                  }}
                >
                  <Camera size={14} className="mr-2" />
                  Kamera
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle size={16} className="text-destructive flex-shrink-0" />
          <span className="text-sm text-destructive">{error}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setError(null)}
            className="ml-auto h-6 w-6 p-0"
          >
            <X size={12} />
          </Button>
        </div>
      )}

      {/* Upload Tips */}
      {photoType === 'main' && existingPhotos.length === 0 && (
        <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
          <p className="text-sm text-primary">
            <strong>Tipp:</strong> Ein gutes Hauptfoto macht dein Rezept attraktiver! 
            Wähle ein Foto mit gutem Licht, das das fertige Gericht zeigt.
          </p>
        </div>
      )}

      {!canUploadMore && (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">
            Maximale Anzahl von {maxPhotos} {maxPhotos === 1 ? 'Foto' : 'Fotos'} erreicht
          </p>
        </div>
      )}
    </div>
  )
}