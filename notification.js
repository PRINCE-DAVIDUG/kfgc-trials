// KFGC Media App — Firebase Cloud Messaging

console.log("[KFGC] notification.js loaded");

import {
  getToken,
  onMessage
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js";

import {
  messaging,
  db
} from "./firebase.js";

import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


const VAPID_KEY =
  "BJuuZ6L63nLgdfYdl3_JgkE0WEhT1TU06nfnVAOYwcHa7EDAgpjXE_WoXpKnXY2wqbZccY1XHw5XrBvKU1FhiAo";


export async function enableNotifications() {

  console.log("[KFGC] enableNotifications() started");

  try {

    /* =========================================
       Browser support
    ========================================= */

    if (!("Notification" in window)) {
      throw new Error(
        "This browser does not support notifications."
      );
    }

    if (!("serviceWorker" in navigator)) {
      throw new Error(
        "This browser does not support service workers."
      );
    }


    /* =========================================
       Permission
    ========================================= */

    if (Notification.permission !== "granted") {

      const permission =
        await Notification.requestPermission();

      if (permission !== "granted") {
        throw new Error(
          "Notification permission was not granted."
        );
      }
    }


    console.log(
      "[KFGC] Notification permission granted."
    );


    /* =========================================
       Register the ONE KFGC service worker
    ========================================= */

    console.log(
      "[KFGC] Registering existing KFGC service worker..."
    );

    const registration =
      await navigator.serviceWorker.register(
        "./sw.js",
        {
          scope: "./"
        }
      );


    console.log(
      "[KFGC] Service worker registration:",
      registration.scope
    );


    /* =========================================
       Wait until service worker is ready
    ========================================= */

    await navigator.serviceWorker.ready;


    console.log(
      "[KFGC] Service worker is ready."
    );


    /* =========================================
       Firebase Messaging
    ========================================= */

    if (!messaging) {
      throw new Error(
        "Firebase Messaging was not initialized."
      );
    }


    console.log(
      "[KFGC] Requesting FCM token..."
    );


    /* =========================================
       Generate FCM token
    ========================================= */

    const token =
      await getToken(
        messaging,
        {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration:
            registration
        }
      );


    console.log(
      "[KFGC] getToken() completed."
    );


    if (!token) {
      throw new Error(
        "Firebase returned an empty FCM token."
      );
    }


    console.log(
      "[KFGC] FCM token generated successfully."
    );


    /* =========================================
       Save token to Firestore
    ========================================= */

    console.log(
      "[KFGC] Saving token to Firestore..."
    );


    await setDoc(
      doc(
        db,
        "notificationTokens",
        token
      ),
      {
        token: token,
        platform: "web",
        createdAt:
          serverTimestamp(),
        updatedAt:
          serverTimestamp()
      },
      {
        merge: true
      }
    );


    console.log(
      "[KFGC] FCM token saved to Firestore."
    );


    return token;

  } catch (error) {

    console.error(
      "[KFGC] Notification setup failed:",
      error
    );

    throw error;
  }
}


/* =========================================
   Foreground messages
========================================= */

onMessage(
  messaging,
  payload => {

    console.log(
      "[KFGC] Foreground message:",
      payload
    );


    const title =
      payload.notification?.title ||
      payload.data?.title ||
      "KFGC Media App";


    const body =
      payload.notification?.body ||
      payload.data?.body ||
      "You have a new KFGC update.";


    const url =
      payload.data?.url ||
      "./index.html";


    if (
      Notification.permission ===
      "granted"
    ) {

      const notification =
        new Notification(
          title,
          {
            body: body,
            icon:
              "./icons/icon-192.png",
            data: {
              url: url
            }
          }
        );


      notification.onclick = () => {
        window.location.href = url;
      };

    }

  }
);
