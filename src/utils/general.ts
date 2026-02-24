import { CardValue, Datum } from "../types/models/trade"
import PriceService from "../services/priceService"
import TradeService from "../services/tradeService"

/**
 * @deprecated Use PriceService.getPercentageChange instead
 */
export function getPercentageChange(oldPrice: number, newPrice: number): number {
  return PriceService.getPercentageChange(oldPrice, newPrice)
}

/**
 * Calculate card values from trades
 * @deprecated Use PriceService.calculateCardValues instead
 */
export function getAmounts(trades: Datum[]): Record<string, CardValue> {
  return PriceService.calculateCardValues(trades, {})
}

/**
 * Get item from localStorage with fallback
 */
export function getLocalStorageItem<T = unknown>(name: string, def: string): T {
  try {
    const item = localStorage.getItem(name)
    return item ? JSON.parse(item) : JSON.parse(def)
  } catch (error) {
    console.error(`Error parsing localStorage item "${name}":`, error)
    return JSON.parse(def)
  }
}
