import { CardValue, Datum } from "../types/models/trade"

/**
 * Price calculation and comparison service
 */
export class PriceService {
  /**
   * Calculate percentage change between two prices
   * @param oldPrice Previous price
   * @param newPrice Current price
   * @returns Percentage change
   */
  public static getPercentageChange(oldPrice: number, newPrice: number): number {
    if (oldPrice === 0) return 0
    return ((newPrice - oldPrice) / oldPrice) * 100
  }

  /**
   * Determine price direction
   * @param oldPrice Previous price
   * @param newPrice Current price
   * @returns true for up, false for down
   */
  public static getDirection(oldPrice: number, newPrice: number): boolean {
    return newPrice >= oldPrice
  }

  /**
   * Calculate new card values from trades
   * @param trades Array of trades
   * @param lastPrices Current card values
   * @returns Updated card values
   */
  public static calculateCardValues(trades: Datum[], lastPrices: Record<string, CardValue>): Record<string, CardValue> {
    const newValues: Record<string, CardValue> = {}

    trades.forEach((trade) => {
      const newPrice = trade.p
      const oldCardValue = lastPrices[trade.s]
      const oldPrice = oldCardValue?.price

      let direction = true // Default to up for first trade
      let percentage = 0

      if (oldPrice !== undefined && oldPrice !== null) {
        percentage = this.getPercentageChange(oldPrice, newPrice)
        direction = this.getDirection(oldPrice, newPrice)
      }

      newValues[trade.s] = {
        price: newPrice,
        direction,
        percentage
      }
    })

    return newValues
  }

  /**
   * Check if price meets alert criteria
   * Both increases and decreases trigger alerts
   * @param currentPrice Current trade price
   * @param alertPrice Alert threshold price
   * @param alertType Type of alert: 'above', 'below', or 'any'
   * @returns true if alert should trigger
   */
  public static shouldTriggerAlert(currentPrice: number, alertPrice: number, alertType: "above" | "below" | "any" = "any"): boolean {
    switch (alertType) {
      case "above":
        return currentPrice >= alertPrice
      case "below":
        return currentPrice <= alertPrice
      case "any":
      default:
        return currentPrice === alertPrice || currentPrice >= alertPrice || currentPrice <= alertPrice
    }
  }

  /**
   * Check if price has crossed a threshold
   * @param oldPrice Previous price
   * @param newPrice Current price
   * @param threshold Threshold price
   * @returns true if price crossed the threshold
   */
  public static hasThresholdCrossed(oldPrice: number | undefined, newPrice: number, threshold: number): boolean {
    if (oldPrice === undefined || oldPrice === null) {
      return false
    }
    // Crossed from below
    if (oldPrice < threshold && newPrice >= threshold) {
      return true
    }
    // Crossed from above
    if (oldPrice > threshold && newPrice <= threshold) {
      return true
    }
    return false
  }
}

export default PriceService
