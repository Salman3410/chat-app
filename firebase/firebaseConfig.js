import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";


// ==========================================
// FIREBASE PROJECT CONFIG
// ==========================================

const firebaseConfig = {
  apiKey: "AIzaSyD9qHy7sC4nfWhKyDw1SPuKft-N50Zghj4",
  authDomain: "chat-app-3ad08.firebaseapp.com",
  projectId: "chat-app-3ad08",
  storageBucket: "chat-app-3ad08.firebasestorage.app",
  messagingSenderId: "719099947138",
  appId: "1:719099947138:web:9cca4d3e37ff94aad92c9b",
};


// ==========================================
// INITIALIZE
// ==========================================

const app = initializeApp(
  firebaseConfig
);

const auth = getAuth(app);

const db = getFirestore(app);


// ==========================================
// EXPORT
// ==========================================

export {
  app,
  auth,
  db
};
