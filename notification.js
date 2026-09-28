// KFGC Media App — Firebase Cloud Messaging

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

  console.log("[KFGC] Starting notification setup...");

  if (!("Notification" in window)) {
    console.error("[KFGC] Notifications are not supported.");
    return null;
  }

  if (!("serviceWorker" in navigator)) {
    console.error("[KFGC] Service workers are not supported.");
    return null;
  }

  try {

    console.log("[KFGC] Notification permission:",
      Notification.permission
    );

    /*
     * Wait for the existing KFGC service worker.
     */
    console.log("[KFGC] Waiting for service worker...");

    const registration =
      await navigator.serviceWorker.ready;

    console.log(
      "[KFGC] Service worker ready:",
      registration.scope
    );

    /*
     * Request FCM token.
     */
    console.log("[KFGC] Requesting FCM token...");

    const tokenPromise = getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration
    });

    /*
     * Prevent the button from waiting forever.
     */
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(
          new Error(
            "FCM token request timed out after 15 seconds."
          )
        );
      }, 15000);
    });

    const token =
      await Promise.race([
        tokenPromise,
        timeoutPromise
      ]);

    console.log(
      "[KFGC] FCM token received:",
      token
    );

    if (!token) {
      console.error(
        "[KFGC] Firebase did not return an FCM token."
      );

      return null;
    }

    /*
     * Save token to Firestore.
     */
    console.log(
      "[KFGC] Saving token to Firestore..."
    );

    await setDoc(
      doc(db, "notificationTokens", token),
      {
        token: token,
        platform: "web",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        merge: true
      }
    );

    console.log(
      "[KFGC] Notification token successfully saved."
    );

    return token;

  } catch (error) {

    console.error(
      "[KFGC] Notification setup failed:",
      error
    );

    return null;
  }
}


/*
 * Foreground messages
 */
onMessage(messaging, payload => {

  console.log(
    "[KFGC] Foreground notification received:",
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

  if (Notification.permission === "granted") {

    const notification =
      new Notification(title, {
        body: body,
        icon: "./icons/icon-192.png",
        data: {
          url: url
        }
      });

    notification.onclick = () => {
      window.location.href = url;
    };
  }

});
