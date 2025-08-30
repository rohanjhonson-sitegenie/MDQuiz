import React, { useState, useEffect } from 'react'
import { AlertCircle, Loader2, Lock, Unlock } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  parseVideoUrl,
  VIDEO_PROVIDERS,
  type VideoProvider,
} from '@/features/blog/api'

interface VideoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (
    url: string,
    title: string,
    width?: number,
    height?: number
  ) => void
  initialVideo?: {
    url: string
    title: string
    width?: number
    height?: number
  }
}

interface VideoMetadata {
  title?: string
  width?: number
  height?: number
}

// Fetch video metadata using oEmbed APIs
async function fetchVideoMetadata(
  provider: VideoProvider,
  videoId: string
): Promise<VideoMetadata | null> {
  try {
    let oembedUrl = ''

    switch (provider) {
      case 'youtube':
        oembedUrl = `https://www.youtube.com/oembed?url=https://youtube.com/watch?v=${videoId}&format=json`
        break
      case 'vimeo':
        oembedUrl = `https://vimeo.com/api/oembed.json?url=https://vimeo.com/${videoId}`
        break
      // Note: Loom and Wistia require different approaches or API keys
      default:
        return null
    }

    if (!oembedUrl) return null

    const response = await fetch(oembedUrl)
    if (!response.ok) return null

    const data = await response.json()
    return {
      title: data.title || undefined,
      width: data.width || undefined,
      height: data.height || undefined,
    }
  } catch {
    return null
  }
}

