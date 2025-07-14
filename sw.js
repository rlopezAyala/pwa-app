self.addEventListener("install", (event) => {
  console.log("[SW] Installed")
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  console.log("[SW] Activated")
  event.waitUntil(self.clients.claim())
})

self.addEventListener("fetch", (event) => {
  // Dummy handler just to satisfy the requirement
  return
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  event.waitUntil(clients.openWindow("/"))
})
