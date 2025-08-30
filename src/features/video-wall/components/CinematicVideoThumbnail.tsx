import { useState } from 'react'
import { Play, Clock, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useVideoWall } from '../hooks/useVideoWall'
import type { YouTubeVideo } from '../types/video-wall.types'
import { getColorPalette } from '../utils/color-palettes'
import { getYouTubeThumbnail } from '../utils/youtube-utils'

interface CinematicVideoThumbnailProps {
  video: YouTubeVideo
  className?: string
  index?: number
}

export function CinematicVideoThumbnail({
  video,
  className,
  index = 0,
}: CinematicVideoThumbnailProps) {
  const { selectVideo } = useVideoWall()
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const colorPalette = getColorPalette(index)

  return (
    <button
      onClick={() => selectVideo(video)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'group relative overflow-hidden rounded-2xl transition-all duration-500',
        'hover:shadow-primary/20 hover:scale-[1.02] hover:shadow-2xl',
        'focus:ring-primary/50 focus:ring-2 focus:outline-none',
        'flex h-full w-full flex-col',
        className
      )}
      aria-label={`Play video: ${video.title}`}
    >
      {/* Glass Background */}
      <div className='absolute inset-0 bg-gradient-to-br from-black/30 to-black/10 backdrop-blur-sm' />

      {/* Border Gradient */}
      <div
        className={cn(
          'absolute inset-0 rounded-2xl bg-gradient-to-br via-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-20',
          colorPalette.primary
        )}
      />

      <div className='relative aspect-video'>
        {/* Thumbnail */}
        <div className='absolute inset-0 overflow-hidden rounded-t-2xl'>
          <img
            src={video.thumbnail || getYouTubeThumbnail(video.id, 'high')}
            alt={video.title}
            className={cn(
              'h-full w-full object-cover transition-all duration-700',
              imageLoaded ? 'scale-100 opacity-100' : 'scale-105 opacity-0',
              isHovered && 'scale-110 brightness-75'
            )}
            loading='lazy'
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              // Fallback to a different quality if the primary thumbnail fails
              const target = e.target as HTMLImageElement
              if (target.src.includes('maxresdefault')) {
                target.src = getYouTubeThumbnail(video.id, 'high')
              } else if (target.src.includes('hqdefault')) {
                target.src = getYouTubeThumbnail(video.id, 'medium')
              }
            }}
          />

          {/* Gradient Overlay */}
          <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60' />

          {/* Animated Gradient on Hover */}
          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-tr via-transparent',
              'opacity-0 transition-opacity duration-500 group-hover:opacity-15',
              colorPalette.accent
            )}
          />
        </div>

        {/* Play Button Container */}
        <div className='absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
          {/* Glow Effect */}
          <div
            className={cn(
              'absolute h-24 w-24 rounded-full bg-gradient-to-r blur-xl filter',
              'scale-0 transition-transform duration-500 group-hover:scale-100',
              colorPalette.glow
            )}
          />

          {/* Play Button */}
          <div
            className={cn(
              'relative flex h-16 w-16 items-center justify-center rounded-full',
              'border border-white/20 bg-black/20 backdrop-blur-md',
              'transform transition-all duration-300',
              'group-hover:scale-110 group-hover:border-white/30 group-hover:bg-black/30'
            )}
          >
            <Play className='h-7 w-7 translate-x-0.5 fill-white text-white' />
          </div>
        </div>

        {/* Duration Badge */}
        {video.duration && (
          <div className='absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs text-white/90 backdrop-blur-md'>
            <Clock className='h-3 w-3' />
            {video.duration}
          </div>
        )}

        {/* New Badge (for recent videos) */}
        {index < 3 && (
          <div
            className={cn(
              'absolute top-3 left-3 flex items-center gap-1 rounded-full bg-gradient-to-r px-2.5 py-1 text-xs font-medium text-white shadow-lg',
              colorPalette.primary
            )}
          >
            <TrendingUp className='h-3.5 w-3.5' />
            New
          </div>
        )}
      </div>

      {/* Content Section with Dark Glass */}
      <div className='relative mt-auto border-t border-white/10 bg-black/40 p-4 backdrop-blur-md dark:border-white/5 dark:bg-black/60'>
        {/* Title */}
        <h3 className='line-clamp-2 min-h-[3rem] text-left font-medium text-white/90 transition-colors group-hover:text-white'>
          {video.title}
        </h3>

        {/* Hover Indicator */}
        <div
          className={cn(
            'absolute right-0 bottom-0 left-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r transition-transform duration-500 group-hover:scale-x-100',
            colorPalette.primary
          )}
        />
      </div>

      {/* Ambient Light Effect */}
      <div
        className={cn(
          'absolute -inset-x-4 -bottom-4 h-20 opacity-0 transition-opacity duration-700 group-hover:opacity-15',
          'bg-gradient-to-t to-transparent blur-2xl',
          colorPalette.glow
        )}
      />
    </button>
  )
}
