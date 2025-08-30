import { useState } from 'react'
import { bunnyStorage } from '@/repositories/bunny-storage.repository'
import { toast } from 'sonner'

interface BlogImageUploaderProps {
  postId?: string
  onUploadComplete: (imageUrl: string) => void
}

export function BlogImageUploader({
  postId: _postId,
  onUploadComplete,
}: BlogImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)

  const handleImageUpload = async (file: File): Promise<string> => {
    setIsUploading(true)
    try {
      const path = 'blog/images'
      const result = await bunnyStorage.upload(file, path)

      toast.success('Image uploaded successfully')
      onUploadComplete(result.publicUrl)
      return result.publicUrl
    } catch (error) {
      toast.error('Failed to upload image')
      throw error
    } finally {
      setIsUploading(false)
    }
  }

  return { handleImageUpload, isUploading }
}
