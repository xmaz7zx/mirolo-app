'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading'
import PhotoGallery from '@/components/photo/photo-gallery'
import { 
  Image as ImageIcon, 
  Trash2, 
  Download, 
  Star, 
  Calendar,
  HardDrive,
  Filter,
  Grid,
  List,
  Search
} from 'lucide-react'
import { getUserStorageUsage, getRecipePhotos, deleteRecipePhoto } from '@/lib/photos'
import { formatFileSize } from '@/lib/image-utils'
import { useUserRecipes } from '@/hooks/useRecipes'
import type { RecipePhoto } from '@/types'

interface PhotoWithRecipe extends RecipePhoto {
  recipe_title?: string
  file_name?: string | null
  file_size?: number | null
}

export default function PhotosPage() {
  const [photos, setPhotos] = useState<PhotoWithRecipe[]>([])
  const [loading, setLoading] = useState(true)
  const [storageInfo, setStorageInfo] = useState({ used: 0, limit: 0, photos: 0 })
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null)
  const [filter, setFilter] = useState<'all' | 'main' | 'step' | 'result'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')

  const { data: recipes } = useUserRecipes()

  useEffect(() => {
    const loadPhotosAndStorage = async () => {
      setLoading(true)
      try {
        // Load storage info
        const storage = await getUserStorageUsage()
        setStorageInfo(storage)

        // Load all photos from user recipes
        if (recipes) {
          const allPhotos: PhotoWithRecipe[] = []
          
          for (const recipe of recipes) {
            const recipePhotos = await getRecipePhotos(recipe.id)
            const photosWithRecipe = recipePhotos.map(photo => ({
              ...photo,
              recipe_title: recipe.title
            }))
            allPhotos.push(...photosWithRecipe)
          }

          // Sort by upload date (newest first)
          allPhotos.sort((a, b) => 
            new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime()
          )

          setPhotos(allPhotos)
        }
      } catch (error) {
        console.error('Failed to load photos:', error)
      } finally {
        setLoading(false)
      }
    }

    if (recipes) {
      loadPhotosAndStorage()
    }
  }, [recipes])

  const handleDeletePhoto = async (photoId: string) => {
    try {
      await deleteRecipePhoto(photoId)
      setPhotos(prev => prev.filter(photo => photo.id !== photoId))
      
      // Update storage info
      const storage = await getUserStorageUsage()
      setStorageInfo(storage)
    } catch (error) {
      console.error('Failed to delete photo:', error)
    }
  }

  const filteredPhotos = photos.filter(photo => {
    const matchesFilter = filter === 'all' || photo.photo_type === filter
    const matchesSearch = !searchQuery || 
      photo.recipe_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.file_name?.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  const getPhotoTypeLabel = (type: string | null) => {
    switch (type) {
      case 'main': return 'Hauptfoto'
      case 'step': return 'Schritt'
      case 'result': return 'Ergebnis'
      default: return 'Foto'
    }
  }

  const storagePercentage = (storageInfo.used / storageInfo.limit) * 100

  return (
    <MainLayout
      headerProps={{
        title: 'Meine Fotos',
        showBack: true,
      }}
    >
      <div className="space-y-6">
        {/* Storage Usage */}
        <div className="card-mirolo">
          <div className="flex items-center gap-3 mb-4">
            <HardDrive size={20} className="text-primary" />
            <div>
              <h2 className="font-semibold text-foreground">Speicherplatz</h2>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(storageInfo.used)} von {formatFileSize(storageInfo.limit)} verwendet
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="w-full bg-muted rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${
                  storagePercentage > 90 
                    ? 'bg-destructive' 
                    : storagePercentage > 70 
                    ? 'bg-orange-500' 
                    : 'bg-primary'
                }`}
                style={{ width: `${Math.min(storagePercentage, 100)}%` }}
              />
            </div>
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{storageInfo.photos} Fotos</span>
              <span>{Math.round(storagePercentage)}% verwendet</span>
            </div>

            {storagePercentage > 80 && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800">
                  <strong>Speicherplatz wird knapp!</strong> 
                  Lösche nicht benötigte Fotos, um Platz zu schaffen.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Fotos durchsuchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
          >
            <option value="all">Alle Typen</option>
            <option value="main">Hauptfotos</option>
            <option value="step">Schritt-Fotos</option>
            <option value="result">Ergebnis-Fotos</option>
          </select>

          {/* View Mode */}
          <div className="flex gap-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid size={16} />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List size={16} />
            </Button>
          </div>
        </div>

        {/* Photos */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredPhotos.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <ImageIcon size={24} className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Keine Fotos gefunden
            </h3>
            <p className="text-muted-foreground">
              {searchQuery || filter !== 'all'
                ? 'Keine Fotos entsprechen den Filterkriterien.'
                : 'Du hast noch keine Fotos zu deinen Rezepten hinzugefügt.'
              }
            </p>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-foreground">
                {filteredPhotos.length} {filteredPhotos.length === 1 ? 'Foto' : 'Fotos'}
              </h3>
            </div>

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredPhotos.map((photo, index) => (
                  <div key={photo.id} className="relative group">
                    <div 
                      className="aspect-square cursor-pointer"
                      onClick={() => setSelectedPhoto(index)}
                    >
                      <img
                        src={photo.photo_url}
                        alt={`Photo from ${photo.recipe_title}`}
                        className="w-full h-full object-cover rounded-lg border border-border"
                      />
                    </div>

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedPhoto(index)
                        }}
                      >
                        <ImageIcon size={14} />
                      </Button>
                      
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

                    {/* Info */}
                    <div className="absolute top-2 left-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        photo.photo_type === 'main' 
                          ? 'bg-primary text-primary-foreground'
                          : photo.photo_type === 'step'
                          ? 'bg-blue-500 text-white'
                          : 'bg-green-500 text-white'
                      }`}>
                        {getPhotoTypeLabel(photo.photo_type)}
                      </span>
                    </div>

                    <div className="mt-2">
                      <p className="text-sm font-medium text-foreground truncate">
                        {photo.recipe_title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(photo.uploaded_at).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPhotos.map((photo, index) => (
                  <div key={photo.id} className="flex items-center gap-4 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                    <img
                      src={photo.photo_url}
                      alt={`Photo from ${photo.recipe_title}`}
                      className="w-16 h-16 object-cover rounded cursor-pointer"
                      onClick={() => setSelectedPhoto(index)}
                    />

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">
                          {photo.recipe_title}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          photo.photo_type === 'main' 
                            ? 'bg-primary/20 text-primary'
                            : photo.photo_type === 'step'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {getPhotoTypeLabel(photo.photo_type)}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <span>
                          {new Date(photo.uploaded_at).toLocaleDateString('de-DE')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedPhoto(index)}
                      >
                        <ImageIcon size={14} />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Photo Gallery Modal */}
        {selectedPhoto !== null && (
          <PhotoGallery
            photos={filteredPhotos}
            initialIndex={selectedPhoto}
            onClose={() => setSelectedPhoto(null)}
          />
        )}
      </div>
    </MainLayout>
  )
}