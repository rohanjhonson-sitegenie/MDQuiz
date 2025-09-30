import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 5173,
  },
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
      '@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs',

      // Node.js polyfills
      buffer: 'buffer',

      // Force all libraries to use the same React instance
      react: path.resolve('./node_modules/react'),
      'react-dom': path.resolve('./node_modules/react-dom'),
    },
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: [
      'buffer',

      // Add libraries that commonly break in React 19 production builds
      'react',
      'react-dom',
      'with-selector',
      'reselect',
      'recharts',
      'lucide-react',
    ],
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      treeshake: {
        preset: 'recommended',
      },
    },
    sourcemap: true,
    target: 'es2020',
    minify: 'esbuild',
  },
})
