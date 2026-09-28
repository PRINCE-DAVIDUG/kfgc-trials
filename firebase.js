// firebase.js
// KFGC Media App — Firebase Configuration

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { getMessaging } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js";

const firebaseConfig = {
  apiKey: "AIzaSyCPWH5BCSFp3Qqs_-JVfqDkUCEfhyg4VX4",
  authDomain: "kfgc-media-app.firebaseapp.com",
  projectId: "kfgc-media-app",
  storageBucket: "kfgc-media-app.firebasestorage.app",
  messagingSenderId: "203397572574",
  appId: "1:203397572574:web:db903da199482fd6cedf4f"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const messaging = getMessaging(app);

export {
  app,
  auth,
  db,
  storage,
  messaging
};
