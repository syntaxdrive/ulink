import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      'capacitor-plugin-send-intent': path.resolve(__dirname, './src/lib/send-intent-shim.ts'),
    },
  },
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
