import { bunnyStorage } from '@/repositories/bunny-storage.repository'
import type {
  BlogPost,
  BlogListItem,
  BlogTag,
  BlogFilters,
  CreateBlogPostDto,
  UpdateBlogPostDto,
} from '@/types/app.types'
import { supabase } from '@/lib/supabase'
import { createContentHash } from '@/features/blog/lib/blog-utils'
import { BaseRepository } from './base.repository'

export class BlogsRepository extends BaseRepository {
  constructor() {
    super('blog_posts')
  }

  // SEO transformation helpers removed - now using direct JSON object structure

  private extractSeoFromJsonb(seo: unknown): {
    seo_title?: string
    seo_description?: string
    seo_keywords?: string[]
  } {
    if (!seo || typeof seo !== 'object') {
      return {}
    }

    const seoObj = seo as Record<string, unknown>

    return {
      seo_title: typeof seoObj.title === 'string' ? seoObj.title : undefined,
      seo_description:
        typeof seoObj.description === 'string' ? seoObj.description : undefined,
      seo_keywords: Array.isArray(seoObj.keywords)
        ? seoObj.keywords
        : undefined,
    }
  }

  async findAll(
    filters?: BlogFilters
  ): Promise<{ posts: BlogListItem[]; total: number }> {
    const {
      search,
      tags,
      limit = 10,
      offset = 0,
      includeDrafts = false,
    } = filters || {}

    let query = supabase
      .from(this.tableName)
      .select(
        `
        id,
        slug,
        title,
        excerpt,
        author,
        featured_image,
        published_at,
        reading_time,
        draft,
        blog_post_tags!left (
          tag_id
        )
      `,
        { count: 'exact' }
      )
      .order('published_at', { ascending: false })

    // Filter by draft status
    if (!includeDrafts) {
      query = query
        .eq('draft', false)
        .lte('published_at', new Date().toISOString())
    }

    // Apply search filter
    if (search) {
      query = query.or(
        `title.ilike.%${search}%,excerpt.ilike.%${search}%,content.ilike.%${search}%`
      )
    }

    // Apply tag filters
    if (tags && tags.length > 0) {
      // Use a subquery to filter posts that have the specified tags
      const { data: postsWithTags } = await supabase
        .from('blog_post_tags')
        .select('post_id')
        .in('tag_id', tags)

      const postIds = postsWithTags?.map((pt) => pt.post_id) || []

      if (postIds.length > 0) {
        query = query.in('id', postIds)
      } else {
        // If no posts have the specified tags, return empty result
        return { posts: [], total: 0 }
      }
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) this.handleError(error)

    // Get tags for each post
    const postIds = data?.map((post) => post.id) || []
    const { data: postTags } = await supabase
      .from('blog_post_tags')
      .select(
        `
        post_id,
        blog_tags (
          id,
          name,
          slug
        )
      `
      )
      .in('post_id', postIds)

    // Map posts with their tags
    const posts: BlogListItem[] =
      data?.map((post) => ({
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        author: post.author,
        featuredImage: post.featured_image,
        publishedAt: new Date(post.published_at),
        readingTime: post.reading_time,
        draft: post.draft,
        tags:
          postTags
            ?.filter((pt) => pt.post_id === post.id)
            ?.map((pt) => ({
              id:
                (
                  pt.blog_tags as {
                    id?: string
                    name?: string
                    slug?: string
                    created_at?: string
                  }
                )?.id || '',
              name:
                (
                  pt.blog_tags as {
                    id?: string
                    name?: string
                    slug?: string
                    created_at?: string
                  }
                )?.name || '',
              slug:
                (
                  pt.blog_tags as {
                    id?: string
                    name?: string
                    slug?: string
                    created_at?: string
                  }
                )?.slug || '',
              created_at:
                (
                  pt.blog_tags as {
                    id?: string
                    name?: string
                    slug?: string
                    created_at?: string
                  }
                )?.created_at || null,
            }))
            ?.filter(Boolean) || [],
      })) || []

    return {
      posts,
      total: count || 0,
    }
  }

  async findById(id: string): Promise<BlogPost> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single()

    if (error) this.handleError(error)

    // Get tags for this post - currently unused
    const { data: _postTags } = await supabase
      .from('blog_post_tags')
      .select(
        `
        blog_tags (
          name
        )
      `
      )
      .eq('post_id', data.id)

    // Tags processing removed - tags are handled separately

