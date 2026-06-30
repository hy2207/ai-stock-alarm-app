// PUSH_DISABLED: unregisters any previously installed OneSignal service worker.
// Restore the original line below when re-enabling push:
// importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", () => self.registration.unregister());
