import React, { useState, useCallback } from 'react'
import { VideoWallContext } from '../context/video-wall-context'
import type { YouTubeVideo } from '../types/video-wall.types'

interface VideoWallProviderProps {
  children: React.ReactNode
}

export function VideoWallProvider({ children }: VideoWallProviderProps) {
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null)
  const [isPlayerOpen, setIsPlayerOpen] = useState(false)
  const [allVideos, setAllVideos] = useState<YouTubeVideo[]>([])
  const [currentIndex, setCurrentIndex] = useState(-1)

  const registerVideos = useCallback((videos: YouTubeVideo[]) => {
    setAllVideos((prev) => {
      // Merge new videos, avoiding duplicates
      const existingIds = new Set(prev.map((v) => v.id))
      const newVideos = videos.filter((v) => !existingIds.has(v.id))
      return [...prev, ...newVideos]
    })
  }, [])

  const selectVideo = useCallback(
    (video: YouTubeVideo) => {
      const index = allVideos.findIndex((v) => v.id === video.id)
      setCurrentIndex(index)
      setSelectedVideo(video)
      setIsPlayerOpen(true)
    },
    [allVideos]
  )

  const closePlayer = useCallback(() => {
    setIsPlayerOpen(false)
    // Keep selectedVideo for animation purposes
    setTimeout(() => {
      setSelectedVideo(null)
      setCurrentIndex(-1)
    }, 200)
  }, [])

  const nextVideo = useCallback(() => {
    if (currentIndex < allVideos.length - 1) {
      const nextIndex = currentIndex + 1
      setCurrentIndex(nextIndex)
      setSelectedVideo(allVideos[nextIndex])
    }
  }, [currentIndex, allVideos])

  const previousVideo = useCallback(() => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1
      setCurrentIndex(prevIndex)
      setSelectedVideo(allVideos[prevIndex])
    }
  }, [currentIndex, allVideos])

  const value = {
    selectedVideo,
    isPlayerOpen,
    allVideos,
    currentIndex,
    selectVideo,
    closePlayer,
    nextVideo,
    previousVideo,
    registerVideos,
  }

  return (
    <VideoWallContext.Provider value={value}>
      {children}
    </VideoWallContext.Provider>
  )
}
