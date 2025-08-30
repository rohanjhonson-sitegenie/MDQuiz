import { useState, useEffect } from 'react'
import type { PlaylistData, YouTubeVideo } from '../types/video-wall.types'

// YouTube API response types
interface YouTubePlaylistItem {
  contentDetails: {
    videoId: string
  }
  snippet: {
    title: string
    publishedAt: string
    thumbnails: {
      high: {
        url: string
      }
    }
  }
}

interface YouTubeVideoItem {
  id: string
  contentDetails: {
    duration: string
  }
}

interface YouTubePlaylistResponse {
  items: YouTubePlaylistItem[]
}

interface YouTubeVideosResponse {
  items: YouTubeVideoItem[]
}

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3'

function parseDuration(duration: string): string {
  // Convert ISO 8601 duration to readable format
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return '0:00'

  const hours = parseInt(match[1] || '0')
  const minutes = parseInt(match[2] || '0')
  const seconds = parseInt(match[3] || '0')

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function useYouTubePlaylist(playlistId: string): PlaylistData {
  const [data, setData] = useState<PlaylistData>({
    videos: [],
    loading: true,
    error: null,
  })

  useEffect(() => {
    const fetchPlaylistVideos = async () => {
      // Check if API key is configured
      if (!YOUTUBE_API_KEY) {
        setData({
          videos: [],
          loading: false,
          error: 'YouTube API key not configured',
        })
        return
      }

      try {
        // Fetch playlist items
        const playlistResponse = await fetch(
          `${YOUTUBE_API_BASE}/playlistItems?` +
            `part=snippet,contentDetails&` +
            `playlistId=${playlistId}&` +
            `maxResults=50&` +
            `key=${YOUTUBE_API_KEY}`
        )

        if (!playlistResponse.ok) {
          throw new Error('Failed to fetch playlist')
        }

        const playlistData: YouTubePlaylistResponse =
          await playlistResponse.json()
        const videoIds = playlistData.items
          .map((item) => item.contentDetails.videoId)
          .join(',')

        // Fetch video details for duration
        const videosResponse = await fetch(
          `${YOUTUBE_API_BASE}/videos?` +
            `part=contentDetails&` +
            `id=${videoIds}&` +
            `key=${YOUTUBE_API_KEY}`
        )

        if (!videosResponse.ok) {
          throw new Error('Failed to fetch video details')
        }

        const videosData: YouTubeVideosResponse = await videosResponse.json()
        const durationMap = new Map(
          videosData.items.map((item) => [
            item.id,
            parseDuration(item.contentDetails.duration),
          ])
        )

        // Map to our video format
        const videos: YouTubeVideo[] = playlistData.items.map((item) => ({
          id: item.contentDetails.videoId,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.high.url,
          duration: durationMap.get(item.contentDetails.videoId) || '',
          publishedAt: item.snippet.publishedAt,
        }))

        setData({
          videos,
          loading: false,
          error: null,
        })
      } catch (_error) {
        // Log error silently in production
        setData({
          videos: [],
          loading: false,
          error: 'Failed to load playlist videos',
        })
      }
    }

    fetchPlaylistVideos()
  }, [playlistId])

  return data
}
