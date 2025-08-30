import { createContext } from 'react'
import type { VideoWallContextType } from '../types/video-wall.types'

export const VideoWallContext = createContext<VideoWallContextType | undefined>(
  undefined
)
