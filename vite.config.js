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
        // Cambiamos a la estrategia 'injectManifest' para usar nuestro propio service worker
        strategies: 'injectManifest',
        // Le indicamos dónde está nuestro archivo de service worker
        srcDir: 'public',
        filename: 'firebase-messaging-sw.js',
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
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
    // Aquí definimos las variables que se reemplazarán en el service worker
    // Vite se encargará de sustituir import.meta.env.VITE_... por los valores reales.
    define: {
      'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify(env.VITE_FIREBASE_API_KEY),
      'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(env.VITE_FIREBASE_AUTH_DOMAIN),
      'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(env.VITE_FIREBASE_PROJECT_ID),
      'import.meta.env.VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify(env.VITE_FIREBASE_STORAGE_BUCKET),
      'import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(env.VITE_FIREBASE_MESSAGING_SENDER_ID),
      'import.meta.env.VITE_FIREBASE_APP_ID': JSON.stringify(env.VITE_FIREBASE_APP_ID),
    },
    build: {
      chunkSizeWarningLimit: 1000
    }
  };
});