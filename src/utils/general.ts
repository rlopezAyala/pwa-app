import { RefObject } from "react"
import { CardValue } from "../App"

export function getPercentageChange(oldPrice: number, newPrice: number) {
  return ((newPrice - oldPrice) / oldPrice) * 100
}

export function getAmounts(trades: any[], lastPricesRef: RefObject<Record<string, CardValue>>) {
  let newLastPrices = {}

  trades.forEach((trade) => {
    const newPrice = trade.p
    const oldPrice = lastPricesRef.current[trade.s] && lastPricesRef.current[trade.s].price

    let direction = true
    let percentage = 0
    if (oldPrice !== undefined) {
      percentage = getPercentageChange(oldPrice, newPrice)
      if (newPrice > oldPrice) {
        direction = true
      } else if (newPrice < oldPrice) {
        direction = false
      }
    }
    newLastPrices = {
      ...newLastPrices,
      [trade.s]: { price: newPrice, direction, percentage }
    }
  })
  return newLastPrices
}

export function getLocalStorageItem(name: string, def: string) {
  try {
    return JSON.parse(localStorage.getItem(name) || def)
  } catch {
    return []
  }
}
