const API_KEY =
  '66abcb66e492b555882a5b81ddcb79614d46bb69e05c75d8a52193076a00ada1'
const tickersHandlers = new Map()
const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
)
const AGGREGATE_INDEX = '5'
const ERROR_INDEX = '500'
socket.addEventListener('message', e => {
  const {
    TYPE: type,
    FROMSYMBOL: currency,
    PRICE: newPrice,
    MESSAGE: message,
    PARAMETER: parametr
  } = JSON.parse(e.data)
  let ticekrName = currency
  if (parametr && message == 'INVALID_SUB') ticekrName = getTickerName(parametr)
  const handlers = tickersHandlers.get(ticekrName) ?? []
  if (type == ERROR_INDEX && message == 'INVALID_SUB') {
    handlers.forEach(fn => fn('--'))
    return
  }
  if (type !== AGGREGATE_INDEX || newPrice === undefined) {
    return
  }
  handlers.forEach(fn => fn(newPrice))
})
//сделать через URL searchParams
// export const loadTickers = () => {
//   if (tickersHandlers.size === 0) return
//   fetch(
//     `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${[
//       ...tickersHandlers.keys()
//     ].join(',')}&tsyms=USD&api_key=${API_KEY}`
//   )
//     .then(r => r.json())
//     .then(rawData => {
//       const updatedPrices = Object.fromEntries(
//         Object.entries(rawData).map(([key, value]) => [key, value.USD])
//       )
//       Object.entries(updatedPrices).forEach(([currency, newPrice]) => {
//         const handlers = tickersHandlers.get(currency) ?? []
//         handlers.forEach(fn => fn(newPrice))
//       })
//     })
// }
function sendToWebSocket(message) {
  const stringifiedMessage = JSON.stringify(message)
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringifiedMessage)
    return
  }
  socket.addEventListener(
    'open',
    () => {
      socket.send(stringifiedMessage)
    },
    { once: true }
  )
}
function subscribeToTickerOnWs(ticker) {
  sendToWebSocket({
    action: 'SubAdd',
    subs: [`5~CCCAGG~${ticker}~USD`]
  })
}
function unsubscribeToTickerOnWs(ticker) {
  sendToWebSocket({
    action: 'SubRemove',
    subs: [`5~CCCAGG~${ticker}~USD`]
  })
}
function getTickerName(subs) {
  return subs.split('~')[2]
}
export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickersHandlers.get(ticker) || []
  tickersHandlers.set(ticker, [...subscribers, cb])
  subscribeToTickerOnWs(ticker)
}
export const unsubscribeToTicker = ticker => {
  // const subscribers = tickersHandlers.get(ticker) || []
  // tickersHandlers.set(
  //   ticker,
  //   subscribers.filter(fn => fn !== cb)
  // )
  tickersHandlers.delete(ticker)
  unsubscribeToTickerOnWs(ticker)
}

async function getCryptoNames() {
  const f = await fetch(
    'https://min-api.cryptocompare.com/data/all/coinlist?summary=true'
  )
  const data = await f.json()
  return Object.keys(data.Data)
}
export const cryptoNames = getCryptoNames()
