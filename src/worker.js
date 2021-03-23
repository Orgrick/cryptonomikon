const ports = new Set()
const tickersHandlers = new Map()
self.onconnect = e => {
  const port = e.ports[0]
  ports.add(port)
  port.onmessage = ev => {
    const { action, ticker } = JSON.parse(ev.data)

    switch (action) {
      case 'init':
        port.postMessage(
          JSON.stringify({
            message: 'successful connection to SW'
          })
        )
        break
      case 'subscribe':
        if (
          !tickersHandlers.get(ticker) ||
          tickersHandlers.get(ticker).size === 0
        ) {
          port.postMessage(
            JSON.stringify({
              message: 'subscribeToTickerOnWs'
            })
          )
          subscribeToTickerOnWs(ticker)
        }
        tickersHandlers.set(
          ticker,
          new Set([...(tickersHandlers.get(ticker) || []), port])
        )
        port.postMessage(
          JSON.stringify({
            message: 'sub msg ',
            ticker,
            listeners: tickersHandlers.get(ticker).size
          })
        )
        break
      case 'unsubscribe':
        tickersHandlers.get(ticker).delete(port)
        if (tickersHandlers.get(ticker).size === 0) {
          unsubscribeToTickerOnWs(ticker)
          port.postMessage(
            JSON.stringify({
              message: '0 subs on ticker: ',
              ticker
            })
          )
        }
        port.postMessage(
          JSON.stringify({
            message: 'unsub msg ',
            ticker,
            listeners: tickersHandlers.get(ticker).size
          })
        )
        break
      default:
        port.postMessage(JSON.stringify({ message: 'uncaught action' }))
    }
  }
}
const API_KEY =
  '66abcb66e492b555882a5b81ddcb79614d46bb69e05c75d8a52193076a00ada1'
const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
)
function sendToWebSocket(message) {
  const stringifiedMessage = JSON.stringify(message)
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringifiedMessage)
    return
  }
  socket.addEventListener(
    'open',
    () => {
      ports.forEach(port => {
        port.postMessage(JSON.stringify({ message: 'WS open' }))
      })
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

const AGGREGATE_INDEX = '5'
const ERROR_INDEX = '500'
socket.addEventListener('message', e => {
  ports.forEach(port => {
    port.postMessage(JSON.stringify(e.data))
  })

  const {
    TYPE: type,
    PRICE: newPrice,
    FROMSYMBOL: currency,
    PARAMETER: parametr
  } = JSON.parse(e.data)
  if (type == AGGREGATE_INDEX && currency && newPrice) {
    tickersHandlers.get(currency).forEach(port => {
      port.postMessage(JSON.stringify({ ticker: currency, newPrice }))
    })
  }
  if (type == ERROR_INDEX) {
    const currency = getTickerName(parametr)
    tickersHandlers.get(currency).forEach(port => {
      port.postMessage(JSON.stringify({ ticker: currency, newPrice: '--' }))
    })
  }
})

function getTickerName(subs) {
  return subs.split('~')[2]
}
