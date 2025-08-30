import { useEffect, useRef } from 'react'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useVideoWall } from '../hooks/useVideoWall'
import { useYouTubePlaylist } from '../hooks/useYouTubePlaylist'
import type { VideoPlaylistGridProps } from '../types/video-wall.types'
import { CinematicVideoThumbnail } from './CinematicVideoThumbnail'
import { VideoSkeleton } from './VideoSkeleton'

interface CinematicVideoGridProps extends VideoPlaylistGridProps {
  subtitle?: string
}

export function CinematicVideoGrid({
  playlistId,
  title,
  subtitle,
  columns = 3,
  maxVideos,
}: CinematicVideoGridProps) {
  const { videos, loading, error } = useYouTubePlaylist(playlistId)
  const { registerVideos } = useVideoWall()
  const gridRef = useRef<HTMLDivElement>(null)

  // Register videos with the context when they load
  useEffect(() => {
    if (videos.length > 0) {
      registerVideos(videos)
    }
  }, [videos, registerVideos])

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view')
          }
        })
      },
      { threshold: 0.1, rootMargin: '50px' }
    )

    const elements = gridRef.current?.querySelectorAll('.video-card')
    elements?.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [loading])

  if (error) {
    return (
      <div className='container mx-auto px-4'>
        <div className='space-y-4'>
          {title && <h2 className='text-3xl font-bold'>{title}</h2>}
          <Alert variant='destructive' className='backdrop-blur-xl'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  const displayVideos = maxVideos ? videos.slice(0, maxVideos) : videos

  return (
    <section className='relative'>
      {/* Section Background Glow */}
      <div className='absolute inset-0 -z-10'>
        <div className='from-primary/20 via-accent/20 to-secondary/20 absolute top-1/2 left-1/2 h-[400px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r blur-[120px] filter' />
      </div>

      <div className='container mx-auto px-4'>
        {/* Section Header */}
        <div className='mb-12 space-y-3'>
          {title && (
            <h2 className='from-foreground to-foreground/70 bg-gradient-to-r bg-clip-text text-4xl font-bold text-transparent md:text-5xl'>
              {title}
            </h2>
          )}
          {subtitle && (
            <p className='text-muted-foreground text-lg font-light'>
              {subtitle}
            </p>
          )}
        </div>

        <div
          ref={gridRef}
          className={cn(
            'grid auto-rows-fr gap-6',
            columns === 2 && 'grid-cols-1 md:grid-cols-2',
            columns === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
            columns === 4 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
          )}
        >
          {loading
            ? Array.from({ length: columns * 2 }).map((_, index) => (
                <div
                  key={index}
                  className='video-card translate-y-8 opacity-0 transition-all duration-700'
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <VideoSkeleton className='bg-muted/20 backdrop-blur-sm' />
                </div>
              ))
            : displayVideos.map((video, index) => (
                <div
                  key={video.id}
                  className='video-card translate-y-8 opacity-0 transition-all duration-700'
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <CinematicVideoThumbnail video={video} index={index} />
                </div>
              ))}
        </div>
      </div>

      <style>{`
        .video-card.in-view {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </section>
  )
}
