import { useEffect, useRef } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { VideoEmbed } from '@/features/blog/api'
import { useVideoWall } from '../hooks/useVideoWall'

export function VideoPlayer() {
  const {
    selectedVideo,
    isPlayerOpen,
    closePlayer,
    nextVideo,
    previousVideo,
    currentIndex,
    allVideos,
  } = useVideoWall()

  const hasNext = currentIndex < allVideos.length - 1
  const hasPrevious = currentIndex > 0
  const scrollPositionRef = useRef<number>(0)

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (!isPlayerOpen) return

      switch (e.key) {
        case 'Escape':
          closePlayer()
          break
        case 'ArrowLeft':
          if (hasPrevious) previousVideo()
          break
        case 'ArrowRight':
          if (hasNext) nextVideo()
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
  ])

  // Prevent body scroll when lightbox is open and preserve scroll position
  useEffect(() => {
    if (isPlayerOpen) {
      // Save current scroll position before hiding overflow
      scrollPositionRef.current =
        window.scrollY || document.documentElement.scrollTop

      // Prevent scroll by fixing the body position
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollPositionRef.current}px`
      document.body.style.width = '100%'
    } else {
      // Restore body position
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''

      // Restore scroll position after a small delay to ensure DOM is ready
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollPositionRef.current)
        // Also try with documentElement for better browser compatibility
        document.documentElement.scrollTop = scrollPositionRef.current
      })
    }

    return () => {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
    }
  }, [isPlayerOpen])

  if (!selectedVideo || !isPlayerOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-black/90 backdrop-blur-sm transition-opacity duration-300',
          isPlayerOpen ? 'opacity-100' : 'opacity-0'
        )}
        onClick={closePlayer}
        aria-hidden='true'
      />

      {/* Lightbox Content */}
      <div className='pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4'>
        <div
          className={cn(
            'bg-background pointer-events-auto relative w-full max-w-5xl rounded-lg shadow-2xl',
            'transform transition-all duration-300',
            isPlayerOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Controls */}
          <div className='absolute -top-12 right-0 left-0 flex items-center justify-between'>
            {/* Video Counter */}
            <div className='text-sm text-white/80'>
              {currentIndex + 1} / {allVideos.length}
            </div>

            {/* Close Button */}
            <button
              onClick={closePlayer}
              className='p-2 text-white/80 transition-colors hover:text-white'
              aria-label='Close video'
            >
              <X className='h-8 w-8' />
            </button>
          </div>

          {/* Navigation Buttons */}
          {hasPrevious && (
            <button
              onClick={previousVideo}
              className='absolute top-1/2 left-4 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white/80 transition-all hover:bg-black/70 hover:text-white'
              aria-label='Previous video'
            >
              <ChevronLeft className='h-8 w-8' />
            </button>
          )}

          {hasNext && (
            <button
              onClick={nextVideo}
              className='absolute top-1/2 right-4 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white/80 transition-all hover:bg-black/70 hover:text-white'
              aria-label='Next video'
            >
              <ChevronRight className='h-8 w-8' />
            </button>
          )}

          {/* Video Container */}
          <div className='relative overflow-hidden rounded-lg bg-black'>
            <VideoEmbed
              videoId={selectedVideo.id}
              title={selectedVideo.title}
              provider='youtube'
              className='my-0'
            />
          </div>

          {/* Video Title */}
          <div className='bg-background p-4'>
            <h2 className='line-clamp-2 text-lg font-semibold'>
              {selectedVideo.title}
            </h2>
          </div>
        </div>
      </div>
    </>
  )
}
