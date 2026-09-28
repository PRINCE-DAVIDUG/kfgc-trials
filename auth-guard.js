// auth-guard.js
import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Redirect to login if not signed in
onAuthStateChanged(auth, (user) => {
  if (!user) {
    // Not signed in, redirect to auth page
    window.location.replace("auth.html");
  }
});