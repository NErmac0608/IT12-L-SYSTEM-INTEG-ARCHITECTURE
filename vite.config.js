import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.jpg'],
      manifest: {
        name: 'EventLink Attendance',
        short_name: 'EventLink',
        description: 'Event registration and QR attendance management system',
        theme_color: '#102a43',
        background_color: '#f5f1e8',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: '/icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml' },
        ],
      },
    }),
  ],
  server: {
    watch: {
      ignored: ['**/*.{jpg,jpeg,png,gif,webp}'],
    },
  },
})