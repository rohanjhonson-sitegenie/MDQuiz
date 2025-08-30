import path from 'path'
import { Plugin } from 'vite'
import fs from 'fs/promises'
import { glob } from 'glob'
import { generateSlug, calculateReadingTime } from './lib/blog-utils'
import { parseFrontmatter } from './lib/frontmatter'

interface BlogIndexEntry {
  slug: string
  title: string
  excerpt?: string
  author: string
  date: string
  tags: string[]
  featuredImage?: string
  readingTime: number
  path: string
}

export function viteBlogPlugin(): Plugin {
  let blogIndex: BlogIndexEntry[] = []

  return {
    name: 'vite-blog-plugin',

    async buildStart() {
      // Find all blog markdown files
      const blogFiles = await glob('public/blog-posts/**/index.md')

      blogIndex = await Promise.all(
        blogFiles.map(async (filePath) => {
          const content = await fs.readFile(filePath, 'utf-8')
          const { content: markdownContent, metadata } =
            parseFrontmatter(content)

          // Extract slug from path
          const pathMatch = filePath.match(
            /blog-posts\/(\d{4})\/([^/]+)\/index\.md$/
          )
          const slug = pathMatch ? pathMatch[2] : generateSlug(metadata.title)

          return {
            slug,
            title: metadata.title,
            excerpt: metadata.excerpt,
            author: metadata.author,
            date: metadata.date,
            tags: metadata.tags || [],
            featuredImage: metadata.featuredImage,
            readingTime: calculateReadingTime(markdownContent),
            path: filePath.replace('public/', '/'),
          }
        })
      )

      // Sort by date (newest first)
      blogIndex.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )

      // Generate blog index file
      const indexContent = `// Auto-generated blog index
export const blogIndex = ${JSON.stringify(blogIndex, null, 2)} as const

export type BlogIndexEntry = typeof blogIndex[number]
`

      await fs.writeFile(
        path.join('src/features/blog/blog-index.ts'),
        indexContent,
        'utf-8'
      )

      // eslint-disable-next-line no-console
      console.log(`✓ Generated blog index with ${blogIndex.length} posts`)
    },

    configureServer(server) {
      // Watch for changes in blog posts during development
      server.watcher.add('public/blog-posts/**/*.md')

      server.watcher.on('change', async (file) => {
        if (file.includes('blog-posts') && file.endsWith('.md')) {
          // eslint-disable-next-line no-console
          console.log('Blog post changed:', file)
          // Trigger rebuild of blog index
          // Trigger rebuild by invalidating virtual module
          // Note: In watch mode, Vite will automatically rebuild when files change
        }
      })
    },
  }
}
