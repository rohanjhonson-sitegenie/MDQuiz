import { useContext } from 'react'
import { VideoWallContext } from '../context/video-wall-context'

export function useVideoWall() {
  const context = useContext(VideoWallContext)
  if (context === undefined) {
    throw new Error('useVideoWall must be used within a VideoWallProvider')
  }
  return context
}