export const VideoDialog: React.FC<VideoDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  initialVideo,
}) => {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [provider, setProvider] = useState<VideoProvider | ''>('')
  const [videoId, setVideoId] = useState('')
  const [error, setError] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false)
  const [width, setWidth] = useState<string>('')
  const [height, setHeight] = useState<string>('')
  const [aspectRatio, setAspectRatio] = useState<number | null>(null)
  const [lockAspectRatio, setLockAspectRatio] = useState(true)

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setUrl('')
      setTitle('')
      setProvider('')
      setVideoId('')
      setError('')
      setShowPreview(false)
      setIsLoadingMetadata(false)
      setWidth('')
      setHeight('')
      setAspectRatio(null)
      setLockAspectRatio(true)
    }
  }, [open])

  // Set initial values when editing
  useEffect(() => {
    if (open && initialVideo) {
      setUrl(initialVideo.url)
      setTitle(initialVideo.title || '')
      setWidth(initialVideo.width?.toString() || '')
      setHeight(initialVideo.height?.toString() || '')

      // Calculate aspect ratio from initial dimensions
      if (initialVideo.width && initialVideo.height) {
        setAspectRatio(initialVideo.width / initialVideo.height)
      }

      // Parse the URL to get provider and ID
      const parsed = parseVideoUrl(initialVideo.url)
      if (parsed.provider && parsed.videoId) {
        setProvider(parsed.provider)
        setVideoId(parsed.videoId)
        setShowPreview(true)
      }
    }
  }, [open, initialVideo])

  // Fetch metadata when provider and videoId are set
  useEffect(() => {
    if (
      provider &&
      videoId &&
      (provider === 'youtube' || provider === 'vimeo')
    ) {
      const fetchMetadata = async () => {
        setIsLoadingMetadata(true)
        const metadata = await fetchVideoMetadata(
          provider as VideoProvider,
          videoId
        )
        if (metadata) {
          if (metadata.title && !title) {
            setTitle(metadata.title)
          }
          if (metadata.width && metadata.height) {
            setAspectRatio(metadata.width / metadata.height)
            // Only set dimensions if not already set
            if (!width && !height) {
              setWidth(metadata.width.toString())
              setHeight(metadata.height.toString())
            }
          }
        }
        setIsLoadingMetadata(false)
      }
      fetchMetadata()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, videoId])

  const handleUrlChange = (value: string) => {
    setUrl(value)
    setError('')

    // Try to parse the URL
    const parsed = parseVideoUrl(value)
    if (parsed.provider && parsed.videoId) {
      setProvider(parsed.provider)
      setVideoId(parsed.videoId)
      setShowPreview(true)
    } else if (value) {
      // If URL is provided but can't be parsed
      setProvider('')
      setVideoId('')
      setShowPreview(false)
      if (value.length > 10) {
        // Only show error for substantial input
        setError('Unable to recognize video URL. Please check the format.')
      }
    } else {
      setProvider('')
      setVideoId('')
      setShowPreview(false)
    }
  }

  const handleProviderChange = (value: VideoProvider) => {
    setProvider(value)
    setError('')

    // If we have a video ID, update the preview
    if (videoId) {
      setShowPreview(true)
    }
  }

  const handleVideoIdChange = (value: string) => {
    setVideoId(value)
    setError('')

    if (value && provider) {
      setShowPreview(true)
    } else {
      setShowPreview(false)
    }
  }

  const handleWidthChange = (value: string) => {
    setWidth(value)

    // Calculate height based on aspect ratio if locked
    if (lockAspectRatio && aspectRatio && value) {
      const numWidth = parseInt(value, 10)
      if (!isNaN(numWidth)) {
        const calculatedHeight = Math.round(numWidth / aspectRatio)
        setHeight(calculatedHeight.toString())
      }
    }
  }

  const handleHeightChange = (value: string) => {
    setHeight(value)

    // Calculate width based on aspect ratio if locked
    if (lockAspectRatio && aspectRatio && value) {
      const numHeight = parseInt(value, 10)
      if (!isNaN(numHeight)) {
        const calculatedWidth = Math.round(numHeight * aspectRatio)
        setWidth(calculatedWidth.toString())
      }
    }
  }

  const handleSubmit = () => {
    if (!provider || !videoId) {
      setError(
        'Please provide a valid video URL or select a platform and enter a video ID.'
      )
      return
    }

    // Generate the markdown syntax
    const videoUrl = `${provider}:${videoId}`
    const widthNum = width ? parseInt(width, 10) : undefined
    const heightNum = height ? parseInt(height, 10) : undefined
    onSubmit(videoUrl, title || 'Video', widthNum, heightNum)
    onOpenChange(false)
  }

  const getPreviewUrl = () => {
    if (!provider || !videoId) return ''
    const config = VIDEO_PROVIDERS[provider as VideoProvider]
    return config?.getEmbedUrl(videoId, { privacyEnhanced: true })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>Insert Video</DialogTitle>
          <DialogDescription>
            Add a video from YouTube, Vimeo, Loom, or Wistia to your blog post.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          {/* URL Input */}
          <div className='space-y-2'>
            <Label htmlFor='video-url'>Video URL</Label>
            <Input
              id='video-url'
              type='url'
              placeholder='https://youtube.com/watch?v=...'
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              className='w-full'
            />
            <p className='text-muted-foreground text-sm'>
              Paste a video URL from YouTube, Vimeo, Loom, or Wistia
            </p>
          </div>

          {/* Manual Input Section */}
          <div className='space-y-4 border-t pt-4'>
            <p className='text-sm font-medium'>
              Or enter video details manually:
            </p>

            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='video-platform'>Platform</Label>
                <Select value={provider} onValueChange={handleProviderChange}>
                  <SelectTrigger id='video-platform'>
                    <SelectValue placeholder='Select platform' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='youtube'>YouTube</SelectItem>
                    <SelectItem value='vimeo'>Vimeo</SelectItem>
                    <SelectItem value='loom'>Loom</SelectItem>
                    <SelectItem value='wistia'>Wistia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='video-id'>Video ID</Label>
                <Input
                  id='video-id'
                  type='text'
                  placeholder='dQw4w9WgXcQ'
                  value={videoId}
                  onChange={(e) => handleVideoIdChange(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Title Input */}
          <div className='space-y-2'>
            <Label htmlFor='video-title'>
              Title (optional)
              {isLoadingMetadata && (
                <span className='text-muted-foreground ml-2 text-xs'>
                  <Loader2 className='inline h-3 w-3 animate-spin' /> Fetching
                  title...
                </span>
              )}
            </Label>
            <Input
              id='video-title'
              type='text'
              placeholder='My awesome video'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoadingMetadata}
            />
            <p className='text-muted-foreground text-sm'>
              This will be used as alt text for accessibility
            </p>
          </div>

          {/* Dimensions inputs with aspect ratio lock */}
          <div className='space-y-4'>
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='lock-aspect-ratio'
                checked={lockAspectRatio}
                onCheckedChange={(checked) =>
                  setLockAspectRatio(checked as boolean)
                }
                disabled={!aspectRatio}
              />
              <Label
                htmlFor='lock-aspect-ratio'
                className='flex cursor-pointer items-center gap-2'
              >
                {lockAspectRatio ? (
                  <Lock className='h-3 w-3' />
                ) : (
                  <Unlock className='h-3 w-3' />
                )}
                Maintain aspect ratio
                {aspectRatio && isLoadingMetadata && (
                  <span className='text-muted-foreground text-xs'>
                    <Loader2 className='inline h-3 w-3 animate-spin' />
                  </span>
                )}
                {aspectRatio && !isLoadingMetadata && (
                  <span className='text-muted-foreground text-xs'>
                    ({aspectRatio.toFixed(2)}:1)
                  </span>
                )}
              </Label>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='video-width'>Width (px)</Label>
                <Input
                  id='video-width'
                  type='number'
                  placeholder='Auto'
                  value={width}
                  onChange={(e) => handleWidthChange(e.target.value)}
                  min='1'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='video-height'>Height (px)</Label>
                <Input
                  id='video-height'
                  type='number'
                  placeholder='Auto'
                  value={height}
                  onChange={(e) => handleHeightChange(e.target.value)}
                  min='1'
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Preview */}
          {showPreview && provider && videoId && (
            <div className='space-y-2'>
              <Label>Preview</Label>
              <div className='bg-muted overflow-hidden rounded-lg border'>
                <div className='aspect-video'>
                  <iframe
                    src={getPreviewUrl()}
                    title='Video preview'
                    className='h-full w-full'
                    allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type='button'
            onClick={handleSubmit}
            disabled={!provider || !videoId}
          >
            {initialVideo ? 'Update Video' : 'Insert Video'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
