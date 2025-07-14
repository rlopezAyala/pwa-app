import React, { useEffect, useState } from "react"
import logo from "./logo.svg"
import "./App.css"
import LeftForm from "./components/LeftForm/LeftForm"
import { initWebSocket, openSocket } from "./utils/webSocket"
import { fetchSymbols } from "./utils/fetch"
import { Datum, Trade } from "./types/models/trade"
import Chart from "./components/Chart/Chart"
import Cards from "./components/Cards/Cards"
const apiToken = "d1q3rj9r01qrh89o0840d1q3rj9r01qrh89o084g"

const socket = new WebSocket(`wss://ws.finnhub.io?token=${apiToken}`)
interface Alert {
  value: string
  price: string
}

function App() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [alert, setAlert] = useState<Alert>({
    value: "",
    price: ""
  })
  const symbolList = ["COINBASE:BTC-USD", "COINBASE:ETH-USD", "OANDA:EUR_USD", "OANDA:GBP_USD", "AAPL.US", "MSFT.US", "AMZN.US"]

  useEffect(() => {
    socket.addEventListener("open", function (event) {
      socket.send(JSON.stringify({ type: "subscribe", symbol: "COINBASE:BTC-USD" }))
      socket.send(JSON.stringify({ type: "subscribe", symbol: "COINBASE:ETH-USD" }))
      socket.send(JSON.stringify({ type: "subscribe", symbol: "OANDA:EUR_USD" }))
      socket.send(JSON.stringify({ type: "subscribe", symbol: "OANDA:GBP_USD" }))
      socket.send(JSON.stringify({ type: "subscribe", symbol: "AAPL.US" }))
      socket.send(JSON.stringify({ type: "subscribe", symbol: "MSFT.US" }))
      socket.send(JSON.stringify({ type: "subscribe", symbol: "AMZN.US" }))
    })

    // Listen for messages
    socket.addEventListener("message", function (event) {
      console.log("Message from server ", event.data)
      const msg = JSON.parse(event.data)

      if (msg.type === "trade") {
        const newTrades = []

        newTrades.push(...trades)
        newTrades.push(...msg.data)
        setTrades(newTrades)

        msg.data.forEach((trade: any) => {
          if (trade.s === alert.value && trade.p <= alert.price) {
            // alertUser(alert.symbol, trade.p);
          }
        })
      }
    })

    return () => {
      socket.close()
    }
  }, [])

  function selectValue(value: string, price: string) {
    socket.send(JSON.stringify({ type: "subscribe", symbol: value }))
    setAlert({ value, price })
  }

  return (
    <div className="App">
      <div className="Top-Bar">
        <Cards cardInfo={trades as Trade[]} names={symbolList as string[]} />
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
