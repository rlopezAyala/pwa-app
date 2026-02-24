/**
 * Notification/Alert service
 * Handles push notifications and price alerts
 */
export class NotificationService {
  /**
   * Request notification permission from user
   * @returns Promise resolving to permission status
   */
  public static async requestPermission(): Promise<NotificationPermission> {
    if (!("Notification" in window)) {
      console.warn("This browser does not support notifications")
      return "denied"
    }

    if (Notification.permission === "granted") {
      return "granted"
    }

    if (Notification.permission !== "denied") {
      return await Notification.requestPermission()
    }

    return "denied"
  }

  /**
   * Check if notifications are available and permitted
   */
  public static isPermitted(): boolean {
    return "Notification" in window && Notification.permission === "granted"
  }

  /**
   * Initialize service worker for notifications
   */
  public static async initializeServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!("serviceWorker" in navigator)) {
      console.warn("Service Workers are not supported in this browser")
      return null
    }

    try {
      const registration = await navigator.serviceWorker.register("/sw.js")
      console.log("✅ Service Worker registered:", registration)
      return registration
    } catch (error) {
      console.error("❌ Service Worker registration failed:", error)
      return null
    }
  }

  /**
   * Show a price alert notification
   * @param symbol Stock symbol
   * @param price Alert price
   * @param currentPrice Current price (optional)
   */
  public static async showPriceAlert(symbol: string, price: number, currentPrice?: number): Promise<void> {
    if (!this.isPermitted()) {
      console.warn("Notification permission not granted")
      // Try to request permission
      const permission = await this.requestPermission()
      if (permission !== "granted") {
        return
      }
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration()
      if (!registration) {
        console.warn("No service worker registration found")
        return
      }

      const body = currentPrice
        ? `${symbol} has reached $${price.toFixed(2)} (Current: $${currentPrice.toFixed(2)})`
        : `${symbol} has reached $${price.toFixed(2)}`

      await registration.showNotification("📈 Price Alert!", {
        body,
        tag: `price-alert-${symbol}`,
        badge: "/favicon.ico",
        icon: "/image.png",
        requireInteraction: true
      })

      console.log(`🔔 Price alert sent for ${symbol}`)
    } catch (error) {
      console.error("Error showing notification:", error)
    }
  }

  /**
   * Show a general notification
   * @param title Notification title
   * @param options Notification options
   */
  public static async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (!this.isPermitted()) {
      return
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration()
      if (!registration) {
        console.warn("No service worker registration found")
        return
      }

      await registration.showNotification(title, {
        badge: "/favicon.ico",
        icon: "/image.png",
        ...options
      })
    } catch (error) {
      console.error("Error showing notification:", error)
    }
  }

  /**
   * Close a notification by tag
   * @param tag Notification tag
   */
  public static async closeNotification(tag: string): Promise<void> {
    if (!("serviceWorker" in navigator)) {
      return
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration()
      if (!registration) {
        return
      }

      const notifications = await registration.getNotifications({ tag })
      notifications.forEach((notification) => notification.close())
    } catch (error) {
      console.error("Error closing notification:", error)
    }
  }

  /**
   * Close all price alert notifications
   */
  public static async closeAllPriceAlerts(): Promise<void> {
    if (!("serviceWorker" in navigator)) {
      return
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration()
      if (!registration) {
        return
      }

      const notifications = await registration.getNotifications()
      notifications.forEach((notification) => notification.close())
    } catch (error) {
      console.error("Error closing notifications:", error)
    }
  }
}

export default NotificationService
