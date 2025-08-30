import { defineConfig } from 'vite'
import { viteBlogPlugin } from './src/features/blog/vite-plugin-blog'
import { generateBlogSitemap } from './src/features/blog/generate-sitemap'

export default defineConfig({
  plugins: [
    viteBlogPlugin(),
    {
      name: 'generate-sitemap',
      closeBundle: async () => {
        const baseUrl = process.env.VITE_BASE_URL || 'https://example.com'
        await generateBlogSitemap(baseUrl)
      }
    }
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'blog-vendor': ['react-markdown', 'remark-gfm', 'rehype-highlight', 'highlight.js'],
        },
      },
    },
  },
})