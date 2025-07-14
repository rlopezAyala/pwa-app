export function initWebSocket(apiToken: string) {
  return new WebSocket(`wss://ws.finnhub.io?token=${apiToken}`)
}

export function openSocket(symbol: string[], socket: any) {
  socket.addEventListener("open", () => {
    symbol.length > 0 &&
      symbol.forEach((item) => {
        socket.send(JSON.stringify({ type: "subscribe", item }))
      })
  })
}
export function messageSocket(socket: any) {
  socket.addEventListener("message", (event: any) => {
    const data = JSON.parse(event.data)
    console.log("Real-time trade data:", data)
  })
}

export function closeSocket(socket: any) {
  socket.addEventListener("close", () => {
    console.log("Disconnected from Finnhub WebSocket")
  })
}
