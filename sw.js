/*
=========================================================
 KFGC MEDIA APP — SINGLE SERVICE WORKER
 Handles:
   1. PWA installation
   2. Offline caching
   3. Firebase Cloud Messaging
   4. Background notifications
   5. Notification clicks
=========================================================
*/


/* =====================================================
   PWA CACHE
===================================================== */

const CACHE_NAME = "kfgc-media-v3";

const APP_SHELL = [
  "./",
  "./index.html",
  "./offline.html",
  "./manifest.json",

  "./styles.css",
  "./sty.css",
  "./script.js",
  "./theme.js",
  "./auth-guard.js",
  "./bible.js",
  "./firebase.js",
  "./notification.js",

  "./favicon.ico",
  "./kfgc.jpg",
  "./share.jpg",

  "./icons/icon-192.png",
  "./icons/icon-512.png"
];


/* =====================================================
   FIREBASE CLOUD MESSAGING
===================================================== */

importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js"
);


/* Firebase configuration */

firebase.initializeApp({

  apiKey:
    "AIzaSyCPWH5BCSFp3Qqs_-JVfqDkUCEfhyg4VX4",

  authDomain:
    "kfgc-media-app.firebaseapp.com",

  projectId:
    "kfgc-media-app",

  storageBucket:
    "kfgc-media-app.firebasestorage.app",

  messagingSenderId:
    "203397572574",

  appId:
    "1:203397572574:web:db903da199482fd6cedf4f"

});


const messaging = firebase.messaging();


/* =====================================================
   INSTALL
===================================================== */

self.addEventListener("install", event => {

  event.waitUntil(

    caches
      .open(CACHE_NAME)

      .then(cache => {

        return cache.addAll(APP_SHELL);

      })

      .then(() => {

        return self.skipWaiting();

      })

  );

});


/* =====================================================
   ACTIVATE
===================================================== */

self.addEventListener("activate", event => {

  event.waitUntil(

    caches
      .keys()

      .then(keys => {

        return Promise.all(

          keys
            .filter(key => key !== CACHE_NAME)

            .map(key =>
              caches.delete(key)
            )

        );

      })

      .then(() => {

        return self.clients.claim();

      })

  );

});


/* =====================================================
   FETCH
   Offline-first fallback
===================================================== */

self.addEventListener("fetch", event => {

  if (event.request.method !== "GET") {
    return;
  }


  event.respondWith(

    fetch(event.request)

      .then(response => {

        /*
          Only cache successful responses.
        */

        if (
          response &&
          response.status === 200 &&
          response.type !== "opaque"
        ) {

          const responseClone =
            response.clone();

          caches
            .open(CACHE_NAME)
            .then(cache => {

              cache.put(
                event.request,
                responseClone
              );

            });

        }

        return response;

      })

      .catch(() => {

        return caches
          .match(event.request)

          .then(cachedResponse => {

            return (
              cachedResponse ||
              caches.match("./offline.html")
            );

          });

      })

  );

});


/* =====================================================
   FIREBASE BACKGROUND MESSAGE
===================================================== */

messaging.onBackgroundMessage(payload => {

  console.log(
    "[KFGC SW] Background message received:",
    payload
  );


  const notification =
    payload.notification || {};


  const title =
    notification.title ||
    payload.data?.title ||
    "KFGC Media App";


  const body =
    notification.body ||
    payload.data?.body ||
    "You have a new KFGC update.";


  const destination =
    payload.data?.url ||
    "./index.html";


  const notificationOptions = {

    body: body,

    icon:
      "./icons/icon-192.png",

    badge:
      "./icons/icon-192.png",

    data: {

      url: destination

    },

    vibrate: [
      200,
      100,
      200
    ]

  };


  return self.registration.showNotification(
    title,
    notificationOptions
  );

});


/* =====================================================
   NOTIFICATION CLICK
===================================================== */

self.addEventListener(
  "notificationclick",
  event => {

    console.log(
      "[KFGC SW] Notification clicked"
    );


    event.notification.close();


    const destination =
      event.notification?.data?.url ||
      "./index.html";


    event.waitUntil(

      clients
        .matchAll({

          type: "window",

          includeUncontrolled: true

        })

        .then(clientList => {

          /*
            If KFGC Media App is already open,
            navigate that window.
          */

          for (const client of clientList) {

            if (
              "navigate" in client &&
              "focus" in client
            ) {

              return client
                .navigate(destination)
                .then(() =>
                  client.focus()
                );

            }

          }


          /*
            Otherwise open a new window.
          */

          if (clients.openWindow) {

            return clients.openWindow(
              destination
            );

          }

        })

    );

  }
);
