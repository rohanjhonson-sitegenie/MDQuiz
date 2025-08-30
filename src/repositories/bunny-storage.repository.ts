import type {
  UploadResponse,
  ListResponse,
  ImageTransformOptions,
} from '@/types/bunny-storage.types'
import { supabase } from '@/lib/supabase'

export interface IStorageRepository {
  upload(file: File, path?: string): Promise<UploadResponse>
  delete(path: string): Promise<void>
  list(prefix?: string): Promise<ListResponse>
  getPublicUrl(path: string, options?: ImageTransformOptions): string
}

export class BunnyStorageRepository implements IStorageRepository {
  private cdnUrl: string
  private apiUrl: string

  constructor() {
    this.cdnUrl = import.meta.env.VITE_BUNNY_CDN_URL || ''
    this.apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
  }

  isConfigured(): boolean {
    return !!this.cdnUrl
  }

  private async getAuthToken(): Promise<string> {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      throw new Error('Not authenticated')
    }
    return session.access_token
  }

  async upload(file: File, path?: string): Promise<UploadResponse> {
    try {
      const token = await this.getAuthToken()
      const formData = new FormData()
      formData.append('file', file)

      // If no path is provided, we'll let the server generate a UUID-based path
      if (path) {
        formData.append('path', path)
      }

      const response = await fetch(`${this.apiUrl}/api/storage/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      return await response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async delete(path: string): Promise<void> {
    try {
      const token = await this.getAuthToken()

      const response = await fetch(`${this.apiUrl}/api/storage/delete`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Delete failed')
      }
    } catch (error) {
      this.handleError(error)
    }
  }

  async list(prefix?: string): Promise<ListResponse> {
    try {
      const token = await this.getAuthToken()
      const url = new URL(`${this.apiUrl}/api/storage/list`)
      if (prefix) {
        url.searchParams.set('path', prefix)
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'List failed')
      }

      return await response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  getPublicUrl(path: string, options?: ImageTransformOptions): string {
    if (!path) return ''

    // Check if CDN is configured
    if (!this.cdnUrl) {
      throw new Error('Bunny CDN URL not configured')
    }

    // If already a full URL, just add transforms
    if (path.startsWith('http://') || path.startsWith('https://')) {
      if (!options) return path
      const url = new URL(path)
      this.applyTransforms(url, options)
      return url.toString()
    }

    // Build URL from CDN base
    const cleanPath = path.startsWith('/') ? path.slice(1) : path
    const url = new URL(`${this.cdnUrl}/${cleanPath}`)

    if (options) {
      this.applyTransforms(url, options)
    }

    return url.toString()
  }

  private applyTransforms(url: URL, options: ImageTransformOptions): void {
    if (options.width) {
      url.searchParams.set('width', options.width.toString())
    }
    if (options.height) {
      url.searchParams.set('height', options.height.toString())
    }
    if (options.quality) {
      url.searchParams.set('quality', options.quality.toString())
    }
    if (options.format) {
      url.searchParams.set('format', options.format)
    }
    if (options.mode) {
      url.searchParams.set('mode', options.mode)
    }
    if (options.crop_gravity) {
      url.searchParams.set('crop_gravity', options.crop_gravity)
    }
  }

  private handleError(error: unknown): never {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('An unknown storage error occurred')
  }
}

// Singleton instance
export const bunnyStorage = new BunnyStorageRepository()
