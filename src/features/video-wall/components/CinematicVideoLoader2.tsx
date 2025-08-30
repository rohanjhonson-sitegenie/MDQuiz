import { useEffect, useState } from 'react'

interface CinematicVideoLoader2Props {
  videoTitle?: string
  onLoadComplete?: () => void
}

export function CinematicVideoLoader2({
  videoTitle = '',
  onLoadComplete = () => {},
}: CinematicVideoLoader2Props = {}) {
  const [progress, setProgress] = useState(0)
  const [showLoader, setShowLoader] = useState(true)
  const letters = ['L', 'O', 'A', 'D', 'I', 'N', 'G']

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          setTimeout(() => {
            setShowLoader(false)
            onLoadComplete?.()
          }, 300)
          return 100
        }
        return prev + 2
      })
    }, 30)

    return () => clearInterval(progressInterval)
  }, [onLoadComplete])

  if (!showLoader) return null

  return (
    <div className='absolute inset-0 z-30 flex items-center justify-center'>
      {/* Dark overlay */}
      <div className='absolute inset-0 bg-black/90' />

      {/* Cinematic bars */}
      <div
        className='absolute inset-x-0 top-0 h-20 bg-black'
        style={{
          transform: `translateY(${progress < 50 ? 0 : -(progress - 50) * 2}%)`,
        }}
      />
      <div
        className='absolute inset-x-0 bottom-0 h-20 bg-black'
        style={{
          transform: `translateY(${progress < 50 ? 0 : (progress - 50) * 2}%)`,
        }}
      />

      {/* Animated grid background */}
      <div className='absolute inset-0 overflow-hidden opacity-20'>
        <div
          className='absolute inset-0'
          style={{
            backgroundImage: `
              linear-gradient(rgba(147, 51, 234, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(147, 51, 234, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            transform: `translateX(${progress * 0.5}px) translateY(${progress * 0.5}px)`,
          }}
        />
      </div>

      {/* Main content */}
      <div className='relative z-10 flex flex-col items-center space-y-12'>
        {/* Animated letters */}
        <div className='flex space-x-3'>
          {letters.map((letter, index) => (
            <div
              key={index}
              className='relative'
              style={{
                animation: `float 2s ease-in-out ${index * 0.1}s infinite`,
              }}
            >
              <span
                className='text-5xl font-bold text-white/90 select-none'
                style={{
                  textShadow: '0 0 20px rgba(147, 51, 234, 0.5)',
                  opacity: progress > index * 14 ? 1 : 0.2,
                  transition: 'opacity 0.5s',
                }}
              >
                {letter}
              </span>
              {/* Letter glow */}
              <div
                className='absolute inset-0 blur-xl'
                style={{
                  background: `radial-gradient(circle, rgba(147, 51, 234, ${progress > index * 14 ? 0.4 : 0}) 0%, transparent 70%)`,
                }}
              />
            </div>
          ))}
        </div>

        {/* Video title */}
        {videoTitle && (
          <h3
            className='line-clamp-2 max-w-md text-center text-lg font-medium text-white/60'
            style={{ opacity: progress > 20 ? 1 : 0, transition: 'opacity 1s' }}
          >
            {videoTitle}
          </h3>
        )}

        {/* Progress visualization */}
        <div className='relative'>
          {/* Circular progress */}
          <svg className='h-24 w-24 -rotate-90 transform'>
            <circle
              cx='48'
              cy='48'
              r='40'
              fill='none'
              stroke='rgba(255, 255, 255, 0.1)'
              strokeWidth='4'
            />
            <circle
              cx='48'
              cy='48'
              r='40'
              fill='none'
              stroke='url(#progressGradient)'
              strokeWidth='4'
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress / 100)}`}
              strokeLinecap='round'
              className='transition-all duration-100'
            />
            <defs>
              <linearGradient
                id='progressGradient'
                x1='0%'
                y1='0%'
                x2='100%'
                y2='100%'
              >
                <stop offset='0%' stopColor='#9333ea' />
                <stop offset='50%' stopColor='#ec4899' />
                <stop offset='100%' stopColor='#3b82f6' />
              </linearGradient>
            </defs>
          </svg>

          {/* Center percentage */}
          <div className='absolute inset-0 flex items-center justify-center'>
            <span className='text-2xl font-bold text-white/80'>
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* Glitch effect text */}
        <div className='relative'>
          <span
            className='font-mono text-sm tracking-wider text-white/40'
            style={{
              animation: progress > 80 ? 'glitch 0.5s infinite' : 'none',
            }}
          >
            INITIALIZING PLAYBACK
          </span>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes glitch {
          0%, 100% { 
            text-shadow: 
              0.05em 0 0 rgba(255, 0, 0, 0.75),
              -0.025em -0.05em 0 rgba(0, 255, 0, 0.75),
              0.025em 0.05em 0 rgba(0, 0, 255, 0.75);
          }
          14% {
            text-shadow: 
              0.05em 0 0 rgba(255, 0, 0, 0.75),
              -0.05em -0.025em 0 rgba(0, 255, 0, 0.75),
              0.025em 0.05em 0 rgba(0, 0, 255, 0.75);
          }
          15% {
            text-shadow: 
              -0.05em -0.025em 0 rgba(255, 0, 0, 0.75),
              0.025em 0.025em 0 rgba(0, 255, 0, 0.75),
              -0.05em -0.05em 0 rgba(0, 0, 255, 0.75);
          }
          49% {
            text-shadow: 
              -0.05em -0.025em 0 rgba(255, 0, 0, 0.75),
              0.025em 0.025em 0 rgba(0, 255, 0, 0.75),
              -0.05em -0.05em 0 rgba(0, 0, 255, 0.75);
          }
          50% {
            text-shadow: 
              0.025em 0.05em 0 rgba(255, 0, 0, 0.75),
              0.05em 0 0 rgba(0, 255, 0, 0.75),
              0 -0.05em 0 rgba(0, 0, 255, 0.75);
          }
          99% {
            text-shadow: 
              0.025em 0.05em 0 rgba(255, 0, 0, 0.75),
              0.05em 0 0 rgba(0, 255, 0, 0.75),
              0 -0.05em 0 rgba(0, 0, 255, 0.75);
          }
        }
      `}</style>
    </div>
  )
}
