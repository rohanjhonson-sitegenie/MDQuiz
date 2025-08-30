import { useEffect, useState } from 'react'
import { Film, Play } from 'lucide-react'

interface CinematicVideoLoaderProps {
  videoTitle?: string
  onLoadComplete?: () => void
}

export function CinematicVideoLoader({
  videoTitle = '',
  onLoadComplete = () => {},
}: CinematicVideoLoaderProps = {}) {
  const [countdown, setCountdown] = useState(3)
  const [showLoader, setShowLoader] = useState(true)
  const [pulseScale, setPulseScale] = useState(1)

  useEffect(() => {
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval)
          setTimeout(() => {
            setShowLoader(false)
            onLoadComplete?.()
          }, 500)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Pulse animation
    const pulseInterval = setInterval(() => {
      setPulseScale((prev) => (prev === 1 ? 1.1 : 1))
    }, 500)

    return () => {
      clearInterval(countdownInterval)
      clearInterval(pulseInterval)
    }
  }, [onLoadComplete])

  if (!showLoader) return null

  return (
    <div className='absolute inset-0 z-30 flex items-center justify-center'>
      {/* Background effects */}
      <div className='absolute inset-0 bg-black/80 backdrop-blur-sm' />

      {/* Animated gradient background */}
      <div className='absolute inset-0 overflow-hidden'>
        <div className='animate-spin-slow absolute -top-1/2 -left-1/2 h-[200%] w-[200%]'>
          <div className='bg-gradient-conic absolute inset-0 from-purple-600/20 via-transparent to-blue-600/20' />
        </div>
      </div>

      {/* Film reel decorations */}
      <div className='absolute top-0 right-0 left-0 h-16 overflow-hidden opacity-20'>
        <div className='animate-slide-right flex'>
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className='mx-1 h-16 w-16 flex-shrink-0 rounded-sm border-2 border-white/30'
            >
              <div className='h-full w-full bg-white/10' />
            </div>
          ))}
        </div>
      </div>

      <div className='absolute right-0 bottom-0 left-0 h-16 overflow-hidden opacity-20'>
        <div className='animate-slide-left flex'>
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className='mx-1 h-16 w-16 flex-shrink-0 rounded-sm border-2 border-white/30'
            >
              <div className='h-full w-full bg-white/10' />
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className='relative z-10 flex flex-col items-center space-y-8'>
        {/* Countdown circle */}
        <div className='relative'>
          {/* Outer rings */}
          <div className='absolute inset-0 animate-ping rounded-full border-2 border-purple-500/30' />
          <div
            className='absolute inset-0 animate-ping rounded-full border-2 border-blue-500/30'
            style={{ animationDelay: '0.5s' }}
          />

          {/* Main circle */}
          <div
            className='relative flex h-32 w-32 items-center justify-center rounded-full border border-white/20 bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-md transition-transform duration-500'
            style={{ transform: `scale(${pulseScale})` }}
          >
            {/* Inner glow */}
            <div className='absolute inset-4 rounded-full bg-white/10 blur-xl' />

            {/* Countdown or play icon */}
            <div className='relative z-10'>
              {countdown > 0 ? (
                <span className='animate-pulse text-5xl font-bold text-white'>
                  {countdown}
                </span>
              ) : (
                <Play className='h-12 w-12 animate-pulse fill-white text-white' />
              )}
            </div>
          </div>

          {/* Rotating ring */}
          <svg className='animate-spin-slow absolute inset-0 h-32 w-32'>
            <circle
              cx='64'
              cy='64'
              r='62'
              fill='none'
              stroke='url(#gradient)'
              strokeWidth='2'
              strokeDasharray='20 10'
              opacity='0.5'
            />
            <defs>
              <linearGradient id='gradient' x1='0%' y1='0%' x2='100%' y2='100%'>
                <stop offset='0%' stopColor='#9333ea' />
                <stop offset='100%' stopColor='#3b82f6' />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Title and status */}
        <div className='max-w-md space-y-2 text-center'>
          {videoTitle && (
            <h3 className='line-clamp-2 text-lg font-medium text-white/90'>
              {videoTitle}
            </h3>
          )}
          <div className='flex items-center justify-center gap-2 text-white/60'>
            <Film className='h-4 w-4' />
            <span className='text-sm'>
              {countdown > 0
                ? 'Preparing your cinematic experience...'
                : 'Loading video...'}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className='h-1 w-64 overflow-hidden rounded-full bg-white/10'>
          <div
            className='h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-1000'
            style={{
              width: `${((3 - countdown) / 3) * 100}%`,
              boxShadow: '0 0 10px rgba(147, 51, 234, 0.5)',
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes slide-right {
          from { transform: translateX(0); }
          to { transform: translateX(100px); }
        }
        
        @keyframes slide-left {
          from { transform: translateX(0); }
          to { transform: translateX(-100px); }
        }
        
        @keyframes gradient-conic {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }
        
        .animate-slide-right {
          animation: slide-right 10s linear infinite;
        }
        
        .animate-slide-left {
          animation: slide-left 10s linear infinite;
        }
        
        .bg-gradient-conic {
          background: conic-gradient(from 0deg, rgba(147, 51, 234, 0.2), transparent, rgba(59, 130, 246, 0.2), transparent, rgba(147, 51, 234, 0.2));
        }
      `}</style>
    </div>
  )
}
