export const storageConfig = {
  bunny: {
    cdnUrl: import.meta.env.VITE_BUNNY_CDN_URL || '',
  },
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
    ],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
  },
  image: {
    defaultQuality: 85,
    defaultFormat: 'webp' as const,
    thumbnailSize: { width: 200, height: 200 },
    previewSize: { width: 800, height: 600 },
    responsiveWidths: [640, 768, 1024, 1280, 1536, 1920],
  },
} as const

export type StorageConfig = typeof storageConfig
