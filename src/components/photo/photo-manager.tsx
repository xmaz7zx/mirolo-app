'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import PhotoUploader from './photo-uploader'
import PhotoGallery from './photo-gallery'
import { 
  Image as ImageIcon, 
  Eye, 
  Star, 
  Move, 
  Trash2,
  Download,
  Grid,
  List
} from 'lucide-react'
import { getRecipePhotos, setMainPhoto, deleteRecipePhoto } from '@/lib/photos'
import { formatFileSize } from '@/lib/image-utils'
import type { RecipePhoto, PhotoType } from '@/types'

interface PhotoManagerProps {
  recipeId: string
  canEdit?: boolean
  initialPhotos?: RecipePhoto[]
  className?: string
}

export default function PhotoManager({
  recipeId,
  canEdit = false,
  initialPhotos = [],
  className
}: PhotoManagerProps) {
  const [photos, setPhotos] = useState<RecipePhoto[]>(initialPhotos)
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null)
  const [draggedItem, setDraggedItem] = useState<number | null>(null)

  // Load photos
  useEffect(() => {
    const loadPhotos = async () => {
      if (initialPhotos.length > 0) return
      
      setLoading(true)
      try {
        const fetchedPhotos = await getRecipePhotos(recipeId)
        setPhotos(fetchedPhotos)
      } catch (error) {
        console.error('Failed to load photos:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPhotos()
  }, [recipeId, initialPhotos.length])

  const handlePhotosChange = (newPhotos: Array<{
    id: string
    photo_url: string
    photo_type: PhotoType
  }>) => {
    // Convert to full photo objects
    const fullPhotos = newPhotos.map(photo => ({
      ...photo,
      recipe_id: recipeId,
      file_size: null,
      file_name: null,
      storage_path: '',
      uploaded_at: new Date().toISOString(),
      uploaded_by: '',
      photo_order: photos.length
    }))
    setPhotos(fullPhotos)
  }

  const handleSetMainPhoto = async (photoId: string) => {
    try {
      await setMainPhoto(recipeId, photoId)
      // Update local state
      setPhotos(prev => prev.map(photo => ({
        ...photo,
        photo_type: photo.id === photoId ? 'main' : 'result'
      })))
    } catch (error) {
      console.error('Failed to set main photo:', error)
    }
  }

  const handleDeletePhoto = async (photoId: string) => {
    try {
      await deleteRecipePhoto(photoId)
      setPhotos(prev => prev.filter(photo => photo.id !== photoId))
    } catch (error) {
      console.error('Failed to delete photo:', error)
    }
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItem(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    
    if (draggedItem === null) return

    const newPhotos = [...photos]
    const draggedPhoto = newPhotos[draggedItem]
    newPhotos.splice(draggedItem, 1)
    newPhotos.splice(dropIndex, 0, draggedPhoto)
    
    setPhotos(newPhotos)
    setDraggedItem(null)
  }

  const mainPhotos = photos.filter(photo => photo.photo_type === 'main')
  const stepPhotos = photos.filter(photo => photo.photo_type === 'step')
  const resultPhotos = photos.filter(photo => photo.photo_type === 'result')

  if (loading) {
    return (
      <div className={`space-y-4 ${className || ''}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-32" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImageIcon size={20} className="text-primary" />
          <h2 className="text-xl font-semibold text-foreground">
            Fotos
          </h2>
          {photos.length > 0 && (
            <span className="text-sm text-muted-foreground">
              ({photos.length})
            </span>
          )}
        </div>

        {photos.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              {viewMode === 'grid' ? <List size={16} /> : <Grid size={16} />}
            </Button>
          </div>
        )}
      </div>

      {/* Photo Uploaders */}
      {canEdit && (
        <div className="space-y-6">
          {/* Main Photo Uploader */}
          <PhotoUploader
            recipeId={recipeId}
            photoType="main"
            existingPhotos={mainPhotos.map(p => ({
              id: p.id,
              photo_url: p.photo_url,
              photo_type: p.photo_type
            }))}
            onPhotosChange={handlePhotosChange}
            maxPhotos={1}
          />

          {/* Step Photos Uploader */}
          <PhotoUploader
            recipeId={recipeId}
            photoType="step"
            existingPhotos={stepPhotos.map(p => ({
              id: p.id,
              photo_url: p.photo_url,
              photo_type: p.photo_type
            }))}
            onPhotosChange={handlePhotosChange}
            maxPhotos={10}
          />

          {/* Result Photos Uploader */}
          <PhotoUploader
            recipeId={recipeId}
            photoType="result"
            existingPhotos={resultPhotos.map(p => ({
              id: p.id,
              photo_url: p.photo_url,
              photo_type: p.photo_type
            }))}
            onPhotosChange={handlePhotosChange}
            maxPhotos={5}
          />
        </div>
      )}

      {/* Photo Display */}
      {photos.length > 0 && (
        <div className="space-y-4">
          <div className="border-t border-border pt-4">
            <h3 className="font-medium text-foreground mb-3">
              Alle Fotos
            </h3>

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo, index) => (
                  <div
                    key={photo.id}
                    draggable={canEdit}
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    className="relative group aspect-square cursor-pointer"
                  >
                    <img
                      src={photo.photo_url}
                      alt={`Recipe photo ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg border border-border"
                      onClick={() => setSelectedPhoto(index)}
                    />

                    {/* Photo Type Badge */}
                    <div className="absolute top-2 left-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        photo.photo_type === 'main' 
                          ? 'bg-primary text-primary-foreground'
                          : photo.photo_type === 'step'
                          ? 'bg-blue-500 text-white'
                          : 'bg-green-500 text-white'
                      }`}>
                        {photo.photo_type === 'main' && '⭐'}
                        {photo.photo_type === 'step' && '📋'}
                        {photo.photo_type === 'result' && '🍽️'}
                      </span>
                    </div>

                    {/* Actions Overlay */}
                    {canEdit && (
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedPhoto(index)
                          }}
                        >
                          <Eye size={14} />
                        </Button>

                        {photo.photo_type !== 'main' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSetMainPhoto(photo.id)
                            }}
                          >
                            <Star size={14} />
                          </Button>
                        )}

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeletePhoto(photo.id)
                          }}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {photos.map((photo, index) => (
                  <div
                    key={photo.id}
                    className="flex items-center gap-4 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <img
                      src={photo.photo_url}
                      alt={`Recipe photo ${index + 1}`}
                      className="w-16 h-16 object-cover rounded cursor-pointer"
                      onClick={() => setSelectedPhoto(index)}
                    />

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">
                          {photo.photo_type === 'main' && 'Hauptfoto'}
                          {photo.photo_type === 'step' && 'Schritt-Foto'}
                          {photo.photo_type === 'result' && 'Ergebnis-Foto'}
                        </span>
                        {photo.photo_type === 'main' && (
                          <Star size={14} className="text-primary fill-current" />
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {photo.file_size && formatFileSize(photo.file_size)}
                        {photo.uploaded_at && (
                          <span className="ml-2">
                            {new Date(photo.uploaded_at).toLocaleDateString('de-DE')}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedPhoto(index)}
                      >
                        <Eye size={14} />
                      </Button>

                      {canEdit && photo.photo_type !== 'main' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSetMainPhoto(photo.id)}
                        >
                          <Star size={14} />
                        </Button>
                      )}

                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePhoto(photo.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Photo Gallery Modal */}
      {selectedPhoto !== null && (
        <PhotoGallery
          photos={photos}
          initialIndex={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
        />
      )}

      {/* Empty State */}
      {photos.length === 0 && !canEdit && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <ImageIcon size={24} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Keine Fotos vorhanden
          </h3>
          <p className="text-muted-foreground">
            Zu diesem Rezept wurden noch keine Fotos hinzugefügt.
          </p>
        </div>
      )}
    </div>
  )
}