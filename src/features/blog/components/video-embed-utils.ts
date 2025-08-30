export type VideoProvider = 'youtube' | 'vimeo' | 'loom' | 'wistia'

interface VideoProviderConfig {
  getEmbedUrl: (id: string, options?: { privacyEnhanced?: boolean }) => string
  aspectRatio: string
  allowedParams?: string[]
}

export const VIDEO_PROVIDERS: Record<VideoProvider, VideoProviderConfig> = {
  youtube: {
    getEmbedUrl: (id, options) => {
      const domain = options?.privacyEnhanced
        ? 'https://www.youtube-nocookie.com'
        : 'https://www.youtube.com'
      return `${domain}/embed/${id}`
    },
    aspectRatio: '16/9',
    allowedParams: ['start', 'end', 'autoplay', 'mute', 'controls', 'loop'],
  },
  vimeo: {
    getEmbedUrl: (id) => `https://player.vimeo.com/video/${id}`,
    aspectRatio: '16/9',
    allowedParams: ['autoplay', 'muted', 'loop', 'title', 'byline', 'portrait'],
  },
  loom: {
    getEmbedUrl: (id) => `https://www.loom.com/embed/${id}`,
    aspectRatio: '16/9',
    allowedParams: [
      'hideEmbedTopBar',
      'hide_title',
      'hide_share',
      'hide_owner',
    ],
  },
  wistia: {
    getEmbedUrl: (id) => `https://fast.wistia.net/embed/iframe/${id}`,
    aspectRatio: '16/9',
    allowedParams: ['videoFoam', 'playerColor', 'fullscreenButton'],
  },
}

export function parseVideoUrl(url: string): {
  provider: VideoProvider | null
  videoId: string | null
} {
  if (!url) return { provider: null, videoId: null }

  // Check for protocol-based format (youtube:videoId)
  const protocolMatch = url.match(/^(youtube|vimeo|loom|wistia):(.+)$/)
  if (protocolMatch) {
    return {
      provider: protocolMatch[1] as VideoProvider,
      videoId: protocolMatch[2],
    }
  }

  // YouTube URL patterns
  const youtubePatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|m\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/, // Just the ID
  ]

  for (const pattern of youtubePatterns) {
    const match = url.match(pattern)
    if (match) {
      return { provider: 'youtube', videoId: match[1] }
    }
  }

  // Vimeo URL patterns
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) {
    return { provider: 'vimeo', videoId: vimeoMatch[1] }
  }

  // Loom URL patterns
  const loomMatch = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/)
  if (loomMatch) {
    return { provider: 'loom', videoId: loomMatch[1] }
  }

  // Wistia URL patterns
  const wistiaMatch = url.match(/wistia\.com\/medias\/([a-zA-Z0-9]+)/)
  if (wistiaMatch) {
    return { provider: 'wistia', videoId: wistiaMatch[1] }
  }

  return { provider: null, videoId: null }
}

export function convertInternalUrlToActual(url: string): string {
  // Parse the URL to get provider and video ID
  const parsed = parseVideoUrl(url)
  if (!parsed.provider || !parsed.videoId) {
    return url // Return as-is if not a valid video URL
  }

  // Convert to actual platform URL based on provider
  switch (parsed.provider) {
    case 'youtube':
      return `https://www.youtube.com/watch?v=${parsed.videoId}`
    case 'vimeo':
      return `https://vimeo.com/${parsed.videoId}`
    case 'loom':
      return `https://www.loom.com/share/${parsed.videoId}`
    case 'wistia':
      return `https://wistia.com/medias/${parsed.videoId}`
    default:
      return url
  }
}
