// Image compression and processing utilities

export interface CompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'jpeg' | 'png' | 'webp'
}

// Compress image file
export const compressImage = async (
  file: File,
  options: CompressionOptions = {}
): Promise<File> => {
  const {
    maxWidth = 1200,
    maxHeight = 800,
    quality = 0.8,
    format = 'jpeg'
  } = options

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    if (!ctx) {
      reject(new Error('Canvas context not available'))
      return
    }

    img.onload = () => {
      try {
        // Calculate new dimensions while maintaining aspect ratio
        const { width: newWidth, height: newHeight } = calculateDimensions(
          img.width,
          img.height,
          maxWidth,
          maxHeight
        )

        // Set canvas dimensions
        canvas.width = newWidth
        canvas.height = newHeight

        // Draw and compress image
        ctx.fillStyle = '#FFFFFF' // White background for JPEG
        ctx.fillRect(0, 0, newWidth, newHeight)
        ctx.drawImage(img, 0, 0, newWidth, newHeight)

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas to blob conversion failed'))
              return
            }

            // Create new file with compressed data
            const compressedFile = new File(
              [blob],
              getCompressedFileName(file.name, format),
              {
                type: `image/${format}`,
                lastModified: Date.now()
              }
            )

            resolve(compressedFile)
          },
          `image/${format}`,
          quality
        )
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }

    // Create object URL for the image
    img.src = URL.createObjectURL(file)
  })
}

// Calculate new dimensions while maintaining aspect ratio
export const calculateDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } => {
  let { width, height } = { width: originalWidth, height: originalHeight }

  // Calculate scaling factor
  const scaleX = maxWidth / width
  const scaleY = maxHeight / height
  const scale = Math.min(scaleX, scaleY, 1) // Don't upscale

  width = Math.round(width * scale)
  height = Math.round(height * scale)

  return { width, height }
}

// Generate compressed filename
const getCompressedFileName = (originalName: string, format: string): string => {
  const nameWithoutExt = originalName.split('.')[0]
  return `${nameWithoutExt}_compressed.${format}`
}

// Create image thumbnail
export const createThumbnail = async (
  file: File,
  size: number = 150
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    if (!ctx) {
      reject(new Error('Canvas context not available'))
      return
    }

    img.onload = () => {
      try {
        // Set square canvas
        canvas.width = size
        canvas.height = size

        // Calculate crop dimensions (center crop)
        const minDimension = Math.min(img.width, img.height)
        const sx = (img.width - minDimension) / 2
        const sy = (img.height - minDimension) / 2

        // Fill with white background
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, size, size)

        // Draw cropped image
        ctx.drawImage(
          img,
          sx, sy, minDimension, minDimension,  // Source
          0, 0, size, size                      // Destination
        )

        // Convert to data URL
        resolve(canvas.toDataURL('image/jpeg', 0.7))
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => {
      reject(new Error('Failed to load image for thumbnail'))
    }

    img.src = URL.createObjectURL(file)
  })
}

// Validate image file
export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { isValid: false, error: 'Datei muss ein Bild sein' }
  }

  // Check supported formats
  const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!supportedFormats.includes(file.type)) {
    return { isValid: false, error: 'Unterstützte Formate: JPEG, PNG, WebP' }
  }

  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    return { isValid: false, error: 'Datei zu groß (max. 10 MB)' }
  }

  return { isValid: true }
}

// Get image dimensions from file
export const getImageDimensions = async (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => {
      resolve({ width: img.width, height: img.height })
      URL.revokeObjectURL(img.src)
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
      URL.revokeObjectURL(img.src)
    }

    img.src = URL.createObjectURL(file)
  })
}

// Convert file to base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Failed to convert file to base64'))
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
    
    reader.readAsDataURL(file)
  })
}

// Format file size for display
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}