export interface StorageConfig {
  cdnUrl: string
  apiUrl: string
  isDevelopment: boolean
}

export function getStorageConfig(): StorageConfig {
  return {
    cdnUrl: import.meta.env.VITE_BUNNY_CDN_URL || '',
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001',
    isDevelopment: import.meta.env.DEV || false,
  }
}

export function isStorageConfigured(): boolean {
  const config = getStorageConfig()
  return !!config.cdnUrl
}
