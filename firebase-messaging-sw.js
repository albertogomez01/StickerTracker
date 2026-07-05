// Import the Firebase app and messaging modules.
// These scripts are loaded from the web, not from your node_modules.
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

// Your web app's Firebase configuration.
// It's crucial to use environment variables for this sensitive data.
const firebaseConfig = {
  apiKey: "%VITE_FIREBASE_API_KEY%",
  authDomain: "%VITE_FIREBASE_AUTH_DOMAIN%",
  projectId: "%VITE_FIREBASE_PROJECT_ID%",
  storageBucket: "%VITE_FIREBASE_STORAGE_BUCKET%",
  messagingSenderId: "%VITE_FIREBASE_MESSAGING_SENDER_ID%",
  appId: "%VITE_FIREBASE_APP_ID%",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();