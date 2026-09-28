import { auth } from "./firebase.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Google Sheets endpoint
const SHEET_ENDPOINT = "https://script.google.com/macros/s/AKfycbx__CHeBV6cEkMycG85Nn-ThWkW0SJIHTRhwXNnyjutTZ4r0gCSs4EVDtFiCt0MFuPx/exec";

// ---------------- LOGIN ----------------
const loginFormEl = document.getElementById("loginForm");
const loginMsg = document.getElementById("loginMsg");

loginFormEl.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  try {
    await signInWithEmailAndPassword(auth, email, password);
    loginMsg.textContent = "Login successful! Redirecting...";
    setTimeout(() => window.location.replace("profile.html"), 1000);
  } catch (err) {
    console.error(err);
    if (err.code === "auth/user-not-found") {
      loginMsg.textContent = "No account found. Please sign up.";
    } else if (err.code === "auth/wrong-password") {
      loginMsg.textContent = "Incorrect password.";
    } else {
      loginMsg.textContent = "Login failed. " + err.message;
    }
  }
});

// ---------------- SIGNUP ----------------
const signupFormEl = document.getElementById("signupForm");
const signupMsg = document.getElementById("signupMsg");

signupFormEl.addEventListener("submit", async (e) => {
  e.preventDefault();
  const fullName = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const phone = document.getElementById("signupTel").value.trim();
  const password = document.getElementById("signupPassword").value.trim();

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, { displayName: fullName, photoURL: "" });

    // Save user to Google Sheets
    await fetch(SHEET_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid: user.uid,
        email,
        fullName,
        photoURL: "",
        role: "user",
        action: "create"
      })
    });

    signupMsg.textContent = "Account created successfully! Redirecting...";
    setTimeout(() => window.location.replace("index.html"), 1500);

  } catch (err) {
    console.error(err);
    signupMsg.textContent = "Failed to create account. " + err.message;
  }
});

// ---------------- TOGGLE LOGIN / SIGN UP ----------------
const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");

loginTab.addEventListener("click", () => {
  loginTab.classList.add("active");
  signupTab.classList.remove("active");
  loginFormEl.classList.add("active");
  signupFormEl.classList.remove("active");

  loginMsg.textContent = "";  // Clear messages when switching
  signupMsg.textContent = "";
});

signupTab.addEventListener("click", () => {
  signupTab.classList.add("active");
  loginTab.classList.remove("active");
  signupFormEl.classList.add("active");
  loginFormEl.classList.remove("active");

  loginMsg.textContent = "";
  signupMsg.textContent = "";
});