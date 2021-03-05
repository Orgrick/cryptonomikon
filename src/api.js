const API_KEY =
  '66abcb66e492b555882a5b81ddcb79614d46bb69e05c75d8a52193076a00ada1'
const tickersHandlers = new Map()
//сделать через URL searchParams
export const loadTickers = () => {
  if (tickersHandlers.size === 0) return
  fetch(
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${[
      ...tickersHandlers.keys()
    ].join(',')}&tsyms=USD&api_key=${API_KEY}`
  )
    .then(r => r.json())
    .then(rawData => {
      const updatedPrices = Object.fromEntries(
        Object.entries(rawData).map(([key, value]) => [key, value.USD])
      )
      Object.entries(updatedPrices).forEach(([currency, newPrice]) => {
        const handlers = tickersHandlers.get(currency) ?? []
        handlers.forEach(fn => fn(newPrice))
      })
    })
}
export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickersHandlers.get(ticker) || []
  tickersHandlers.set(ticker, [...subscribers, cb])
}
export const unsubscribeToTicker = ticker => {
  // const subscribers = tickersHandlers.get(ticker) || []
  // tickersHandlers.set(
  //   ticker,
  //   subscribers.filter(fn => fn !== cb)
  // )
  tickersHandlers.delete(ticker)
}

setInterval(loadTickers, 5000)

window.tickersHandlers = tickersHandlers
