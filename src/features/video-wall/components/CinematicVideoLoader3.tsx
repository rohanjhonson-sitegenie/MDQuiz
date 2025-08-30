import { useEffect, useState } from 'react'
import { Film } from 'lucide-react'

interface CinematicVideoLoader3Props {
  videoTitle?: string
  onLoadComplete?: () => void
}

export function CinematicVideoLoader3({
  videoTitle = '',
  onLoadComplete = () => {},
}: CinematicVideoLoader3Props = {}) {
  const [frame, setFrame] = useState(0)
  const [showLoader, setShowLoader] = useState(true)
  const [lightBeamOpacity, setLightBeamOpacity] = useState(0)

  useEffect(() => {
    // Film reel animation
    const frameInterval = setInterval(() => {
      setFrame((prev) => (prev + 1) % 8)
    }, 100)

    // Light beam fade in
    const fadeTimeout = setTimeout(() => {
      setLightBeamOpacity(1)
    }, 500)

    // Complete loading
    const completeTimeout = setTimeout(() => {
      setShowLoader(false)
      onLoadComplete?.()
    }, 3000)

    return () => {
      clearInterval(frameInterval)
      clearTimeout(fadeTimeout)
      clearTimeout(completeTimeout)
    }
  }, [onLoadComplete])

  if (!showLoader) return null

  return (
    <div className='absolute inset-0 z-30 flex items-center justify-center'>
      {/* Theatre curtain effect */}
      <div className='absolute inset-0 bg-gradient-to-b from-red-950/90 via-black/95 to-black' />

      {/* Film grain overlay */}
      <div
        className='absolute inset-0 opacity-30'
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          animation: 'grain 0.5s infinite',
        }}
      />

      {/* Projector light beam */}
      <div
        className='absolute top-0 left-1/2 h-full w-[600px] -translate-x-1/2 opacity-0 transition-opacity duration-1000'
        style={{ opacity: lightBeamOpacity }}
      >
        <div
          className='absolute inset-0'
          style={{
            background: `linear-gradient(to bottom, 
              transparent 0%, 
              rgba(255, 255, 255, 0.02) 10%,
              rgba(255, 255, 255, 0.05) 50%,
              rgba(255, 255, 255, 0.02) 90%,
              transparent 100%
            )`,
            clipPath: 'polygon(45% 0%, 55% 0%, 65% 100%, 35% 100%)',
            filter: 'blur(20px)',
          }}
        />
        {/* Light particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className='absolute h-1 w-1 rounded-full bg-white'
            style={{
              top: `${Math.random() * 100}%`,
              left: `${45 + Math.random() * 10}%`,
              opacity: Math.random() * 0.5,
              animation: `float-particle ${3 + Math.random() * 2}s linear infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className='relative z-10 flex flex-col items-center space-y-8'>
        {/* Film projector */}
        <div className='relative'>
          {/* Projector body */}
          <div className='h-24 w-32 rounded-lg bg-gradient-to-b from-gray-800 to-gray-900 shadow-2xl'>
            {/* Lens */}
            <div className='absolute top-1/2 -right-4 h-12 w-12 -translate-y-1/2 rounded-full bg-gradient-to-r from-gray-700 to-gray-800 shadow-lg'>
              <div className='absolute inset-2 animate-pulse rounded-full bg-gradient-to-br from-blue-400 to-purple-600' />
            </div>
          </div>

          {/* Film reels */}
          <div className='absolute -top-4 left-2 h-16 w-16'>
            <svg
              className='animate-spin-slow h-full w-full'
              viewBox='0 0 64 64'
            >
              <circle
                cx='32'
                cy='32'
                r='30'
                fill='none'
                stroke='rgba(255,255,255,0.2)'
                strokeWidth='2'
              />
              <circle
                cx='32'
                cy='32'
                r='20'
                fill='none'
                stroke='rgba(255,255,255,0.2)'
                strokeWidth='2'
              />
              <circle cx='32' cy='32' r='10' fill='rgba(255,255,255,0.1)' />
              {Array.from({ length: 8 }).map((_, i) => (
                <rect
                  key={i}
                  x='31'
                  y='2'
                  width='2'
                  height='28'
                  fill='rgba(255,255,255,0.2)'
                  transform={`rotate(${i * 45} 32 32)`}
                />
              ))}
            </svg>
          </div>

          <div className='absolute -top-4 right-2 h-16 w-16'>
            <svg
              className='animate-spin-slow h-full w-full'
              style={{ animationDirection: 'reverse' }}
              viewBox='0 0 64 64'
            >
              <circle
                cx='32'
                cy='32'
                r='30'
                fill='none'
                stroke='rgba(255,255,255,0.2)'
                strokeWidth='2'
              />
              <circle
                cx='32'
                cy='32'
                r='20'
                fill='none'
                stroke='rgba(255,255,255,0.2)'
                strokeWidth='2'
              />
              <circle cx='32' cy='32' r='10' fill='rgba(255,255,255,0.1)' />
              {Array.from({ length: 8 }).map((_, i) => (
                <rect
                  key={i}
                  x='31'
                  y='2'
                  width='2'
                  height='28'
                  fill='rgba(255,255,255,0.2)'
                  transform={`rotate(${i * 45} 32 32)`}
                />
              ))}
            </svg>
          </div>
        </div>

        {/* Film strip */}
        <div className='relative h-16 w-64 overflow-hidden rounded-sm bg-black/50'>
          <div
            className='absolute inset-y-0 flex transition-transform duration-100'
            style={{ transform: `translateX(-${frame * 80}px)` }}
          >
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className='h-full w-20 flex-shrink-0 p-1'>
                <div className='h-full w-full rounded-sm bg-gradient-to-br from-purple-900/30 to-blue-900/30'>
                  <div className='flex h-full w-full items-center justify-center'>
                    <Film className='h-8 w-8 text-white/20' />
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Perforations */}
          <div className='absolute top-0 right-0 left-0 flex h-2 justify-around'>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className='h-1 w-1 rounded-full bg-white/30' />
            ))}
          </div>
          <div className='absolute right-0 bottom-0 left-0 flex h-2 justify-around'>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className='h-1 w-1 rounded-full bg-white/30' />
            ))}
          </div>
        </div>

        {/* Title and status */}
        <div className='max-w-md space-y-2 text-center'>
          {videoTitle && (
            <h3 className='line-clamp-2 text-lg font-medium text-white/80'>
              {videoTitle}
            </h3>
          )}
          <p className='animate-pulse font-mono text-sm tracking-wider text-white/50'>
            PROJECTING...
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes float-particle {
          from { 
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.5;
          }
          90% {
            opacity: 0.5;
          }
          to { 
            transform: translateY(-100vh) translateX(${Math.random() * 20 - 10}px);
            opacity: 0;
          }
        }
        
        @keyframes grain {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-1%, -1%); }
          20% { transform: translate(1%, 1%); }
          30% { transform: translate(-1%, 1%); }
          40% { transform: translate(1%, -1%); }
          50% { transform: translate(-1%, -1%); }
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  )
}
