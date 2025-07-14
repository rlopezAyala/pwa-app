export async function fetchSymbols(exchange: string, apiKey: string) {
  const res = await fetch(`https://finnhub.io/api/v1/stock/symbol?exchange=${exchange}&token=${apiKey}`)
  if (!res.ok) throw new Error("Failed to load symbols")
  return res.json()
}
