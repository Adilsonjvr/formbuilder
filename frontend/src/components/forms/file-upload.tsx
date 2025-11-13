'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, File as FileIcon, Image as ImageIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import {
  uploadFile,
  validateFile,
  formatFileSize,
  isImageFile,
  getFileIcon,
  type UploadedFile,
} from '@/lib/upload'

interface FileUploadProps {
  value?: UploadedFile | null
  onChange: (file: UploadedFile | null) => void
  accept?: string
  maxSize?: number // in MB
  disabled?: boolean
  error?: string
}

export function FileUpload({
  value,
  onChange,
  accept,
  maxSize = 10,
  disabled = false,
  error,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback(
    async (file: File) => {
      setUploadError(null)

      // Validate file
      const validation = validateFile(file, {
        maxSize: maxSize * 1024 * 1024,
        allowedTypes: accept?.split(',').map((t) => t.trim()),
      })

      if (!validation.valid) {
        setUploadError(validation.error || 'Arquivo inválido')
        return
      }

      // Upload file
      setIsUploading(true)
      setUploadProgress(0)

      try {
        const uploadedFile = await uploadFile(file, (progress) => {
          setUploadProgress(progress.percentage)
        })

        onChange(uploadedFile)
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : 'Erro ao fazer upload')
        console.error('Upload error:', err)
      } finally {
        setIsUploading(false)
        setUploadProgress(0)
      }
    },
    [accept, maxSize, onChange]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      if (disabled || isUploading) return

      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        handleFileSelect(files[0])
      }
    },
    [disabled, isUploading, handleFileSelect]
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        handleFileSelect(files[0])
      }
    },
    [handleFileSelect]
  )

  const handleRemove = useCallback(() => {
    onChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [onChange])

  const handleClick = useCallback(() => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click()
    }
  }, [disabled, isUploading])

  // Render uploaded file
  if (value) {
    const isImage = isImageFile(value.url)

    return (
      <div className="space-y-2">
        <div className="relative rounded-lg border bg-card p-4">
          {/* Image preview */}
          {isImage && (
            <div className="mb-3 rounded-md overflow-hidden bg-muted">
              <img
                src={value.url}
                alt={value.originalName}
                className="w-full h-48 object-cover"
              />
            </div>
          )}

          {/* File info */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="text-2xl flex-shrink-0">
                {isImage ? '🖼️' : getFileIcon(value.type)}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{value.originalName}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(value.size)}
                </p>
              </div>
            </div>

            {!disabled && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={handleRemove}
                className="flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Render upload area
  return (
    <div className="space-y-2">
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative rounded-lg border-2 border-dashed p-8 text-center transition-colors cursor-pointer',
          isDragging && 'border-primary bg-primary/5',
          (disabled || isUploading) && 'opacity-50 cursor-not-allowed',
          error && 'border-destructive'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          disabled={disabled || isUploading}
          className="hidden"
        />

        {isUploading ? (
          <div className="space-y-3">
            <Loader2 className="h-10 w-10 mx-auto text-primary animate-spin" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Fazendo upload...</p>
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">{uploadProgress}%</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">
                <span className="text-primary">Clique para enviar</span> ou arraste aqui
              </p>
              <p className="text-xs text-muted-foreground">
                {accept || 'Todos os tipos de arquivo'} • Máx. {maxSize}MB
              </p>
            </div>
          </div>
        )}
      </div>

      {(uploadError || error) && (
        <p className="text-sm text-destructive">{uploadError || error}</p>
      )}
    </div>
  )
}
