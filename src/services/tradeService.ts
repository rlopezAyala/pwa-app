import { Datum } from "../types/models/trade"

const MAX_STORED_TRADES = 100

/**
 * Trade data management service
 * Handles storage, retrieval, and memory management of trades
 */
export class TradeService {
  /**
   * Store trades in localStorage
   * @param trades Trades to store (limited to MAX_STORED_TRADES)
   */
  public static storeTradesInMemory(trades: Datum[]): Datum[] {
    const limited = trades.slice(Math.max(0, trades.length - MAX_STORED_TRADES))
    try {
      localStorage.setItem("trades", JSON.stringify(limited))
    } catch (error) {
      console.error("Error storing trades:", error)
    }
    return limited
  }

  /**
   * Load trades from localStorage
   * @returns Stored trades or empty array if none found
   */
  public static loadTradesFromMemory(): Datum[] {
    try {
      const stored = localStorage.getItem("trades")
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error("Error loading trades:", error)
      return []
    }
  }

  /**
   * Merge new trades with existing ones, avoiding duplicates
   * @param existing Existing trades
   * @param newTrades New trades to add
   * @returns Merged trades with limit applied
   */
  public static mergeTrades(existing: Datum[], newTrades: Datum[]): Datum[] {
    const merged = [...existing, ...newTrades]
    // Deduplicate by trade timestamp and symbol (simple approach)
    const unique = Array.from(new Map(merged.map((trade) => [`${trade.s}-${trade.t}`, trade])).values())

    // Limit to MAX_STORED_TRADES
    return unique.slice(Math.max(0, unique.length - MAX_STORED_TRADES))
  }

  /**
   * Filter trades by symbol
   * @param trades Trades to filter
   * @param symbol Symbol to filter by
   * @returns Filtered trades
   */
  public static filterBySymbol(trades: Datum[], symbol: string): Datum[] {
    return trades.filter((trade) => trade.s === symbol)
  }

  /**
   * Get the last N trades for a symbol
   * @param trades Trades to search
   * @param symbol Symbol to filter by
   * @param count Number of trades to return
   * @returns Last N trades for the symbol
   */
  public static getLastTradesForSymbol(trades: Datum[], symbol: string, count: number = 30): Datum[] {
    return this.filterBySymbol(trades, symbol).slice(Math.max(0, trades.length - count))
  }

  /**
   * Get the most recent price for a symbol
   * @param trades Trades to search
   * @param symbol Symbol to find
   * @returns Most recent price or undefined
   */
  public static getLatestPriceForSymbol(trades: Datum[], symbol: string): number | undefined {
    const filtered = this.filterBySymbol(trades, symbol)
    return filtered.length > 0 ? filtered[filtered.length - 1].p : undefined
  }

  /**
   * Check if we have received new trades
   * @param oldTrades Previous trades array
   * @param newTrades Current trades array
   * @returns true if there are new trades
   */
  public static hasNewTrades(oldTrades: Datum[], newTrades: Datum[]): boolean {
    if (oldTrades.length !== newTrades.length) {
      return true
    }
    // Compare the last trade timestamp
    if (oldTrades.length > 0 && newTrades.length > 0) {
      const oldLast = oldTrades[oldTrades.length - 1]
      const newLast = newTrades[newTrades.length - 1]
      return oldLast.t !== newLast.t || oldLast.s !== newLast.s
    }
    return false
  }
}

export default TradeService
