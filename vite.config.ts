/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // A new version installs in the background and takes over on the next launch (never in
      // the middle of a page).
      registerType: 'autoUpdate',
      // Precache everything, including the bundled font and the icons, so it all works offline.
      workbox: { globPatterns: ['**/*.{js,css,html,svg,png,woff2}'] },
      includeManifestIcons: false, // The glob above has them already.
      manifest: {
        id: 'long-way-home',
        name: 'The Long Way Home',
        short_name: 'Long Way Home',
        description: 'A timed mental-math adventure: answer to run home across five worlds.',
        lang: 'en',
        categories: ['education', 'games', 'kids'],
        display: 'fullscreen',
        display_override: ['fullscreen', 'standalone'],
        orientation: 'landscape',
        background_color: '#20344f',
        theme_color: '#2f7d4f',
        // Relative, so the app works from any base path (GitHub Pages serves it from /<repo>/).
        start_url: '.',
        scope: '.',
        // Drawn by `npm run icons` (scripts/icons.mjs) from the dev page #icon-<shape>-<size>.
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          {
            src: 'icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  define: {
    __BUILD_DATE__: JSON.stringify(
      new Date().toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric' }),
    ),
  },
  build: {
    // The art makes the main chunk about 722 kB, 201 kB gzipped (a precached PWA, so harmless;
    // splitting the art per world is an M10 idea). Warn only if it grows well past that.
    chunkSizeWarningLimit: 800,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
