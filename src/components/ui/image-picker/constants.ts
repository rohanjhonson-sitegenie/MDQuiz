export const IMAGE_PICKER_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 20,
  DEFAULT_RECENT_COUNT: 4,
  DEFAULT_MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  DEFAULT_ACCEPTED_TYPES: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
  ],
  GRID_COLUMNS: {
    desktop: 4,
    tablet: 3,
    mobile: 2,
  },
  THUMBNAIL_SIZE: {
    width: 200,
    height: 150,
  },
} as const

export const DIALOG_SIZES = {
  landscape: {
    width: '1200px',
    height: '900px',
    aspectRatio: '4/3',
  },
  portrait: {
    width: '600px',
    height: 'auto',
    maxHeight: '85vh',
  },
  fullscreen: {
    width: '95vw',
    height: '90vh',
    maxWidth: '1400px',
    maxHeight: '900px',
  },
} as const
