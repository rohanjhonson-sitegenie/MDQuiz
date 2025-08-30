import { useEffect, useState, useRef } from 'react'
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Volume2,
  VolumeX,
  Play,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useVideoWall } from '../hooks/useVideoWall'
import { getYouTubeThumbnail } from '../utils/youtube-utils'
import { CinematicVideoEmbed } from './CinematicVideoEmbed'
import { CinematicVideoLoader } from './CinematicVideoLoader'
import { CinematicVideoLoader2 } from './CinematicVideoLoader2'
import { CinematicVideoLoader3 } from './CinematicVideoLoader3'

// Loader types for variety
type LoaderType = 'countdown' | 'progress' | 'projector'
const loaderTypes: LoaderType[] = ['countdown', 'progress', 'projector']
const getRandomLoaderType = (): LoaderType =>
  loaderTypes[Math.floor(Math.random() * loaderTypes.length)]

export function CinematicVideoPlayer() {
  const {
    selectedVideo,
    isPlayerOpen,
    closePlayer,
    nextVideo,
    previousVideo,
    currentIndex,
    allVideos,
    selectVideo,
  } = useVideoWall()

  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [prevVideoId, setPrevVideoId] = useState<string | null>(null)
  const [loaderType, setLoaderType] = useState<LoaderType>('countdown')
  const [shouldAutoplay, setShouldAutoplay] = useState(false)

  const thumbnailContainerRef = useRef<HTMLDivElement>(null)
  const thumbnailRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  const hasNext = currentIndex < allVideos.length - 1
  const hasPrevious = currentIndex > 0

  // Handle video changes with loading state
  useEffect(() => {
    if (selectedVideo && selectedVideo.id !== prevVideoId) {
      setIsLoading(true)
      setPrevVideoId(selectedVideo.id)
      setShouldAutoplay(false) // Reset autoplay state
      // Select a random loader type for variety
      setLoaderType(getRandomLoaderType())
    }
  }, [selectedVideo, prevVideoId])

  // Auto-scroll thumbnail bar to center selected video
  useEffect(() => {
    if (selectedVideo && thumbnailContainerRef.current) {
      const thumbnail = thumbnailRefs.current.get(selectedVideo.id)
      if (thumbnail) {
        // Calculate the scroll position to center the thumbnail
        const container = thumbnailContainerRef.current
        const containerWidth = container.offsetWidth
        const thumbnailLeft = thumbnail.offsetLeft
        const thumbnailWidth = thumbnail.offsetWidth
        const scrollLeft =
          thumbnailLeft - containerWidth / 2 + thumbnailWidth / 2

        // Smooth scroll to center
        container.scrollTo({
          left: scrollLeft,
          behavior: 'smooth',
        })
      }
    }
  }, [selectedVideo])

  // Auto-hide controls
  useEffect(() => {
    if (!isPlayerOpen) return

    const timer = setTimeout(() => setShowControls(false), 3000)
    return () => clearTimeout(timer)
  }, [isPlayerOpen, showControls])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (!isPlayerOpen) return

      switch (e.key) {
        case 'Escape':
          if (isFullscreen) {
            setIsFullscreen(false)
          } else {
            closePlayer()
          }
          break
        case 'ArrowLeft':
          if (hasPrevious) previousVideo()
          break
        case 'ArrowRight':
          if (hasNext) nextVideo()
          break
        case 'f':
        case 'F':
          setIsFullscreen(!isFullscreen)
          break
        case 'm':
        case 'M':
          setIsMuted(!isMuted)
          break
      }
    }
    document.addEventListener('keydown', handleKeyboard)
    return () => document.removeEventListener('keydown', handleKeyboard)
  }, [
    isPlayerOpen,
    closePlayer,
    hasNext,
    hasPrevious,
    nextVideo,
    previousVideo,
    isFullscreen,
    isMuted,
  ])

  // Note: Scroll prevention is handled at the page level to preserve scroll position

  if (!selectedVideo || !isPlayerOpen) return null

  return (
    <div
      className='fixed inset-0 z-[9999]'
      onMouseMove={() => setShowControls(true)}
    >
      {/* Enhanced Backdrop with Blur */}
      <div
        className={cn(
          'absolute inset-0 transition-all duration-500',
          isPlayerOpen ? 'opacity-100' : 'opacity-0'
        )}
        onClick={closePlayer}
      >
        {/* Multi-layer backdrop for depth */}
        <div className='absolute inset-0 bg-black/95' />
        <div className='absolute inset-0 backdrop-blur-2xl' />
        <div className='from-background/50 to-background/50 absolute inset-0 bg-gradient-to-t via-transparent' />

        {/* Ambient glow based on video */}
        <div className='absolute inset-0'>
          <div className='bg-primary absolute top-1/4 left-1/4 h-96 w-96 rounded-full opacity-20 blur-[200px] filter' />
          <div className='bg-secondary absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full opacity-20 blur-[200px] filter' />
        </div>
      </div>

      {/* Player Container */}
      <div
        className={cn(
          'relative flex h-full items-center justify-center p-4 md:p-8',
          isFullscreen && 'p-0'
        )}
      >
        {/* Controls Overlay */}
        <div
          className={cn(
            'pointer-events-none absolute inset-0 z-20 transition-opacity duration-300',
            showControls ? 'opacity-100' : 'opacity-0'
          )}
        >
          {/* Top Controls */}
          <div
            className={cn(
              'absolute top-0 right-0 left-0 p-6',
              'from-background/70 bg-gradient-to-b to-transparent',
              'pointer-events-auto'
            )}
          >
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                {/* Video Counter */}
                <div className='text-foreground/80 text-sm font-light'>
                  {currentIndex + 1} / {allVideos.length}
                </div>

                {/* Video Title */}
                <h2 className='text-foreground line-clamp-1 max-w-lg text-lg font-medium'>
                  {selectedVideo.title}
                </h2>
              </div>

              <div className='flex items-center gap-2'>
                {/* Volume Button */}
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className='bg-card/10 text-foreground/80 hover:text-foreground hover:bg-card/20 rounded-full p-2 backdrop-blur-md transition-all'
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? (
                    <VolumeX className='h-5 w-5' />
                  ) : (
                    <Volume2 className='h-5 w-5' />
                  )}
                </button>

                {/* Fullscreen Button */}
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className='bg-card/10 text-foreground/80 hover:text-foreground hover:bg-card/20 rounded-full p-2 backdrop-blur-md transition-all'
                  aria-label='Toggle fullscreen'
                >
                  <Maximize2 className='h-5 w-5' />
                </button>

                {/* Close Button */}
                <button
                  onClick={closePlayer}
                  className='bg-card/10 text-foreground/80 hover:text-foreground hover:bg-card/20 rounded-full p-2 backdrop-blur-md transition-all'
                  aria-label='Close video'
                >
                  <X className='h-6 w-6' />
                </button>
              </div>
            </div>
          </div>

          {/* Side Navigation */}
          <div className='pointer-events-none absolute inset-y-0 right-0 left-0 flex items-center justify-between px-4'>
            {/* Previous Button */}
            <button
              onClick={previousVideo}
              disabled={!hasPrevious}
              className={cn(
                'bg-card/10 text-foreground/80 pointer-events-auto rounded-full p-3 backdrop-blur-md transition-all',
                'hover:bg-card/20 hover:scale-110',
                'disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:scale-100',
                !hasPrevious && 'invisible'
              )}
              aria-label='Previous video'
            >
              <ChevronLeft className='h-8 w-8' />
            </button>

            {/* Next Button */}
            <button
              onClick={nextVideo}
              disabled={!hasNext}
              className={cn(
                'bg-card/10 text-foreground/80 pointer-events-auto rounded-full p-3 backdrop-blur-md transition-all',
                'hover:bg-card/20 hover:scale-110',
                'disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:scale-100',
                !hasNext && 'invisible'
              )}
              aria-label='Next video'
            >
              <ChevronRight className='h-8 w-8' />
            </button>
          </div>
        </div>

        {/* Video Container */}
        <div
          className={cn(
            'bg-background relative overflow-hidden rounded-2xl shadow-2xl',
            'transform transition-all duration-500',
            isPlayerOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
            isFullscreen ? 'h-full w-full rounded-none' : 'w-full max-w-6xl'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Decorative Border */}
          <div className='from-primary/20 to-secondary/20 pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br via-transparent' />

          {/* Video Embed */}
          <div
            className={cn('relative', isFullscreen ? 'h-full' : 'aspect-video')}
          >
            {/* Loading Experience */}
            {isLoading && loaderType === 'countdown' && (
              <CinematicVideoLoader
                videoTitle={selectedVideo?.title}
                onLoadComplete={() => {
                  setIsLoading(false)
                  setShouldAutoplay(true)
                }}
              />
            )}
            {isLoading && loaderType === 'progress' && (
              <CinematicVideoLoader2
                videoTitle={selectedVideo?.title}
                onLoadComplete={() => {
                  setIsLoading(false)
                  setShouldAutoplay(true)
                }}
              />
            )}
            {isLoading && loaderType === 'projector' && (
              <CinematicVideoLoader3
                videoTitle={selectedVideo?.title}
                onLoadComplete={() => {
                  setIsLoading(false)
                  setShouldAutoplay(true)
                }}
              />
            )}

            <CinematicVideoEmbed
              videoId={selectedVideo.id}
              title={selectedVideo.title}
              className={cn(isLoading && 'opacity-0')}
              autoplay={shouldAutoplay}
              muted={isMuted}
              onPlay={() => setShouldAutoplay(false)}
            />
          </div>
        </div>

        {/* Progress Thumbnails (Bottom) - Always visible when not fullscreen */}
        {!isFullscreen && (
          <div
            className='bg-background/95 border-border/20 pointer-events-auto fixed right-4 bottom-4 left-4 z-30 rounded-xl border p-6 backdrop-blur-xl'
            onClick={(e) => e.stopPropagation()}
          >
            <div
              ref={thumbnailContainerRef}
              className='scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent mx-auto flex max-w-7xl items-center gap-3 overflow-x-auto px-4 pt-2 pb-2'
              style={{ scrollBehavior: 'smooth' }}
            >
              {allVideos.map((video, idx) => {
                const isCurrentVideo = idx === currentIndex
                return (
                  <button
                    key={video.id}
                    ref={(el) => {
                      if (el) thumbnailRefs.current.set(video.id, el)
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      selectVideo(video)
                    }}
                    className={cn(
                      'group relative flex-shrink-0 cursor-pointer overflow-hidden rounded-lg transition-all duration-300',
                      'hover:ring-primary/50 hover:ring-2 hover:brightness-110',
                      'focus:ring-primary/50 focus:ring-2 focus:outline-none',
                      isCurrentVideo
                        ? [
                            'ring-primary shadow-primary/30 aspect-video w-32 shadow-lg ring-2',
                            'scale-100',
                          ]
                        : ['aspect-video w-24', 'hover:scale-105']
                    )}
                  >
                    <img
                      src={
                        video.thumbnail ||
                        getYouTubeThumbnail(video.id, 'maxresdefault')
                      }
                      alt={video.title}
                      className='h-full w-full object-cover'
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        if (target.src.includes('maxresdefault')) {
                          target.src = getYouTubeThumbnail(video.id, 'high')
                        } else if (target.src.includes('hqdefault')) {
                          target.src = getYouTubeThumbnail(video.id, 'medium')
                        }
                      }}
                    />
                    {isCurrentVideo ? (
                      <div className='bg-primary/20 absolute inset-0' />
                    ) : (
                      <div className='bg-background/40 absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100'>
                        <Play className='text-foreground fill-foreground h-4 w-4' />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
