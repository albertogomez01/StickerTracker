// Este archivo se importará dentro del service worker principal generado por Vite PWA

// Importamos los scripts de Firebase.
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

// La configuración de Firebase se inyectará aquí durante el build de Vercel.
// Vercel reemplaza automáticamente las variables de entorno en los archivos de la carpeta `public`.
const firebaseConfig = {
  apiKey: "%VITE_FIREBASE_API_KEY%",
  authDomain: "%VITE_FIREBASE_AUTH_DOMAIN%",
  projectId: "%VITE_FIREBASE_PROJECT_ID%",
  storageBucket: "%VITE_FIREBASE_STORAGE_BUCKET%",
  messagingSenderId: "%VITE_FIREBASE_MESSAGING_SENDER_ID%",
  appId: "%VITE_FIREBASE_APP_ID%",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();