// profile.js
import { auth, storage } from "./firebase.js";
import { onAuthStateChanged, updateProfile, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const fullNameInput = document.getElementById("fullName");
const dpInput = document.getElementById("dp");
const dpPreview = document.getElementById("dpPreview");
const uploadProgress = document.getElementById("uploadProgress");
const msg = document.getElementById("msg");
const profileForm = document.getElementById("profileForm");

const headerName = document.getElementById("headerName");
const headerDp = document.getElementById("headerDp");
const logoutBtn = document.getElementById("logoutBtn");
const adminMenu = document.getElementById("adminMenu");

// Your Google Apps Script Web App endpoint
const SHEET_ENDPOINT = "https://script.google.com/macros/s/AKfycbx__CHeBV6cEkMycG85Nn-ThWkW0SJIHTRhwXNnyjutTZ4r0gCSs4EVDtFiCt0MFuPx/exec";

// Load current user info
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // Header
    headerName.textContent = user.displayName || "Member";
    headerDp.src = user.photoURL || "user.jpg";

    // Profile form
    fullNameInput.value = user.displayName || "";
    dpPreview.src = user.photoURL || "user.jpg";

    // Get user info from Google Sheets
    const sheetUser = await fetchUserFromSheet(user.uid);
    if (sheetUser) {
      adminMenu.style.display = sheetUser.role === "admin" ? "block" : "none";
    }
  } else {
    headerName.textContent = "Member";
    headerDp.src = "user.jpg";
    adminMenu.style.display = "none";
  }
});

// Preview DP
dpInput.addEventListener("change", () => {
  const file = dpInput.files[0];
  if (file) dpPreview.src = URL.createObjectURL(file);
});

// Logout
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.replace("auth.html");
});

// Update profile
profileForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) return;

  const newName = fullNameInput.value.trim();
  const dpFile = dpInput.files[0];
  let photoURL = user.photoURL || "";

  try {
    // Upload DP if exists
    if (dpFile) {
      const dpRef = ref(storage, `user-dps/${user.uid}.jpg`);
      const uploadTask = uploadBytesResumable(dpRef, dpFile);

      uploadProgress.style.display = "block";

      await new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            uploadProgress.value = progress;
          },
          (error) => {
            console.error(error);
            msg.textContent = "Failed to upload image.";
            reject(error);
          },
          async () => {
            photoURL = await getDownloadURL(uploadTask.snapshot.ref);
            uploadProgress.style.display = "none";
            resolve();
          }
        );
      });
    }

    // Update Firebase Auth profile
    await updateProfile(user, { displayName: newName, photoURL });

    // Update Google Sheets
    await updateUserInSheet(user.uid, user.email, newName, photoURL);

    // Update header & preview
    headerName.textContent = newName;
    headerDp.src = photoURL;
    dpPreview.src = photoURL;

    msg.textContent = "Profile updated successfully!";
  } catch (err) {
    console.error(err);
    msg.textContent = "Failed to update profile.";
  }
});

// ---------------------
// Helper functions
// ---------------------

async function fetchUserFromSheet(uid) {
  try {
    const res = await fetch(`${SHEET_ENDPOINT}?uid=${uid}`);
    const data = await res.json();
    return data; // { uid, email, fullName, photoURL, role }
  } catch (err) {
    console.error("Error fetching user from sheet", err);
    return null;
  }
}

async function updateUserInSheet(uid, email, fullName, photoURL) {
  try {
    const res = await fetch(SHEET_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, email, fullName, photoURL, action: "update" })
    });
    return await res.json();
  } catch (err) {
    console.error("Error updating user in sheet", err);
  }
}
