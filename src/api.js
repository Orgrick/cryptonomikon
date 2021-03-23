// const API_KEY =
//   '66abcb66e492b555882a5b81ddcb79614d46bb69e05c75d8a52193076a00ada1'
// const tickersHandlers = new Map()
// const socket = new WebSocket(
//   `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
// )
// const AGGREGATE_INDEX = '5'
// const ERROR_INDEX = '500'
// socket.addEventListener('message', e => {
//   const {
//     TYPE: type,
//     PRICE: newPrice,
//     MESSAGE: message,
//     PARAMETER: parametr
//   } = JSON.parse(e.data)
//   let { FROMSYMBOL: currency } = JSON.parse(e.data)
//   if (parametr && message == 'INVALID_SUB') currency = getTickerName(parametr)
//   const handlers = tickersHandlers.get(currency) ?? []
//   if (type == ERROR_INDEX && message == 'INVALID_SUB') {
//     handlers.forEach(fn => fn('--'))
//     return
//   }
//   if (type !== AGGREGATE_INDEX || newPrice === undefined) {
//     return
//   }
//   handlers.forEach(fn => fn(newPrice))
// })
// function sendToWebSocket(message) {
//   const stringifiedMessage = JSON.stringify(message)
//   if (socket.readyState === WebSocket.OPEN) {
//     socket.send(stringifiedMessage)
//     return
//   }
//   socket.addEventListener(
//     'open',
//     () => {
//       socket.send(stringifiedMessage)
//     },
//     { once: true }
//   )
// }
// function subscribeToTickerOnWs(ticker) {
//   sendToWebSocket({
//     action: 'SubAdd',
//     subs: [`5~CCCAGG~${ticker}~USD`]
//   })
// }
// function unsubscribeToTickerOnWs(ticker) {
//   sendToWebSocket({
//     action: 'SubRemove',
//     subs: [`5~CCCAGG~${ticker}~USD`]
//   })
// }
// function getTickerName(subs) {
//   return subs.split('~')[2]
// }
// export const subscribeToTicker = (ticker, cb) => {
//   const subscribers = tickersHandlers.get(ticker) || []
//   tickersHandlers.set(ticker, [...subscribers, cb])
//   subscribeToTickerOnWs(ticker)
// }
// export const unsubscribeToTicker = ticker => {
//   // const subscribers = tickersHandlers.get(ticker) || []
//   // tickersHandlers.set(
//   //   ticker,
//   //   subscribers.filter(fn => fn !== cb)
//   // )
//   tickersHandlers.delete(ticker)
//   unsubscribeToTickerOnWs(ticker)
// }

async function getCryptoNames() {
  const f = await fetch(
    'https://min-api.cryptocompare.com/data/all/coinlist?summary=true'
  )
  const data = await f.json()
  return Object.keys(data.Data)
}
export const cryptoNames = getCryptoNames()
