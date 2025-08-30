import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useVideoWall } from '../hooks/useVideoWall'
import { useYouTubePlaylist } from '../hooks/useYouTubePlaylist'
import type { VideoPlaylistGridProps } from '../types/video-wall.types'
import { VideoSkeleton } from './VideoSkeleton'
import { VideoThumbnail } from './VideoThumbnail'

export function VideoPlaylistGrid({
  playlistId,
  title,
  columns = 3,
  maxVideos,
}: VideoPlaylistGridProps) {
  const { videos, loading, error } = useYouTubePlaylist(playlistId)
  const { registerVideos } = useVideoWall()

  // Register videos with the context when they load
  useEffect(() => {
    if (videos.length > 0) {
      registerVideos(videos)
    }
  }, [videos, registerVideos])

  if (error) {
    return (
      <div className='space-y-4'>
        {title && <h2 className='text-2xl font-bold'>{title}</h2>}
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const displayVideos = maxVideos ? videos.slice(0, maxVideos) : videos

  return (
    <div className='space-y-4'>
      {title && <h2 className='text-2xl font-bold'>{title}</h2>}

      <div
        className={cn(
          'grid gap-4',
          columns === 2 && 'grid-cols-1 sm:grid-cols-2',
          columns === 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
          columns === 4 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
        )}
      >
        {loading
          ? Array.from({ length: columns * 2 }).map((_, index) => (
              <VideoSkeleton key={index} />
            ))
          : displayVideos.map((video) => (
              <VideoThumbnail key={video.id} video={video} />
            ))}
      </div>
    </div>
  )
}
