import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'service-worker.js',
      registerType: 'autoUpdate',
      injectManifest: {
        maximumFileSizeToCacheInBytes: 5000000,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
      },
      manifest: false, // Use the manifest.json from public directory
      includeAssets: ['icon-512.png', 'manifest.json'],
      devOptions: {
        enabled: true,
        type: 'module',
      }
    })
  ],
  build: {
    // Manual chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Core React — always needed, cached long-term
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'react-vendor';
          }
          // Supabase client — needed on first auth check
          if (id.includes('node_modules/@supabase')) {
            return 'supabase';
          }
          // UI utilities — small, always needed
          if (id.includes('node_modules/lucide-react') || id.includes('node_modules/zustand')) {
            return 'ui-vendor';
          }
          // Three.js — HEAVY (1MB), only used on specific pages — lazy chunk
          if (id.includes('node_modules/three') || id.includes('node_modules/@react-three')) {
            return 'three-vendor';
          }
          // PDF.js — HEAVY (600KB), only used in Courses — lazy chunk
          if (id.includes('node_modules/pdfjs-dist')) {
            return 'pdfjs-vendor';
          }
          // Other large vendor libs
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
    // Minification and optimization
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 600,
  },
  server: {
    host: true,
    allowedHosts: true,
  },
})
