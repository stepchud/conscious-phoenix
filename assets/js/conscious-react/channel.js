import { Socket } from 'phoenix'

import { gameActions } from './events'
import { getGameId, setGameId, getPlayerId, setPlayerId } from './constants'

// maps the server game state to local state
const localState = (payload) => {
  const {
    gid,
    pid,
    game: {
      players,
      board,
      cards,
      laws,
    }
  } = payload
  const player = players[pid]
  const {
    position,
    current_turn,
    completed_trip,
    death_space,
    laws_passed,
    hand,
    laws: { active, hand: lawHand },
    fd,
    ep
  } = player

  return {
    player: {
      name: player.name,
      age: player.age,
    },
    board: {
      ...board,
      position,
      current_turn,
      completed_trip,
      laws_passed,
    },
    cards: { ...cards, hand },
    laws: { ...laws, active, hand: lawHand },
    fd,
    ep,
  }
}

export default function Connect() {
  const scheme = location.protocol.startsWith('https') ? 'wss' : 'ws'
  //const url = location.port === "" ? location.hostname : `${location.hostname}:${location.port}`
  this.socket = new Socket(`${scheme}://${location.host}/socket`, {})
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
      .receive("ok", payload => {
        console.log('Connected to channel', payload)
        setGameId(payload.gid)
      })
      .receive("error", resp => console.log("Unable to join", resp));
    this.subscribe()
  }

  this.subscribe = () => {
    this.channel.on("game:started", payload => {
      const { name, pid, sides } = payload
      setPlayerId(pid)
      gameActions.onGameStarted(pid, name, sides, this.channel)
    })
    this.channel.on("game:update", payload => {
      console.log('game:update', payload)
      const { pid } = payload
      if (getPlayerId() === pid) {
        const state = localState(payload)
        gameActions.onUpdateGame(state)
      } else {
        console.log(`updated other pid (${getPlayerId()},${pid})`)
      }
    })
    this.channel.on("game:next_turn", payload => {
      const { pid } = payload
      console.log(`next player ${pid}`)
      gameActions.onTurnStarted(pid)
    })
    this.channel.on("game:joined", payload => {
      const { gid, pid } = payload
      this.join(gid)
      if (getPlayerId() !== pid) { setPlayerId(pid) }
      const state = localState(payload)
      gameActions.onGameJoined(state)
      gameActions.onHideModal()
    })
    this.channel.on("game:continued", payload => {
      const { gid, pid } = payload
      if (getGameId() !== gid) { this.join(gid) }
      if (getPlayerId() === pid) {
        const state = localState(payload)
        gameActions.onGameContinued(state)
        gameActions.onHideModal()
        console.log(`game continued (${pid})`)
      } else {
        console.warn("mismatched pid for continue")
      }
    })
    this.channel.on("game:saved", payload => {
      console.log(`game saved for ${payload.pid}`)
    })
    this.channel.on("modal:error", payload => {
      const { error } = payload
      gameActions.onUpdateModal({ field: "error_message", value: error.message })
      gameActions.onShowModal()
    })
    this.channel.on("broadcast:message", payload => {
      if (getPlayerId() === payload.pid) { return }
      const { message, type } = payload
      gameActions.onToast(message, type)
    })
  }

  this.push = (message, options) => this.channel.push(message, options)

  return this
}
