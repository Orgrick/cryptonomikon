import { subscribeToTicker, unsubscribeToTicker } from './api.js'
const listeners = []
self.onconnect = e => {
  const port = e.ports[0]
  if (!listeners.includes(port)) listeners.push(port)
  port.onmessage = mes => {
    if (mes.data === 'tryToConnect') {
      port.postMessage(
        toJSON({
          successfulСonnection: true
        })
      )
      return
    }
    const message = JSON.parse(e.data)
    if (message.subscribe) {
      const { tickerName } = message
      subscribeToTicker(tickerName, newPrice => {
        const dataToSend = toJSON({
          tickerName,
          newPrice
        })
        sendAll(dataToSend)
      })
    }
    if (message.unsubscribe) {
      const { tickerName } = message
      unsubscribeToTicker(tickerName)
    }
  }
}
function sendAll(mes) {
  listeners.forEach(port => {
    port.postMessage(mes)
  })
}
function toJSON(obj) {
  return JSON.stringify(obj)
}
