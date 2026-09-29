/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      // Precache the bundled font too, so titles look right offline.
      workbox: { globPatterns: ['**/*.{js,css,html,svg,woff2}'] },
      manifest: {
        name: 'The Long Way Home',
        short_name: 'Long Way Home',
        description: 'A timed mental-math adventure.',
        display: 'fullscreen',
        orientation: 'landscape',
        background_color: '#bfe6ff',
        theme_color: '#2f7d4f',
        start_url: '.',
        scope: '.',
        icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
      },
    }),
  ],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
