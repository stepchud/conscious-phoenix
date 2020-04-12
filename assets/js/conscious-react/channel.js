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
      const { name, pid, sides } = payload
      this.pid = pid
      gameActions.onGameStarted(name, pid, sides)
    })
    this.channel.on("game:update", payload => {
      console.log('game:update', payload)
      gameActions.onUpdateGame(payload)
    })
    this.channel.on("game:next_turn", payload => {
      const { pid } = payload
      console.log("next player turn = "+pid)
      gameActions.onTurnStarted({ pid })
    })
    this.channel.on("game:joined", payload => {
      const { gid, pid } = payload
      this.join(gid)
      this.pid = pid
      gameActions.onGameJoined(payload)
    })
    this.channel.on("modal:error", error => {
      gameActions.onUpdateModal({ field: "error_message", value: error.message })
    })
    this.channel.on("broadcast:message", payload => {
      if (this.pid === payload.pid) { return }
      const { message, type } = payload
      gameActions.onToast(message, type || "info")
    })
  }

  this.push = (message, options) => this.channel.push(message, options)

  return this
}
