export function triggerPriceAlert(symbol: string, price: number) {
  if (Notification.permission === "granted") {
    navigator.serviceWorker.getRegistration().then((reg) => {
      reg?.showNotification("Price Alert!", {
        body: `${symbol} has reached $${price.toFixed(2)}`,
        tag: "price-alert",
        icon: "/src/icons/image.png" // <- important!
      })
    })
  }
}
