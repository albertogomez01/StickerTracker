importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

// ✅ ¡IMPORTANTE! Reemplaza esto con tu configuración real de Firebase.
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef..."
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