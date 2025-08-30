import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),

      // fix loading all icon chunks in dev mode
      // https://github.com/tabler/tabler-icons/issues/1233
      '@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs',

      // Node.js polyfills
      buffer: 'buffer',
    },
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['buffer'],
  },
  build: {
    // Set chunk size warning limit to a more realistic value after optimization
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Blog/Markdown processing libraries are now lazy-loaded
          // Remove manual chunking to allow automatic code splitting

          // Radix UI components
          if (id.includes('@radix-ui')) {
            return 'radix-ui'
          }

          // TanStack libraries
          if (
            id.includes('@tanstack/react-router') ||
            id.includes('@tanstack/react-query') ||
            id.includes('@tanstack/react-table') ||
            id.includes('@tanstack/react-virtual')
          ) {
            return 'tanstack'
          }

          // Tabler icons
          if (id.includes('@tabler/icons-react')) {
            return 'icons'
          }

          // Form libraries
          if (
            id.includes('react-hook-form') ||
            id.includes('@hookform/resolvers') ||
            id.includes('zod')
          ) {
            return 'forms'
          }

          // Date utilities
          if (id.includes('date-fns')) {
            return 'date-utils'
          }

          // Charts and visualization
          if (id.includes('recharts')) {
            return 'charts'
          }
        },
      },
      // Enable advanced minification options
      treeshake: {
        preset: 'recommended',
      },
    },
    // Enable source maps for better debugging while maintaining production optimization
    sourcemap: false,
    // Optimize for modern browsers
    target: 'es2020',
    // Enable minification with default esbuild (faster and good enough)
    minify: 'esbuild',
  },
})
