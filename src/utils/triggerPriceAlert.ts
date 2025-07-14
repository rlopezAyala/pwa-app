/**
 * This functions check if push notifications are granted and push a notification
 */
export function triggerPriceAlert(symbol: string, price: number) {
  if (Notification.permission === "granted") {
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (reg) {
        reg.showNotification("Price Alert!", {
          body: `${symbol} has reached $${price.toFixed(2)}`,
          tag: "price-alert",
          icon: "/image.png",
          requireInteraction: true // keeps the notification visible until user acts
        })
      } else {
        console.warn("No service worker registration found.")
      }
    })
  } else {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        triggerPriceAlert(symbol, price) // retry
      }
    })
  }
}
