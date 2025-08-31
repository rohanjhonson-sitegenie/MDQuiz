# Blog Migration Guide

This guide explains how to migrate blog posts from static markdown files to Supabase database with UUID-based image storage.

## Overview

The blog system has been upgraded to use:
- **Supabase Database** for storing blog post content and metadata
- **Supabase Storage** with UUID-based paths for images
- **Full-text search** capabilities
- **Draft/publish workflow**
- **Tag management**

## Migration Steps

### 1. Setup Database

First, run the database migrations to create the necessary tables:

```bash
npm run deploy:db:dev
```

This will create:
- `blog_posts` table with content storage
- `blog_images` table for image metadata
- `blog_tags` and `blog_post_tags` tables
- Necessary indexes and RLS policies

### 2. Setup Storage Bucket

Create the Supabase Storage bucket for blog images:

```bash
npm run blog:setup
```

This creates a public `blog-images` bucket with:
- 10MB file size limit
- Allowed image types: PNG, JPEG, WebP, GIF
- Public access for reading

### 3. Migrate Existing Posts

Run the migration script to move existing markdown posts to Supabase:

```bash
# Set required environment variables
export VITE_SUPABASE_URL=your_supabase_url
export SUPABASE_SERVICE_KEY=your_service_key

# Run migration
npm run blog:migrate
```

The migration script will:
- Read all markdown files from `public/blog-posts/`
- Parse frontmatter metadata
- Upload images to Supabase Storage with UUID paths
- Update image URLs in content
- Create blog posts in the database
- Set up tag relationships

## New Blog Structure

### Database Schema

```sql
blog_posts
├── id (UUID)
├── slug (unique)
├── title
├── content (full markdown)
├── excerpt
├── author
├── featured_image
├── draft (boolean)
├── published_at
└── updated_at

blog_images
├── id (UUID)
├── post_id (foreign key)
├── filename
├── storage_path (UUID-based)
├── mime_type
└── size_bytes
```

### Storage Structure

```
blog-images/
├── {uuid}/
│   ├── original.jpg
│   ├── thumb.webp (future)
│   └── optimized.webp (future)
```

## API Changes

### Fetching Posts

```typescript
// Old: Static file based
const posts = blogIndex.posts

// New: Database query
const { posts, total } = await blogApi.getPosts({
  page: 1,
  limit: 10,
  tag: 'react',
  search: 'typescript'
})
```

### Creating Posts (Admin)

```typescript
const post = await blogApi.createPost({
  title: 'My New Post',
  content: '# Content here...',
  excerpt: 'Short description',
  author: 'John Doe',
  tags: ['React', 'TypeScript'],
  featuredImage: imageFile, // File object
  draft: false
})
```

## Benefits

1. **Stable Image URLs**: UUID-based paths prevent broken images when slugs change
2. **Dynamic Content**: No need to rebuild for content updates
3. **Search & Filter**: Database queries for efficient search
4. **Draft System**: Save drafts before publishing
5. **Scalability**: CDN-backed image delivery
6. **Admin Interface**: Future blog editor capabilities

## Rollback

If needed, the static markdown files remain in `public/blog-posts/` and can be reverted to by:
1. Updating `blog-api.ts` to use the old implementation
2. Reverting the blog hooks to use static imports

## Troubleshooting

### Images Not Displaying
- Check Supabase Storage bucket is public
- Verify image URLs in database
- Check browser console for CORS errors

### Migration Fails
- Ensure environment variables are set correctly
- Check Supabase service key has admin access
- Verify storage bucket exists

### Performance Issues
- Add database indexes if needed
- Enable Supabase query caching
- Implement frontend caching strategies