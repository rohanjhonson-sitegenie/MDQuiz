import { Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useVideoWall } from '../hooks/useVideoWall'
import type { YouTubeVideo } from '../types/video-wall.types'
import { getYouTubeThumbnail } from '../utils/youtube-utils'

interface VideoThumbnailProps {
  video: YouTubeVideo
  className?: string
}

export function VideoThumbnail({ video, className }: VideoThumbnailProps) {
  const { selectVideo } = useVideoWall()

  return (
    <button
      onClick={() => selectVideo(video)}
      className={cn(
        'group hover:ring-primary focus:ring-primary relative overflow-hidden rounded-lg bg-black transition-all hover:ring-2 focus:ring-2 focus:outline-none',
        className
      )}
      aria-label={`Play video: ${video.title}`}
    >
      <div className='relative aspect-video bg-black'>
        <img
          src={getYouTubeThumbnail(video.id)}
          alt={video.title}
          className='h-full w-full object-cover'
          loading='lazy'
        />

        {/* Overlay */}
        <div className='absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10' />

        {/* Play button */}
        <div className='pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
          <div className='pointer-events-auto flex h-12 w-12 scale-95 items-center justify-center rounded-full bg-black/70 transition-transform duration-300 group-hover:scale-100'>
            <Play className='h-6 w-6 fill-white text-white' />
          </div>
        </div>

        {/* Duration badge */}
        {video.duration && (
          <div className='absolute right-2 bottom-2 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white'>
            {video.duration}
          </div>
        )}
      </div>

      {/* Title */}
      <div className='p-3'>
        <h3 className='line-clamp-2 text-left text-sm font-medium'>
          {video.title}
        </h3>
      </div>
    </button>
  )
}
