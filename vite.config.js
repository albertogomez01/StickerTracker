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
        workbox: {
          // Esto asegura que nuestro service worker personalizado se maneje correctamente
          // y que las variables de entorno se inyecten en él.
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          // Modificamos el contenido del service worker en tiempo de compilación
          // para reemplazar los placeholders con las claves reales.
          inlineWorkboxRuntime: true,
          template: 'public/firebase-messaging-sw.js',
          transform(workboxConfig) {
            workboxConfig.replace(/%VITE_FIREBASE_API_KEY%/g, env.VITE_FIREBASE_API_KEY)
            workboxConfig.replace(/%VITE_FIREBASE_AUTH_DOMAIN%/g, env.VITE_FIREBASE_AUTH_DOMAIN)
            workboxConfig.replace(/%VITE_FIREBASE_PROJECT_ID%/g, env.VITE_FIREBASE_PROJECT_ID)
            workboxConfig.replace(/%VITE_FIREBASE_STORAGE_BUCKET%/g, env.VITE_FIREBASE_STORAGE_BUCKET)
            workboxConfig.replace(/%VITE_FIREBASE_MESSAGING_SENDER_ID%/g, env.VITE_FIREBASE_MESSAGING_SENDER_ID)
            workboxConfig.replace(/%VITE_FIREBASE_APP_ID%/g, env.VITE_FIREBASE_APP_ID)
            return workboxConfig
          }
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