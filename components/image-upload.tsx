"use client"

import React, { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react"
import Image from "next/image"

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void
  onImageRemoved?: (imageUrl: string) => void
  existingImages?: string[]
  maxImages?: number
  className?: string
}

export default function ImageUpload({
  onImageUploaded,
  onImageRemoved,
  existingImages = [],
  maxImages = 5,
  className = ""
}: ImageUploadProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "نوع ملف غير صحيح",
        description: "يُسمح فقط بملفات JPEG، PNG، و WebP",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast({
        title: "حجم الملف كبير جداً",
        description: "الحد الأقصى لحجم الملف هو 5 ميجابايت",
        variant: "destructive",
      })
      return
    }

    // Check max images limit
    if (existingImages.length >= maxImages) {
      toast({
        title: "تم الوصول للحد الأقصى",
        description: `يمكن رفع ${maxImages} صور كحد أقصى`,
        variant: "destructive",
      })
      return
    }

    await uploadFile(file)
  }

  const uploadFile = async (file: File) => {
    setUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const result = await response.json()

      if (response.ok) {
        onImageUploaded(result.url)
        toast({
          title: "تم رفع الصورة بنجاح",
          description: "تم رفع الصورة وإضافتها للمنتج",
        })
      } else {
        throw new Error(result.error || 'فشل في رفع الصورة')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: "خطأ في رفع الصورة",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء رفع الصورة",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      setUploadProgress(0)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  const removeImage = async (imageUrl: string) => {
    if (onImageRemoved) {
      onImageRemoved(imageUrl)
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
              ${uploading ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:border-primary hover:bg-primary/5'}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
              disabled={uploading}
            />
            
            {uploading ? (
              <div className="space-y-4">
                <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">جاري رفع الصورة...</p>
                  <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                <div className="space-y-2">
                  <p className="text-sm font-medium">اضغط لرفع صورة أو اسحب وأفلت</p>
                  <p className="text-xs text-muted-foreground">
                    JPEG، PNG، WebP (حتى 5 ميجابايت)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {existingImages.length} من {maxImages} صور
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {existingImages.map((imageUrl, index) => (
            <Card key={index} className="relative group">
              <CardContent className="p-2">
                <div className="relative aspect-square">
                  <Image
                    src={imageUrl}
                    alt={`Product image ${index + 1}`}
                    fill
                    className="object-cover rounded"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(imageUrl)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {existingImages.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">لم يتم رفع أي صور بعد</p>
        </div>
      )}
    </div>
  )
}