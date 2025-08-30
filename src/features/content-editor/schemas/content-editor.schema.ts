import { z } from 'zod'

export const blogPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  slug: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().max(500, 'Excerpt is too long').optional(),
  author: z.string().min(1, 'Author is required'),
  featuredImage: z
    .instanceof(File)
    .optional()
    .or(z.string().optional())
    .nullable(),
  tags: z.array(z.string()).optional(),
  draft: z.boolean().optional(),
  publishedAt: z.date().optional(),
  seoTitle: z.string().max(60, 'SEO title is too long').optional(),
  seoDescription: z.string().max(160, 'SEO description is too long').optional(),
  seoKeywords: z.array(z.string()).optional(),
})

export type BlogPostFormData = z.infer<typeof blogPostSchema>
