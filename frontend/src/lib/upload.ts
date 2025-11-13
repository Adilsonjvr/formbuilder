/**
 * File upload utilities and service
 */

export interface UploadedFile {
  url: string
  filename: string
  originalName: string
  size: number
  type: string
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

/**
 * Upload a file to the server
 */
export async function uploadFile(
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadedFile> {
  return new Promise((resolve, reject) => {
    const formData = new FormData()
    formData.append('file', file)

    const xhr = new XMLHttpRequest()

    // Track upload progress
    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress: UploadProgress = {
            loaded: e.loaded,
            total: e.total,
            percentage: Math.round((e.loaded / e.total) * 100),
          }
          onProgress(progress)
        }
      })
    }

    // Handle completion
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText)
          resolve(response)
        } catch (error) {
          reject(new Error('Invalid response from server'))
        }
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`))
      }
    })

    // Handle errors
    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'))
    })

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload cancelled'))
    })

    // Send request
    xhr.open('POST', `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/upload`)
    xhr.send(formData)
  })
}

/**
 * Validate file before upload
 */
export function validateFile(
  file: File,
  options?: {
    maxSize?: number // in bytes
    allowedTypes?: string[] // MIME types
  }
): { valid: boolean; error?: string } {
  const { maxSize = 10 * 1024 * 1024, allowedTypes } = options || {} // 10MB default

  // Check size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `Arquivo muito grande. Tamanho máximo: ${formatFileSize(maxSize)}`,
    }
  }

  // Check type
  if (allowedTypes && !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Tipo de arquivo não permitido. Tipos aceitos: ${allowedTypes.join(', ')}`,
    }
  }

  return { valid: true }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Check if file is an image
 */
export function isImageFile(file: File | string): boolean {
  if (typeof file === 'string') {
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file)
  }
  return file.type.startsWith('image/')
}

/**
 * Get file icon based on type
 */
export function getFileIcon(file: File | string): string {
  const type = typeof file === 'string' ? file : file.type

  if (type.includes('pdf')) return '📄'
  if (type.includes('word') || type.includes('document')) return '📝'
  if (type.includes('excel') || type.includes('spreadsheet')) return '📊'
  if (type.includes('powerpoint') || type.includes('presentation')) return '📽️'
  if (type.includes('zip') || type.includes('rar') || type.includes('compressed')) return '🗜️'
  if (type.includes('image')) return '🖼️'
  if (type.includes('video')) return '🎥'
  if (type.includes('audio')) return '🎵'

  return '📎'
}
