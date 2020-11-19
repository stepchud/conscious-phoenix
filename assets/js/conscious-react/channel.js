import { Socket } from 'phoenix'

import { gameActions } from './events'
import { getGameId, setGameId, getPlayerId, setPlayerId } from './constants'

// maps the server game state to local state
const localState = (payload) => {
  const {
    pid: payloadPid,
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
    const actions = gameActions(this.channel)
    this.channel.on("game:started", payload => {
      const { name, pid, sides } = payload
      setPlayerId(pid)
      actions.onGameStarted(pid, name, sides)
    })
    this.channel.on("game:update", payload => {
      console.log('game:update', payload)
      const state = localState(payload)
      actions.onUpdateGame(state)
    })
    this.channel.on("game:next_turn", payload => {
      console.log(`game:next_turn ${payload.pid}`)
      const state = localState(payload)
      actions.onUpdateGame(state)
      actions.onTurnStarted(payload)
    })
    this.channel.on("game:joined", payload => {
      const { gid, pid } = payload
      this.join(gid)
      if (getPlayerId() !== pid) { setPlayerId(pid) }
      const state = localState(payload)
      actions.onGameJoined(pid, state)
      actions.onHideModal()
    })
    this.channel.on("game:continued", payload => {
      const { gid, pid } = payload
      if (getGameId() !== gid) { this.join(gid) }
      if (getPlayerId() === pid) {
        const state = localState(payload)
        actions.onGameContinued(state)
        actions.onHideModal()
      } else {
        console.warn("mismatched pid for continue")
      }
    })
    this.channel.on("game:fifth_options", payload => {
      if (getPlayerId() === payload.pid) {
        actions.onFifthOptions(payload)
      }
    })
    this.channel.on("modal:error", payload => {
      const { error } = payload
      actions.onUpdateModal({ field: "error_message", value: error.message })
      actions.onShowModal()
    })
    this.channel.on("game:event", payload => {
      actions.onEventLog(payload)
    })
    this.channel.on("broadcast:message", payload => {
      if (getPlayerId() === payload.pid) { return }
      const { message, type } = payload
      actions.onToast(message, type)
    })
  }

  this.push = (message, options) => this.channel.push(message, options)

  return this
}
