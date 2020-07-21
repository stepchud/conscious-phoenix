// Modal actions
const showModal = (props) => ({ type: 'SHOW_MODAL', ...props })
const updateModal = ({ field, value }) => ({ type: 'UPDATE_MODAL', field, value })
const hideModal = () => ({ type: 'HIDE_MODAL' })

// Game actions
const startGame = (name, sides) => ({ type: 'START_GAME', name, sides })
const joinGame = (state) => ({ type: 'JOIN_GAME', state })
const updateGame = (updates) => ({ type: 'UPDATE_GAME', ...updates })
const startTurn = (pid) => ({ type: 'START_TURN', pid })
const exchangeDupes = (pid) => ({ type: 'EXCHANGE_DUPES' })

// Log Actions, shared game log across players
const logEvent = (event) => ({ type: 'LOG_EVENT', event })

export default {
  showModal,
  updateModal,
  hideModal,
  startGame,
  joinGame,
  updateGame,
  startTurn,
  exchangeDupes,
}
