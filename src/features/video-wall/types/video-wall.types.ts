export interface YouTubeVideo {
  id: string
  title: string
  thumbnail: string
  duration?: string
  publishedAt?: string
}

export interface VideoWallContextType {
  selectedVideo: YouTubeVideo | null
  isPlayerOpen: boolean
  allVideos: YouTubeVideo[]
  currentIndex: number
  selectVideo: (video: YouTubeVideo) => void
  closePlayer: () => void
  nextVideo: () => void
  previousVideo: () => void
  registerVideos: (videos: YouTubeVideo[]) => void
}

export interface PlaylistData {
  videos: YouTubeVideo[]
  loading: boolean
  error: string | null
}

export interface VideoPlaylistGridProps {
  playlistId: string
  title?: string
  columns?: number
  maxVideos?: number
}
