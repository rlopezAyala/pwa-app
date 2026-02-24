import React, { useEffect, useRef, useState } from "react"
import "./App.css"
import LeftForm from "./components/LeftForm/LeftForm"
import { Datum, CardValue } from "./types/models/trade"
import Chart from "./components/Chart/Chart"
import Cards from "./components/Cards/Cards"
import { getLocalStorageItem } from "./utils/general"
import FinnhubWebSocketService from "./services/websocketService"
import PriceService from "./services/priceService"
import TradeService from "./services/tradeService"
import NotificationService from "./services/notificationService"

const API_TOKEN = "d1q3rj9r01qrh89o0840d1q3rj9r01qrh89o084g"

export interface Alert {
  value: string
  price: number
  type: "above" | "below" | "any"
}

// Supported symbols for subscription
const SYMBOL_LIST = ["COINBASE:BTC-USD", "COINBASE:ETH-USD", "OANDA:EUR_USD", "OANDA:GBP_USD", "AAPL", "MSFT", "AMZN"]

function App() {
  // ========== STATE ==========
  const [trades, setTrades] = useState<Datum[]>([])
  const [lastPrices, setLastPrices] = useState<Record<string, CardValue>>({})
  const [alert, setAlert] = useState<Alert>({
    value: "",
    price: 0.0,
    type: "any"
  })
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("disconnected")

  // ========== REFS ==========
  const wsServiceRef = useRef<FinnhubWebSocketService | null>(null)
  const unsubscribersRef = useRef<(() => void)[]>([])
  const alertPriceRef = useRef<Alert>(alert)
  const lastPricesRef = useRef<Record<string, CardValue>>({})

  // ========== INITIALIZATION ==========
  /**
   * Initialize WebSocket service and handlers
   */
  useEffect(() => {
    // Load persisted data
    const storedTrades = getLocalStorageItem<Datum[]>("trades", "[]")
    const storedPrices = getLocalStorageItem<Record<string, CardValue>>("lastPrices", "{}")
    setTrades(storedTrades)
    setLastPrices(storedPrices)
    lastPricesRef.current = storedPrices

    // Initialize notification service
    NotificationService.requestPermission().catch((err: unknown) => console.error("Notification permission error:", err))
    NotificationService.initializeServiceWorker().catch((err: unknown) => console.error("Service Worker init error:", err))

    // Initialize WebSocket service
    wsServiceRef.current = new FinnhubWebSocketService({ apiToken: API_TOKEN })

    // Set up connection handlers
    const unsubConnect = wsServiceRef.current.onConnect(() => {
      setConnectionStatus("connected")
      subscribeToInitialSymbols()
    })

    const unsubError = wsServiceRef.current.onError((_error: Event) => {
      console.error("WebSocket error:", _error)
      setConnectionStatus("disconnected")
    })

    const unsubClose = wsServiceRef.current.onClose(() => {
      setConnectionStatus("disconnected")
    })

    // Set up message handler
    const unsubMessage = wsServiceRef.current.onMessage((_msg: any) => {
      handleTradeMessage(_msg.data)
    })

    // Connect to WebSocket
    setConnectionStatus("connecting")
    wsServiceRef.current.connect().catch((_err: unknown) => {
      console.error("Failed to connect to WebSocket:", _err)
      setConnectionStatus("disconnected")
    })

    // Store unsubscribers for cleanup
    unsubscribersRef.current = [unsubConnect, unsubError, unsubClose, unsubMessage]

    // Cleanup on unmount
    return () => {
      unsubscribersRef.current.forEach((_unsub: () => void) => _unsub())
      wsServiceRef.current?.disconnect()
    }
  }, [])

  // ========== ALERT REF SYNC ==========
  /**
   * Keep alert ref in sync with state
   */
  useEffect(() => {
    alertPriceRef.current = alert
  }, [alert])

  // ========== LAST PRICES REF SYNC ==========
  /**
   * Keep last prices ref in sync with state
   */
  useEffect(() => {
    lastPricesRef.current = lastPrices
  }, [lastPrices])

  // ========== HANDLERS ==========
  /**
   * Handle incoming trade messages
   */
  function handleTradeMessage(tradeData: Datum[]): void {
    // Merge with existing trades and store
    const mergedTrades = TradeService.mergeTrades(trades, tradeData)
    setTrades(mergedTrades)
    TradeService.storeTradesInMemory(mergedTrades)

    // Update card prices and percentages
    const newCardValues = PriceService.calculateCardValues(tradeData, lastPricesRef.current)
    const updatedPrices = { ...lastPricesRef.current, ...newCardValues }
    setLastPrices(updatedPrices)
    lastPricesRef.current = updatedPrices

    try {
      localStorage.setItem("lastPrices", JSON.stringify(updatedPrices))
    } catch (error) {
      console.error("Error storing last prices:", error)
    }

    // Check for price alerts
    checkPriceAlerts(tradeData)
  }

  /**
   * Check if any trades trigger price alerts
   */
  function checkPriceAlerts(tradeData: Datum[]): void {
    if (!alertPriceRef.current.value) {
      return // No alert set
    }

    tradeData.forEach((trade) => {
      if (trade.s === alertPriceRef.current.value) {
        const oldPrice = lastPricesRef.current[trade.s]?.price

        // Check if threshold was crossed or if current price meets alert criteria
        const shouldAlert =
          PriceService.hasThresholdCrossed(oldPrice, trade.p, alertPriceRef.current.price) ||
          PriceService.shouldTriggerAlert(trade.p, alertPriceRef.current.price, alertPriceRef.current.type)

        if (shouldAlert) {
          NotificationService.showPriceAlert(trade.s, alertPriceRef.current.price, trade.p).catch((_err: unknown) =>
            console.error("Error showing notification:", _err)
          )
        }
      }
    })
  }

  /**
   * Subscribe to initial symbols
   */
  function subscribeToInitialSymbols(): void {
    if (!wsServiceRef.current) return

    SYMBOL_LIST.forEach((symbol) => {
      wsServiceRef.current?.subscribe(symbol)
    })
  }

  /**
   * Handle symbol selection and alert setup
   */
  function selectValue(value: string, price: string, alertType: "above" | "below" | "any" = "any"): void {
    if (!wsServiceRef.current) {
      console.error("WebSocket service not initialized")
      return
    }

    // Subscribe to the symbol
    wsServiceRef.current.subscribe(value)

    // Update alert
    setAlert({
      value,
      price: parseFloat(price),
      type: alertType
    })

    console.log(`📌 Alert set for ${value} at $${price} (${alertType})`)
  }

  // ========== RENDER ==========
  return (
    <div className="App">
      <div
        className="connection-status"
        style={{
          textAlign: "center",
          padding: "10px",
          backgroundColor: connectionStatus === "connected" ? "#4caf50" : connectionStatus === "connecting" ? "#ff9800" : "#f44336",
          color: "white",
          fontSize: "12px"
        }}
      >
        {connectionStatus === "connected" && "✅ Connected"}
        {connectionStatus === "connecting" && "🔄 Connecting..."}
        {connectionStatus === "disconnected" && "❌ Disconnected"}
      </div>

      <div className="Top-Bar">
        <Cards cardInfo={lastPrices} names={SYMBOL_LIST} alertPrice={alert.price} />
      </div>

      <div className="App-header">
        <LeftForm dropdownData={SYMBOL_LIST} selectValue={selectValue} />
        <Chart cardInfo={trades} chartS={alert} />
      </div>
    </div>
  )
}

export default App
