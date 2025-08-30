import React, { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface CinematicVideoEmbedProps {
  videoId: string
  title?: string
  className?: string
  autoplay?: boolean
  muted?: boolean
  onReady?: () => void
  onPlay?: () => void
}

export const CinematicVideoEmbed: React.FC<CinematicVideoEmbedProps> = ({
  videoId,
  title,
  className,
  autoplay = true,
  muted = false,
  onReady,
  onPlay,
}) => {
  const [isReady, setIsReady] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Build YouTube URL with parameters
  const embedUrl = (() => {
    const params = new URLSearchParams({
      autoplay: autoplay ? '1' : '0',
      mute: muted ? '1' : '0',
      controls: '1',
      modestbranding: '1',
      rel: '0',
      showinfo: '0',
      iv_load_policy: '3',
      enablejsapi: '1',
      origin: window.location.origin,
    })
    return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`
  })()

  useEffect(() => {
    // YouTube requires user interaction for autoplay with sound
    // We'll try to trigger autoplay after the iframe loads
    const handleLoad = () => {
      setIsReady(true)
      onReady?.()

      // If autoplay is enabled, attempt to play with a slight delay
      if (autoplay && iframeRef.current) {
        // Small delay to ensure YouTube player is fully initialized
        setTimeout(() => {
          if (iframeRef.current) {
            // Send play command to YouTube iframe
            iframeRef.current.contentWindow?.postMessage(
              '{"event":"command","func":"playVideo","args":""}',
              'https://www.youtube-nocookie.com'
            )
          }
        }, 100)
      }
    }

    const iframe = iframeRef.current
    if (iframe) {
      iframe.addEventListener('load', handleLoad)
      return () => iframe.removeEventListener('load', handleLoad)
    }
  }, [autoplay, onReady, onPlay])

  // Handle iframe messages from YouTube
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://www.youtube-nocookie.com') return

      try {
        const data = JSON.parse(event.data)
        if (data.event === 'onStateChange' && data.info === 1) {
          // Video is playing
          onPlay?.()
        }
      } catch {
        // Ignore non-JSON messages
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [onPlay])

  return (
    <div className={cn('relative h-full w-full', className)}>
      <iframe
        ref={iframeRef}
        src={embedUrl}
        title={title || `YouTube video ${videoId}`}
        className='absolute inset-0 h-full w-full'
        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
        allowFullScreen
        loading='eager'
      />

      {/* Invisible click target to ensure autoplay on interaction */}
      {!isReady && autoplay && (
        <div
          className='absolute inset-0 z-10 cursor-pointer'
          onClick={() => {
            if (iframeRef.current) {
              iframeRef.current.contentWindow?.postMessage(
                '{"event":"command","func":"playVideo","args":""}',
                'https://www.youtube-nocookie.com'
              )
            }
          }}
        />
      )}
    </div>
  )
}
