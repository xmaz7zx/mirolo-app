import { createClient } from '@/lib/supabase'
import type { PhotoType } from '@/types'

export class PhotoError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'PhotoError'
  }
}

// Generate unique filename
const generateFileName = (originalName: string, recipeId: string, photoType: PhotoType): string => {
  const timestamp = Date.now()
  const extension = originalName.split('.').pop()
  return `${recipeId}/${photoType}/${timestamp}.${extension}`
}

// Upload recipe photo to Supabase Storage
export const uploadRecipePhoto = async (
  recipeId: string, 
  file: File, 
  photoType: PhotoType
): Promise<{
  id: string
  photo_url: string
  photo_type: PhotoType
}> => {
  const { data: { user }, error: authError } = await createClient().auth.getUser()
  if (authError || !user) {
    throw new PhotoError('Authentication required')
  }

  // Generate filename
  const fileName = generateFileName(file.name, recipeId, photoType)
  
  try {
    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await createClient().storage
      .from('recipe-photos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      throw new PhotoError(`Upload failed: ${uploadError.message}`)
    }

    // Get public URL
    const { data: { publicUrl } } = createClient().storage
      .from('recipe-photos')
      .getPublicUrl(fileName)

    // Save photo record to database
    const { data: photoRecord, error: dbError } = await createClient()
      .from('recipe_photos')
      .insert({
        recipe_id: recipeId,
        photo_url: publicUrl,
        photo_type: photoType,
        file_size: file.size,
        file_name: file.name,
        storage_path: fileName,
        uploaded_by: user.id
      })
      .select()
      .single()

    if (dbError) {
      // Clean up storage if database insert fails
      await createClient().storage
        .from('recipe-photos')
        .remove([fileName])
      
      throw new PhotoError(`Database error: ${dbError.message}`)
    }

    return {
      id: photoRecord.id,
      photo_url: publicUrl,
      photo_type: photoType
    }
  } catch (error) {
    if (error instanceof PhotoError) {
      throw error
    }
    throw new PhotoError(`Unexpected error during upload: ${error}`)
  }
}

// Delete recipe photo
export const deleteRecipePhoto = async (photoId: string): Promise<void> => {
  const { data: { user }, error: authError } = await createClient().auth.getUser()
  if (authError || !user) {
    throw new PhotoError('Authentication required')
  }

  // Get photo record to get storage path
  const { data: photo, error: fetchError } = await createClient()
    .from('recipe_photos')
    .select('*')
    .eq('id', photoId)
    .single()

  if (fetchError || !photo) {
    throw new PhotoError('Photo not found')
  }

  // Check ownership via recipe
  const { data: recipe, error: recipeError } = await createClient()
    .from('recipes')
    .select('user_id')
    .eq('id', photo.recipe_id)
    .single()

  if (recipeError || recipe?.user_id !== user.id) {
    throw new PhotoError('Not authorized to delete this photo')
  }

  try {
    // Delete from storage
    const { error: storageError } = await createClient().storage
      .from('recipe-photos')
      .remove([photo.storage_path])

    if (storageError) {
      console.warn('Storage deletion failed:', storageError)
    }

    // Delete from database
    const { error: dbError } = await createClient()
      .from('recipe_photos')
      .delete()
      .eq('id', photoId)

    if (dbError) {
      throw new PhotoError(`Database error: ${dbError.message}`)
    }
  } catch (error) {
    if (error instanceof PhotoError) {
      throw error
    }
    throw new PhotoError(`Unexpected error during deletion: ${error}`)
  }
}

// Get recipe photos
export const getRecipePhotos = async (recipeId: string) => {
  const { data, error } = await createClient()
    .from('recipe_photos')
    .select('*')
    .eq('recipe_id', recipeId)
    .order('uploaded_at', { ascending: false })

  if (error) {
    throw new PhotoError(`Failed to fetch photos: ${error.message}`)
  }

  return data || []
}

// Update photo order/metadata
export const updatePhotoOrder = async (photoId: string, newOrder: number): Promise<void> => {
  const { data: { user }, error: authError } = await createClient().auth.getUser()
  if (authError || !user) {
    throw new PhotoError('Authentication required')
  }

  const { error } = await createClient()
    .from('recipe_photos')
    .update({ photo_order: newOrder })
    .eq('id', photoId)

  if (error) {
    throw new PhotoError(`Failed to update photo order: ${error.message}`)
  }
}

// Set main photo
export const setMainPhoto = async (recipeId: string, photoId: string): Promise<void> => {
  const { data: { user }, error: authError } = await createClient().auth.getUser()
  if (authError || !user) {
    throw new PhotoError('Authentication required')
  }

  // Check recipe ownership
  const { data: recipe, error: recipeError } = await createClient()
    .from('recipes')
    .select('user_id')
    .eq('id', recipeId)
    .single()

  if (recipeError || recipe?.user_id !== user.id) {
    throw new PhotoError('Not authorized to modify this recipe')
  }

  try {
    // First, set all photos to not-main
    await createClient()
      .from('recipe_photos')
      .update({ photo_type: 'result' })
      .eq('recipe_id', recipeId)
      .eq('photo_type', 'main')

    // Then set the selected photo as main
    const { error } = await createClient()
      .from('recipe_photos')
      .update({ photo_type: 'main' })
      .eq('id', photoId)
      .eq('recipe_id', recipeId)

    if (error) {
      throw new PhotoError(`Failed to set main photo: ${error.message}`)
    }
  } catch (error) {
    if (error instanceof PhotoError) {
      throw error
    }
    throw new PhotoError(`Unexpected error: ${error}`)
  }
}

// Get storage usage for user
export const getUserStorageUsage = async (): Promise<{
  used: number
  limit: number
  photos: number
}> => {
  const { data: { user }, error: authError } = await createClient().auth.getUser()
  if (authError || !user) {
    throw new PhotoError('Authentication required')
  }

  const { data: photos, error } = await createClient()
    .from('recipe_photos')
    .select('file_size')
    .eq('uploaded_by', user.id)

  if (error) {
    throw new PhotoError(`Failed to get storage usage: ${error.message}`)
  }

  const used = photos?.reduce((total, photo) => total + (photo.file_size || 0), 0) || 0
  const limit = 100 * 1024 * 1024 // 100 MB limit for free users

  return {
    used,
    limit,
    photos: photos?.length || 0
  }
}