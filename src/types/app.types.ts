// Auto-generated database types
import { Database } from './database.types'

// Core entity types from database
export type Profile = Database['public']['Tables']['profiles']['Row']
export type BlogPost = Database['public']['Tables']['blog_posts']['Row']
export type BlogTag = Database['public']['Tables']['blog_tags']['Row']
export type Application = Database['public']['Tables']['applications']['Row']

// Insert types for creating new records
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type BlogPostInsert =
  Database['public']['Tables']['blog_posts']['Insert']
export type BlogTagInsert = Database['public']['Tables']['blog_tags']['Insert']
export type ApplicationInsert =
  Database['public']['Tables']['applications']['Insert']

// Update types for partial updates
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type BlogPostUpdate =
  Database['public']['Tables']['blog_posts']['Update']
export type BlogTagUpdate = Database['public']['Tables']['blog_tags']['Update']
export type ApplicationUpdate =
  Database['public']['Tables']['applications']['Update']

// Common utility types
export type Json = Database['public']['Tables']['blog_posts']['Row']['seo'] // Use JSON column from blog_posts

// API response types (keep these as they're API layer abstractions)
export interface ApiResponse<T> {
  data: T | null
  error: Error | null
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
  totalPages: number
}

export interface QueryOptions {
  page?: number
  pageSize?: number
  orderBy?: string
  order?: 'asc' | 'desc'
}

// Profile-specific types that extend the base type
export interface ProfileFilters {
  role?: Profile['role']
  search?: string
  limit?: number
  offset?: number
}

export interface UpdateProfileDto {
  display_name?: string
  given_name?: string | null
  family_name?: string | null
  avatar_url?: string | null
  role?: Profile['role']
}

export interface InviteUserDto {
  email: string
  role?: Profile['role']
}

// Blog-specific types that extend the base types
export interface BlogFilters {
  search?: string
  tags?: string[]
  limit?: number
  offset?: number
  includeDrafts?: boolean
}

export interface BlogMetadata {
  title: string
  excerpt?: string
  author: string
  date: string
  tags?: string[]
  featuredImage?: string
  draft?: boolean
}

export interface BlogListItem {
  id: string
  slug: string
  title: string
  excerpt?: string | null
  author: string
  tags: BlogTag[]
  featuredImage?: string | null
  publishedAt: Date
  readingTime?: number | null
  draft?: boolean | null
}

export interface CreateBlogPostDto {
  title: string
  slug?: string
  content: string
  excerpt?: string
  author: string
  tags: string[]
  featuredImage?: File
  draft?: boolean
  seo?: {
    title?: string
    description?: string
    keywords?: string[]
  }
}

export interface UpdateBlogPostDto {
  title?: string
  slug?: string
  content?: string
  excerpt?: string
  author?: string
  tags?: string[]
  featuredImage?: File
  featured_image?: string
  draft?: boolean
  published_at?: string | null
  seo?: {
    title?: string
    description?: string
    keywords?: string[]
  }
}
