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
    // Set chunk size warning limit to a more realistic value for feature-rich admin dashboard
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Core React libraries
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/')
          ) {
            return 'react-vendor'
          }

          // Radix UI components - split into smaller chunks
          if (
            id.includes('@radix-ui/react-dialog') ||
            id.includes('@radix-ui/react-dropdown-menu')
          ) {
            return 'radix-overlays'
          }
          if (
            id.includes('@radix-ui/react-form') ||
            id.includes('@radix-ui/react-select')
          ) {
            return 'radix-forms'
          }
          if (id.includes('@radix-ui')) {
            return 'radix-ui'
          }

          // TanStack libraries
          if (id.includes('@tanstack/react-router')) {
            return 'tanstack-router'
          }
          if (
            id.includes('@tanstack/react-query') ||
            id.includes('@tanstack/query-core')
          ) {
            return 'tanstack-query'
          }
          if (
            id.includes('@tanstack/react-table') ||
            id.includes('@tanstack/react-virtual')
          ) {
            return 'tanstack-table'
          }

          // Tabler icons - separate from other icons
          if (id.includes('@tabler/icons-react')) {
            return 'tabler-icons'
          }

          // Lucide icons
          if (id.includes('lucide-react')) {
            return 'lucide-icons'
          }

          // Form libraries
          if (
            id.includes('react-hook-form') ||
            id.includes('@hookform/resolvers')
          ) {
            return 'form-libs'
          }
          if (id.includes('zod')) {
            return 'validation'
          }

          // Date utilities
          if (id.includes('date-fns')) {
            return 'date-utils'
          }

          // Charts and visualization
          if (id.includes('recharts')) {
            return 'charts'
          }

          // Markdown processing (if not lazy loaded)
          if (
            id.includes('remark') ||
            id.includes('rehype') ||
            id.includes('unified')
          ) {
            return 'markdown-processing'
          }

          // Large utility libraries
          if (id.includes('lodash') || id.includes('ramda')) {
            return 'utilities'
          }

          // Accessibility libraries
          if (id.includes('@floating-ui') || id.includes('focus-trap')) {
            return 'accessibility'
          }

          // Animation libraries
          if (id.includes('framer-motion') || id.includes('@dnd-kit')) {
            return 'animations'
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
