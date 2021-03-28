import { Socket } from 'phoenix'

import { gameActions } from './events'
import { TURNS, getGameId, setGameId, getPlayerId, setPlayerId } from './constants'
import { hasnamuss } from './reducers/laws'

const localPlayers = (players, turns) => turns.map(plyrId => {
  const { name, position, laws: { active }, ep: { level_of_being = "MULTIPLICITY" } } = players[plyrId]
  return { pid: plyrId, hasnamuss: hasnamuss(active), name, position, level_of_being }
}).reverse()

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
  const shared_laws = payloadPid===pid && player.shared_laws
  ? player.shared_laws.map(
    c => ({
      c,
      shared: true,
      selected: false,
    })
  ) : []
  const {
    hand,
    laws: { active, hand: lawHand },
    fd,
    ep
  } = player

  return {
    player,
    board: {
      ...board,
      players: localPlayers(players, turns),
    },
    cards: { ...cards, hand },
    laws: { ...laws, active, hand: lawHand, shared_laws },
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
    this.actions = gameActions(this.channel)
    this.channel.join()
      .receive("ok", payload => {
        console.log('Connected to channel', payload)
        setGameId(payload.gid)
      })
      .receive("error", resp => console.log("Unable to join", resp));
    return this.subscribe()
  }

  this.subscribe = () => {
    this.channel.on("game:started", payload => {
      const { name, pid, sides } = payload
      setPlayerId(pid)
      this.actions.onGameStarted(pid, name, sides)
    })
    this.channel.on("game:started_after_wait", (payload) => {
      const pid = getPlayerId()
      const active = pid===payload.first
      this.actions.onGameStartedAfterWait(pid, active)
    })
    this.channel.on("game:waited", payload => {
      const { name, pid, sides } = payload
      setPlayerId(pid)
      this.actions.onGameWaited(pid, name, sides)
    })
    this.channel.on("game:update", payload => {
      console.log('game:update', payload)
      const state = localState(payload)
      this.actions.onUpdateGame(state)
    })
    this.channel.on("game:next_turn", payload => {
      console.log('game:next_turn', payload)
      const state = localState(payload)
      this.actions.onUpdateGame(state)
      // when the game ends, stay active so they can quit when they want
      const active = payload.pid === getPlayerId() ||
        state.player.current_turn === TURNS.end
      const initial = state.player.current_turn === TURNS.initial
      this.actions.onTurnStarted({ pid: payload.pid, active, initial })
    })
    this.channel.on("game:joined", payload => {
      const { gid, pid } = payload
      this.join(gid)
      if (getPlayerId() !== pid) { setPlayerId(pid) }
      const state = localState(payload)
      this.actions.onGameJoined(pid, state)
    })
    this.channel.on("player:joined", payload => {
      const state = localState(payload)
      this.actions.onPlayerJoined(state)
    })
    this.channel.on("game:continued", payload => {
      const { gid, pid } = payload
      this.join(gid)
      const state = localState(payload)
      this.actions.onGameContinued(state)
    })
    this.channel.on("game:fifth_options", payload => {
      if (getPlayerId() === payload.pid) {
        this.actions.onFifthOptions(payload)
      }
    })
    this.channel.on("game:offer_astral", payload => {
      if (getPlayerId() === payload.pid) {
        this.actions.onOfferAstral(payload)
      }
    })
    this.channel.on("game:hasnamuss_take_card", payload => {
      const state = localState(payload)
      if (getPlayerId() === payload.pid) {
        this.actions.onOfferTakeCard(state)
      }
    })
    this.channel.on("modal:error", payload => {
      const { error } = payload
      this.actions.onUpdateModal({ field: "error_message", value: error.message })
      this.actions.onShowModal()
    })
    this.channel.on("game:event", payload => {
      this.actions.onEventLog(payload)
    })
    this.channel.on("broadcast:message", payload => {
      if (getPlayerId() === payload.pid) { return }
      const { message, type } = payload
      this.actions.onToast(message, type)
    })
  }

  this.push = (message, options) => this.channel.push(message, options)

  return this
}
