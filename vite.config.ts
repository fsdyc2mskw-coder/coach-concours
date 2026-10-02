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
      // CHANGE_REQUEST_015 section A — the app must never silently swap the
      // code under the athlete: 'prompt' registers the new service worker
      // without activating it, and CoachConcoursApp's UpdateBanner is the
      // only thing that calls updateServiceWorker(true).
      registerType: 'prompt',
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
        // CHANGE_REQUEST_010 section A — dark theme only, tokens from the mockup.
        background_color: '#0A0B0E',
        theme_color: '#0A0B0E',
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
