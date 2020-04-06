import { Socket } from 'phoenix'

import { gameActions } from './events'

export default function Connect() {
  const scheme = location.protocol.startsWith('https') ? 'wss' : 'ws'
  const url = location.port === "" ? location.hostname : `${location.hostname}:${location.port}`

  this.socket = new Socket(`${scheme}://${url}/socket`, {})
  this.socket.connect()

  this.leave = () => {
    if (!this.channel) { return }
    this.channel.leave().receive('ok', () => console.log("Bye channel"))
    this.gid = undefined
  }

  this.disconnect = () => {
    this.leave()
    if (!this.socket) { return }
    this.socket.disconnect(() => console.log('Bye socket'))
  }

  this.join = (gid) => {
    this.leave()
    this.gid = gid
    this.channel = this.socket.channel(`game:${gid}`, {})
    this.channel.join()
      .receive("ok", payload => console.log('Connected to channel', payload))
      .receive("error", resp => console.log("Unable to join", resp));
    this.subscribe()
  }

  this.subscribe = () => {
    this.channel.on("game:started", payload => {
      const { name, uid, sides } = payload
      gameActions.onGameStarted(name, uid, sides)
    })
    this.channel.on("game:update", payload => {
      console.log('game:update', payload)
      gameActions.onUpdateGame(payload)
    })
    this.channel.on("game:joined", payload => {
      if (payload.error) {
        gameActions.onUpdateModal({ field: "error_message", value: payload.error.message })
      } else {
        this.join(payload.gid)
        gameActions.onUpdateGame(payload)
      }
    })
  }

  this.push = (message, options) => this.channel.push(message, options)

  return this
}
