import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Relative base so the built app works from any subpath (GitHub Pages project
// site, or any other static host) without extra configuration.
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'Coach Concours',
        short_name: 'Concours',
        description:
          'Plan personnel pour le concours de police : technique, explosivité et récupération.',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'portrait-primary',
        background_color: '#f3f5f1',
        theme_color: '#193337',
        lang: 'fr-CH',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        // The Swiss trails dataset is large; keep it cached with the rest of the
        // app shell so the app works offline once installed.
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024
      }
    })
  ]
});
