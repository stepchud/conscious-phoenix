import { Socket } from 'phoenix'

import { gameActions } from './events'
import { getGameId, setGameId, getPlayerId, setPlayerId } from './constants'

// maps the server game state to local state
const localState = (payload) => {
  const {
    game: {
      players,
      board,
      cards,
      laws,
      log,
      turns,
    }
  } = payload
  const pid = getPlayerId()

  const player = players[pid]
  const {
    hand,
    laws: { active, hand: lawHand },
    fd,
    ep
  } = player

  const localPlayers = turns.map(plyrId => {
    const { name, position } = players[plyrId]
    return { pid: plyrId, name, position }
  }).reverse()

  return {
    player,
    board: {
      ...board,
      players: localPlayers,
    },
    cards: { ...cards, hand },
    laws: { ...laws, active, hand: lawHand },
    fd,
    ep,
    log,
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
      const state = localState(payload)
      gameActions.onUpdateGame(state)
    })
    this.channel.on("game:next_turn", payload => {
      console.log(`game:next_turn ${payload.pid}`)
      const state = localState(payload)
      gameActions.onUpdateGame(state)
      gameActions.onTurnStarted(payload)
    })
    this.channel.on("game:joined", payload => {
      const { gid, pid } = payload
      this.join(gid)
      if (getPlayerId() !== pid) { setPlayerId(pid) }
      const state = localState(payload)
      gameActions.onGameJoined(pid, state, this.channel)
      gameActions.onHideModal()
    })
    this.channel.on("game:continued", payload => {
      const { gid, pid } = payload
      if (getGameId() !== gid) { this.join(gid) }
      if (getPlayerId() === pid) {
        const state = localState(payload)
        gameActions.onGameContinued(state)
        gameActions.onHideModal()
      } else {
        console.warn("mismatched pid for continue")
      }
    })
    this.channel.on("modal:error", payload => {
      const { error } = payload
      gameActions.onUpdateModal({ field: "error_message", value: error.message })
      gameActions.onShowModal()
    })
    this.channel.on("game:event", payload => {
      gameActions.onEventLog(payload)
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
