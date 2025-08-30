import type { ImagePreset } from '@/types/storage.types'

export const IMAGE_PRESETS: Record<string, ImagePreset> = {
  hero: {
    sizes: [1920, 1200, 768, 480],
    quality: 85,
    format: 'auto',
    fit: 'cover',
    aspectRatio: '16:9',
  },
  card: {
    sizes: [800, 400, 200],
    quality: 75,
    format: 'auto',
    fit: 'cover',
    aspectRatio: '16:9',
  },
  thumbnail: {
    sizes: [300, 150, 75],
    quality: 70,
    format: 'auto',
    fit: 'cover',
    aspectRatio: '1:1',
  },
  avatar: {
    sizes: [200, 100, 50],
    quality: 80,
    format: 'auto',
    fit: 'cover',
    gravity: 'center',
  },
  gallery: {
    sizes: [1200, 800, 400],
    quality: 80,
    format: 'auto',
    fit: 'contain',
  },
  inline: {
    sizes: [600, 400, 200],
    quality: 75,
    format: 'auto',
    fit: 'inside',
  },
  blog: {
    sizes: [1200, 800, 600, 400],
    quality: 80,
    format: 'auto',
    fit: 'inside',
    // No aspect ratio constraint for blog content images
    // to maintain original proportions
  },
}
