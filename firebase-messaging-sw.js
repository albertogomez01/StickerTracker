importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

// TODO: Reemplaza esto con tu configuración real que usas en firebase.js
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_STORAGE_BUCKET",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Se dispara cuando la aplicación está minimizada o cerrada por completo
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Mensaje recibido en segundo plano.', payload);
  const notificationTitle = payload.notification.title || 'Mundial 2026';
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.png', // Asegúrate de tener tu logo con este nombre en /public
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});