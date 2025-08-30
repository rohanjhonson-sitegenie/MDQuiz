import { createFileRoute } from '@tanstack/react-router'
import { blogsRepository } from '@/api/repositories'

export const Route = createFileRoute('/blog-sitemap.xml')({
  component: () => null,
  loader: async () => {
    try {
      // Fetch all published blog posts
      const { posts } = await blogsRepository.findAll({
        includeDrafts: false,
        limit: 1000, // Get all posts for sitemap
      })

      const baseUrl = import.meta.env.VITE_APP_URL || 'https://example.com'

      // Generate sitemap entries
      const entries = [
        // Blog index page
        {
          loc: `${baseUrl}/blogs`,
          lastmod: new Date().toISOString().split('T')[0],
          changefreq: 'daily',
          priority: 0.8,
        },
        // Individual blog posts
        ...posts.map((post) => ({
          loc: `${baseUrl}/blogs/${post.slug}`,
          lastmod: post.publishedAt.toISOString().split('T')[0],
          changefreq: 'monthly',
          priority: 0.7,
        })),
      ]

      // Generate sitemap XML
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (entry) => `  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`

      // Return XML response
      return new Response(sitemap, {
        headers: {
          'Content-Type': 'application/xml',
          'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        },
      })
    } catch (_error) {
      // Return empty sitemap on error
      return new Response(
        `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`,
        {
          headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'no-cache',
          },
        }
      )
    }
  },
})
