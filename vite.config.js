import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  // Carga las variables de entorno desde tu archivo .env
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      VitePWA({
        strategies: 'generateSW',
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          // Importamos nuestro script de firebase al service worker que se genera automáticamente
          importScripts: ['firebase-messaging-sw.js']
        },
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Gestor Cromos Mundial 2026',
        short_name: 'Gestor Panini',
        description: 'Aplicación para gestionar tus cromos del Mundial 2026',
        theme_color: '#059669',
        background_color: '#0F172A',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
    ],
    build: {
      chunkSizeWarningLimit: 1000
    }
  };
});