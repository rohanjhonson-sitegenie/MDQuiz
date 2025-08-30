export interface BlogMetadata {
  title: string
  excerpt?: string
  author: string
  date: string
  tags?: string[]
  featuredImage?: string
  draft?: boolean
}

export interface BlogPost {
  id?: string
  slug: string
  title: string
  content: string
  excerpt?: string
  author: string
  featured_image?: string
  published_at?: string
  created_at?: string
  updated_at?: string
  reading_time?: number
  draft?: boolean
  seo_title?: string
  seo_description?: string
  seo_keywords?: string[]
  metadata?: BlogMetadata
}

export interface BlogTag {
  id: string
  name: string
  slug: string
}

export interface BlogListItem {
  id: string
  slug: string
  title: string
  excerpt?: string
  author: string
  tags: BlogTag[]
  featuredImage?: string
  publishedAt: Date
  readingTime?: number
  draft?: boolean
}

export interface BlogFilters {
  search?: string
  tags?: string[]
  limit?: number
  offset?: number
  includeDrafts?: boolean
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
  seo_title?: string
  seo_description?: string
  seo_keywords?: string[]
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
  seo_title?: string
  seo_description?: string
  seo_keywords?: string[]
}
