import React, { useEffect, useRef, useState } from "react"
import "./App.css"
import LeftForm from "./components/LeftForm/LeftForm"
import { Datum, Trade } from "./types/models/trade"
import Chart from "./components/Chart/Chart"
import Cards from "./components/Cards/Cards"
import { getAmounts, getLocalStorageItem } from "./utils/general"
import { triggerPriceAlert } from "./utils/triggerPriceAlert"
const apiToken = "d1q3rj9r01qrh89o0840d1q3rj9r01qrh89o084g"

const socket = new WebSocket(`wss://ws.finnhub.io?token=${apiToken}`)
export interface Alert {
  value: string
  price: number
}
export interface CardValue {
  price: number
  direction: string
  percentage: number
}

function App() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [alert, setAlert] = useState<Alert>({
    value: "",
    price: 0.0
  })
  const symbolList = ["COINBASE:BTC-USD", "COINBASE:ETH-USD", "OANDA:EUR_USD", "OANDA:GBP_USD", "AAPL", "MSFT", "AMZN"]
  const [lastPrices, setLastPrices] = useState<Record<string, CardValue>>({})
  const lastPricesRef = useRef<Record<string, CardValue>>({})
  const lastTrades = useRef<Trade[]>([])
  const alertPriceRef = useRef<Alert>({
    value: "",
    price: 0.0
  })

  useEffect(() => {
    const stored = getLocalStorageItem("trades", "[]")
    const priceRef = getLocalStorageItem("lastPrices", JSON.stringify({}))
    setTrades(stored)
    setLastPrices(priceRef)
  }, [])

  useEffect(() => {
    socket.addEventListener("open", function (event) {
      socket.send(JSON.stringify({ type: "subscribe", symbol: "COINBASE:BTC-USD" }))
      socket.send(JSON.stringify({ type: "subscribe", symbol: "COINBASE:ETH-USD" }))
      socket.send(JSON.stringify({ type: "subscribe", symbol: "OANDA:EUR_USD" }))
      socket.send(JSON.stringify({ type: "subscribe", symbol: "OANDA:GBP_USD" }))
      socket.send(JSON.stringify({ type: "subscribe", symbol: "AAPL" }))
      socket.send(JSON.stringify({ type: "subscribe", symbol: "MSFT" }))
      socket.send(JSON.stringify({ type: "subscribe", symbol: "AMZN" }))
    })

    // Listen for messages
    socket.addEventListener("message", function (event) {
      console.log("Message from server ", event.data)
      const msg = JSON.parse(event.data)

      if (msg.type === "trade") {
        const newTrades = []
        newTrades.push(...lastTrades.current)
        newTrades.push(...msg.data)
        setTrades(newTrades)

        msg.data.forEach((trade: any) => {
          if (trade.s === alertPriceRef.current.value && trade.p <= alertPriceRef.current.price) {
            // push notification
            triggerPriceAlert(trade.s, alertPriceRef.current.price as unknown as number)
          }
        })
      }
    })

    if ("serviceWorker" in navigator && "Notification" in window) {
      window.addEventListener("load", async () => {
        try {
          const registration = await navigator.serviceWorker.register("/sw.js")
          console.log("Service Worker registered:", registration)

          // Ask for permission
          const permission = await Notification.requestPermission()
          console.log("Notification permission:", permission)
        } catch (err) {
          console.error("Service Worker registration failed:", err)
        }
      })
    }

    return () => {
      socket.close()
    }
  }, [])

  useEffect(() => {
    alertPriceRef.current = alert
  }, [alert])

  useEffect(() => {
    if (trades != lastTrades.current) {
      lastTrades.current = trades
      const lastTradesSliced = lastTrades.current.slice(-100)

      localStorage.setItem("trades", JSON.stringify(lastTradesSliced))
      handleTrades(trades)
    }
  }, [trades])

  function selectValue(value: string, price: string) {
    socket.send(JSON.stringify({ type: "subscribe", symbol: value }))
    setAlert({ value, price: parseFloat(price) })
  }

  /**
   * This funtion compares the new price with the old price and gets the percentage, and the direction to change the color and the arrow
   * @param trades
   */
  function handleTrades(trades: any[]) {
    let newLastPrices = {}

    newLastPrices = getAmounts(trades, lastPricesRef)

    setLastPrices({ ...lastPrices, ...newLastPrices })
    lastPricesRef.current = { ...lastPrices, ...newLastPrices }
    localStorage.setItem("lastPrices", JSON.stringify(lastPricesRef.current))
  }

  return (
    <div className="App">
      <div className="Top-Bar">
        <Cards cardInfo={lastPrices} names={symbolList as string[]} />
      </div>
      <div className="App-header">
        <LeftForm
          dropdownData={symbolList as string[]}
          selectValue={(value, price) => {
            selectValue(value, price)
          }}
        />
        <Chart socket={socket} cardInfo={trades as unknown as Datum[]} chartS={alert}></Chart>
      </div>
    </div>
  )
}

export default App