    return {
      ...data,
    }
  }

  async findBySlug(slug: string): Promise<BlogPost | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('slug', slug)
      .eq('draft', false)
      .single()

    if (error || !data) return null

    // Get tags for this post - currently unused
    const { data: _postTags } = await supabase
      .from('blog_post_tags')
      .select(
        `
        blog_tags (
          name
        )
      `
      )
      .eq('post_id', data.id)

    // Tags processing removed - tags are handled separately

    return {
      id: data.id,
      slug: data.slug,
      title: data.title,
      author: data.author,
      content: data.content || '',
      excerpt: data.excerpt,
      featured_image: data.featured_image,
      reading_time: data.reading_time,
      draft: data.draft,
      seo: data.seo,
      published_at: data.published_at,
      created_at: data.created_at,
      updated_at: data.updated_at,
      content_hash: data.content_hash,
    }
  }

  async getTags(): Promise<BlogTag[]> {
    const { data, error } = await supabase
      .from('blog_tags')
      .select('*')
      .order('name')

    if (error) this.handleError(error)
    return data as BlogTag[]
  }

  async checkSlugExists(slug: string, excludeId?: string): Promise<boolean> {
    let query = supabase.from(this.tableName).select('id').eq('slug', slug)

    if (excludeId) {
      query = query.neq('id', excludeId)
    }

    const { data, error } = await query

    if (error) this.handleError(error)
    return (data && data.length > 0) || false
  }

  async searchTags(query: string, limit: number = 10): Promise<BlogTag[]> {
    const { data, error } = await supabase
      .from('blog_tags')
      .select('*')
      .ilike('name', `%${query}%`)
      .order('name')
      .limit(limit)

    if (error) this.handleError(error)
    return data as BlogTag[]
  }

  async createTag(name: string): Promise<BlogTag> {
    const id = await this.ensureTag(name)
    const { data, error } = await supabase
      .from('blog_tags')
      .select('*')
      .eq('id', id)
      .single()

    if (error) this.handleError(error)
    return data as BlogTag
  }

  async getRelatedPosts(
    postId: string,
    limit: number = 3
  ): Promise<BlogListItem[]> {
    // Get current post tags
    const { data: currentTags } = await supabase
      .from('blog_post_tags')
      .select('tag_id')
      .eq('post_id', postId)

    const tagIds = currentTags?.map((t) => t.tag_id) || []

    if (tagIds.length === 0) return []

    // Find posts with similar tags
    const { data } = await supabase
      .from(this.tableName)
      .select(
        `
        id,
        slug,
        title,
        excerpt,
        author,
        featured_image,
        published_at,
        reading_time,
        blog_post_tags!left (
          tag_id
        )
      `
      )
      .neq('id', postId)
      .in('blog_post_tags.tag_id', tagIds)
      .lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false })
      .limit(limit)

    if (!data) return []

    // Get tags for related posts
    const relatedIds = data.map((post) => post.id)
    const { data: relatedTags } = await supabase
      .from('blog_post_tags')
      .select(
        `
        post_id,
        blog_tags (
          id,
          name,
          slug
        )
      `
      )
      .in('post_id', relatedIds)

    return data.map((post) => ({
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      author: post.author,
      featuredImage: post.featured_image,
      publishedAt: new Date(post.published_at),
      readingTime: post.reading_time,
      tags:
        relatedTags
          ?.filter((rt) => rt.post_id === post.id)
          ?.map((rt) => ({
            id:
              (
                rt.blog_tags as {
                  id?: string
                  name?: string
                  slug?: string
                  created_at?: string
                }
              )?.id || '',
            name:
              (
                rt.blog_tags as {
                  id?: string
                  name?: string
                  slug?: string
                  created_at?: string
                }
              )?.name || '',
            slug:
              (
                rt.blog_tags as {
                  id?: string
                  name?: string
                  slug?: string
                  created_at?: string
                }
              )?.slug || '',
            created_at:
              (
                rt.blog_tags as {
                  id?: string
                  name?: string
                  slug?: string
                  created_at?: string
                }
              )?.created_at || null,
          }))
          ?.filter(Boolean) || [],
    }))
  }

  async create(dto: CreateBlogPostDto): Promise<BlogPost> {
    const {
      title,
      slug: providedSlug,
      content,
      excerpt,
      author,
      tags,
      featuredImage,
      draft = false,
      seo,
    } = dto

    // Use provided slug or generate from title
    const slug =
      providedSlug ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()

    // Calculate reading time (words per minute)
    const wordCount = content.split(/\s+/).length
    const readingTime = Math.ceil(wordCount / 200)

    // Transform SEO data to JSONB
    const seoData = seo
      ? {
          title: seo.title || null,
          description: seo.description || null,
          keywords: seo.keywords || [],
        }
      : null

    // Start transaction
    const { data: post, error: postError } = await supabase
      .from(this.tableName)
      .insert({
        slug,
        title,
        content,
        excerpt: excerpt || content.slice(0, 200) + '...',
        author,
        reading_time: readingTime,
        draft,
        seo: seoData || {},
        published_at: draft ? null : new Date().toISOString(),
      })
      .select()
      .single()

    if (postError) this.handleError(postError)

    // Handle featured image upload
    let featuredImageUrl = null
    if (featuredImage) {
      const path = 'blog/images'
      const imageResult = await bunnyStorage.upload(featuredImage, path)
      featuredImageUrl = imageResult.publicUrl

      // Update post with featured image
      await supabase
        .from(this.tableName)
        .update({ featured_image: featuredImageUrl })
        .eq('id', post.id)
    }

    // Handle tags
    if (tags.length > 0) {
      const tagIds = await Promise.all(tags.map((tag) => this.ensureTag(tag)))

      const tagRelations = tagIds.map((tagId) => ({
        post_id: post.id,
        tag_id: tagId,
      }))

      const { error: tagError } = await supabase
        .from('blog_post_tags')
        .insert(tagRelations)

      if (tagError) this.handleError(tagError)
    }

    return {
      ...post,
      featured_image: featuredImageUrl,
      ...this.extractSeoFromJsonb(post.seo),
      metadata: {
        title,
        excerpt: post.excerpt,
        author,
        date: post.published_at || post.created_at,
        tags,
        featuredImage: featuredImageUrl,
        draft,
      },
    }
  }

  async update(id: string, dto: UpdateBlogPostDto): Promise<BlogPost> {
    const updates: Record<string, unknown> = {}

    if (dto.title) {
      updates.title = dto.title
    }

    if (dto.slug) {
      updates.slug = dto.slug
    }

    if (dto.content) {
      updates.content = dto.content
      // Recalculate reading time
      const wordCount = dto.content.split(/\s+/).length
      updates.reading_time = Math.ceil(wordCount / 200)
    }

    if (dto.excerpt !== undefined) {
      updates.excerpt = dto.excerpt
    }

    if (dto.author !== undefined) {
      updates.author = dto.author
    }

    if (dto.draft !== undefined) {
      updates.draft = dto.draft
      if (!dto.draft && !updates.published_at) {
        updates.published_at = new Date().toISOString()
      }
    }

    if (dto.published_at !== undefined) {
      updates.published_at = dto.published_at
    }

    // Handle SEO updates
    if (dto.seo !== undefined) {
      updates.seo = dto.seo
        ? {
            title: dto.seo.title || null,
            description: dto.seo.description || null,
            keywords: dto.seo.keywords || [],
          }
        : null
    }

    // Handle featured image update
    if (dto.featured_image !== undefined) {
      updates.featured_image = dto.featured_image
    }

    // Update post
    const { data: post, error: updateError } = await supabase
      .from(this.tableName)
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (updateError) this.handleError(updateError)

    // Handle tags update
    if (dto.tags) {
      // Remove existing tags
      await supabase.from('blog_post_tags').delete().eq('post_id', id)

      // Add new tags
      if (dto.tags.length > 0) {
        const tagIds = await Promise.all(
          dto.tags.map((tag) => this.ensureTag(tag))
        )

        const tagRelations = tagIds.map((tagId) => ({
          post_id: id,
          tag_id: tagId,
        }))

        await supabase.from('blog_post_tags').insert(tagRelations)
      }
    }

    // Get final tags
    const { data: postTags } = await supabase
      .from('blog_post_tags')
      .select('tag:blog_tags(name)')
      .eq('post_id', id)

    const tags =
      postTags?.flatMap((pt) => {
        const tag = pt.tag as { name?: string } | undefined
        return tag?.name ? [tag.name] : []
      }) || []

    return {
      ...post,
      ...this.extractSeoFromJsonb(post.seo),
      metadata: {
        title: post.title,
        excerpt: post.excerpt,
        author: post.author,
        date: post.published_at || post.created_at,
        tags,
        featuredImage: post.featured_image,
        draft: post.draft,
      },
    }
  }

  async delete(id: string): Promise<void> {
    // Delete the post (cascade will handle blog_post_tags)
    const { error } = await supabase.from(this.tableName).delete().eq('id', id)

    if (error) this.handleError(error)

    // Note: Image files in storage are not automatically deleted
    // You may want to implement a cleanup job for orphaned images
  }

  async syncPost(post: Omit<BlogPost, 'id'>): Promise<void> {
    const contentHash = createContentHash(post.content || '')

    // Check if post exists
    const { data: existing } = await supabase
      .from(this.tableName)
      .select('id, content_hash')
      .eq('slug', post.slug)
      .single()

    // Only update if content changed or new post
    if (!existing || existing.content_hash !== contentHash) {
      const postData = {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        author: post.author,
        content: post.content,
        featured_image: post.featured_image,
        reading_time: post.reading_time || 5,
        content_hash: contentHash,
        published_at: post.published_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        draft: post.draft,
        seo: post.seo,
      }

      const { data: _upsertedPost, error } = await supabase
        .from(this.tableName)
        .upsert(postData, { onConflict: 'slug' })
        .select()
        .single()

      if (error) this.handleError(error)

      // Update tags - For now, skip tag handling in syncPost method
      // Tags should be handled separately through the regular create/update methods
    }
  }

  private async ensureTag(name: string): Promise<string> {
    const slug = name.toLowerCase().replace(/\s+/g, '-')

    // Try to get existing tag
    const { data: existingTag } = await supabase
      .from('blog_tags')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existingTag) {
      return existingTag.id
    }

    // Create new tag
    const { data: newTag, error } = await supabase
      .from('blog_tags')
      .insert({ name, slug })
      .select('id')
      .single()

    if (error) this.handleError(error)

    return newTag.id
  }
}

export const blogsRepository = new BlogsRepository()
