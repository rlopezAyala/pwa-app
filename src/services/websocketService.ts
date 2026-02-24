import { Trade } from "../types/models/trade"

export type MessageHandler = (msg: Trade) => void
export type ConnectionHandler = () => void
export type ErrorHandler = (error: Event) => void

interface WebSocketConfig {
  apiToken: string
  url?: string
  reconnectAttempts?: number
  reconnectDelay?: number
}

export class FinnhubWebSocketService {
  private socket: WebSocket | null = null
  private messageHandlers: MessageHandler[] = []
  private connectionHandlers: ConnectionHandler[] = []
  private errorHandlers: ErrorHandler[] = []
  private closeHandlers: ConnectionHandler[] = []
  private subscribedSymbols: Set<string> = new Set()
  private config: Required<WebSocketConfig>
  private reconnectAttempts: number = 0
  private isManuallyClosing: boolean = false

  constructor(config: WebSocketConfig) {
    this.config = {
      url: "wss://ws.finnhub.io",
      reconnectAttempts: 5,
      reconnectDelay: 3000,
      ...config
    }
  }

  /**
   * Connect to Finnhub WebSocket
   */
  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const url = `${this.config.url}?token=${this.config.apiToken}`
        this.socket = new WebSocket(url)

        this.socket.addEventListener("open", () => {
          console.log("✅ WebSocket connected")
          this.reconnectAttempts = 0
          this.isManuallyClosing = false
          this.connectionHandlers.forEach((handler) => handler())
          resolve()
        })

        this.socket.addEventListener("message", (event) => {
          try {
            const msg = JSON.parse(event.data)
            if (msg.type === "trade") {
              this.messageHandlers.forEach((handler) => handler(msg))
            }
          } catch (error) {
            console.error("Error parsing message:", error)
          }
        })

        this.socket.addEventListener("error", (error) => {
          console.error("❌ WebSocket error:", error)
          this.errorHandlers.forEach((handler) => handler(error))
          reject(error)
        })

        this.socket.addEventListener("close", () => {
          console.log("🔌 WebSocket disconnected")
          this.closeHandlers.forEach((handler) => handler())

          if (!this.isManuallyClosing && this.reconnectAttempts < this.config.reconnectAttempts) {
            this.reconnect()
          }
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private reconnect(): void {
    this.reconnectAttempts++
    const delay = this.config.reconnectDelay * this.reconnectAttempts
    console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.config.reconnectAttempts})`)

    setTimeout(() => {
      this.connect()
        .then(() => {
          console.log("✅ Reconnected successfully, resubscribing to symbols...")
          this.resubscribeToAll()
        })
        .catch((error) => console.error("Reconnection failed:", error))
    }, delay)
  }

  /**
   * Subscribe to a symbol
   */
  public subscribe(symbol: string): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn(`Cannot subscribe to ${symbol}, WebSocket is not open`)
      return
    }

    if (this.subscribedSymbols.has(symbol)) {
      console.log(`Already subscribed to ${symbol}`)
      return
    }

    this.socket.send(JSON.stringify({ type: "subscribe", symbol }))
    this.subscribedSymbols.add(symbol)
    console.log(`📊 Subscribed to ${symbol}`)
  }

  /**
   * Unsubscribe from a symbol
   */
  public unsubscribe(symbol: string): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn(`Cannot unsubscribe from ${symbol}, WebSocket is not open`)
      return
    }

    this.socket.send(JSON.stringify({ type: "unsubscribe", symbol }))
    this.subscribedSymbols.delete(symbol)
    console.log(`📉 Unsubscribed from ${symbol}`)
  }

  /**
   * Resubscribe to all previously subscribed symbols
   */
  private resubscribeToAll(): void {
    this.subscribedSymbols.forEach((symbol) => this.subscribe(symbol))
  }

  /**
   * Register a message handler
   */
  public onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.push(handler)
    return () => {
      this.messageHandlers = this.messageHandlers.filter((h) => h !== handler)
    }
  }

  /**
   * Register a connection handler
   */
  public onConnect(handler: ConnectionHandler): () => void {
    this.connectionHandlers.push(handler)
    return () => {
      this.connectionHandlers = this.connectionHandlers.filter((h) => h !== handler)
    }
  }

  /**
   * Register an error handler
   */
  public onError(handler: ErrorHandler): () => void {
    this.errorHandlers.push(handler)
    return () => {
      this.errorHandlers = this.errorHandlers.filter((h) => h !== handler)
    }
  }

  /**
   * Register a close handler
   */
  public onClose(handler: ConnectionHandler): () => void {
    this.closeHandlers.push(handler)
    return () => {
      this.closeHandlers = this.closeHandlers.filter((h) => h !== handler)
    }
  }

  /**
   * Disconnect from WebSocket
   */
  public disconnect(): void {
    this.isManuallyClosing = true
    if (this.socket) {
      this.socket.close()
      this.socket = null
      this.subscribedSymbols.clear()
    }
  }

  /**
   * Get connection status
   */
  public isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN
  }

  /**
   * Get subscribed symbols
   */
  public getSubscribedSymbols(): string[] {
    return Array.from(this.subscribedSymbols)
  }
}

export default FinnhubWebSocketService
