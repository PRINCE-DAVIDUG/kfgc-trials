// notification.js
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


/* =====================================================
   ENABLE KFGC NOTIFICATIONS
===================================================== */

export async function enableNotifications() {

  if (!("Notification" in window)) {

    console.log(
      "This browser does not support notifications."
    );

    return null;

  }


  if (!("serviceWorker" in navigator)) {

    console.log(
      "Service workers are not supported."
    );

    return null;

  }


  try {

    const permission =
      await Notification.requestPermission();


    if (permission !== "granted") {

      console.log(
        "Notification permission:",
        permission
      );

      return null;

    }


    /*
      Use the EXISTING KFGC service worker.
    */

    const registration =
      await navigator.serviceWorker.ready;


    /*
      Get FCM device token.
    */

    const token =
      await getToken(
        messaging,
        {

          vapidKey:
            VAPID_KEY,

          serviceWorkerRegistration:
            registration

        }
      );


    if (!token) {

      console.log(
        "KFGC: FCM token was not generated."
      );

      return null;

    }


    /*
      Save token in Firestore.
    */

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
      "KFGC notification token registered."
    );


    return token;


  } catch (error) {

    console.error(
      "KFGC notification setup failed:",
      error
    );

    return null;

  }

}


/* =====================================================
   FOREGROUND NOTIFICATIONS
===================================================== */

onMessage(
  messaging,
  payload => {

    console.log(
      "[KFGC] Foreground notification:",
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

        window.location.href =
          url;

      };

    }

  }
);