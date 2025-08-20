import { supabase } from '@/lib/supabase'
import { SUPPORTED_IMAGE_TYPES, LIMITS } from '@/lib/constants'

export class StorageError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'StorageError'
  }
}

export const uploadRecipePhoto = async (
  file: File,
  recipeId: string,
  photoType: 'main' | 'step' | 'result' = 'main',
  stepNumber?: number
): Promise<string> => {
  // Validate file
  if (!SUPPORTED_IMAGE_TYPES.includes(file.type as any)) {
    throw new StorageError('Unsupported file type. Please use JPG, PNG or WebP.')
  }

  if (file.size > LIMITS.PHOTO_MAX_SIZE) {
    throw new StorageError(`File too large. Maximum size is ${LIMITS.PHOTO_MAX_SIZE / (1024 * 1024)}MB.`)
  }

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new StorageError('Authentication required')
  }

  // Generate unique filename
  const fileExtension = file.name.split('.').pop()
  const timestamp = Date.now()
  const suffix = stepNumber ? `step-${stepNumber}` : photoType
  const fileName = `${recipeId}/${suffix}-${timestamp}.${fileExtension}`
  const filePath = `${user.id}/${fileName}`

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('recipe-photos')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) {
    throw new StorageError(`Upload failed: ${uploadError.message}`, uploadError.message)
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('recipe-photos')
    .getPublicUrl(filePath)

  // Save photo record to database
  const { error: dbError } = await supabase
    .from('recipe_photos')
    .insert({
      recipe_id: recipeId,
      photo_url: publicUrl,
      photo_type: photoType,
      step_number: stepNumber,
    })

  if (dbError) {
    // Cleanup uploaded file if database insert fails
    await supabase.storage
      .from('recipe-photos')
      .remove([filePath])
    
    throw new StorageError(`Failed to save photo record: ${dbError.message}`)
  }

  return publicUrl
}

export const deleteRecipePhoto = async (photoUrl: string): Promise<void> => {
  // Extract file path from URL
  const url = new URL(photoUrl)
  const pathParts = url.pathname.split('/')
  const filePath = pathParts.slice(pathParts.indexOf('recipe-photos') + 1).join('/')

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from('recipe-photos')
    .remove([filePath])

  if (storageError) {
    throw new StorageError(`Failed to delete photo: ${storageError.message}`)
  }

  // Delete from database
  const { error: dbError } = await supabase
    .from('recipe_photos')
    .delete()
    .eq('photo_url', photoUrl)

  if (dbError) {
    throw new StorageError(`Failed to delete photo record: ${dbError.message}`)
  }
}

export const getRecipePhotos = async (recipeId: string) => {
  const { data, error } = await supabase
    .from('recipe_photos')
    .select('*')
    .eq('recipe_id', recipeId)
    .order('uploaded_at', { ascending: false })

  if (error) {
    throw new StorageError(`Failed to fetch photos: ${error.message}`)
  }

  return data
}

export const validateImageFile = (file: File): string | null => {
  if (!SUPPORTED_IMAGE_TYPES.includes(file.type as any)) {
    return 'Unsupported file type. Please use JPG, PNG or WebP.'
  }

  if (file.size > LIMITS.PHOTO_MAX_SIZE) {
    return `File too large. Maximum size is ${LIMITS.PHOTO_MAX_SIZE / (1024 * 1024)}MB.`
  }

  return null
}

// Utility to compress images client-side
export const compressImage = (file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      // Set canvas dimensions
      canvas.width = width
      canvas.height = height

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height)
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            })
            resolve(compressedFile)
          } else {
            reject(new Error('Canvas toBlob failed'))
          }
        },
        file.type,
        quality
      )
    }

    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}