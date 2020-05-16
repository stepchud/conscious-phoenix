// Modal Actions
const showModal = (props) => ({ type: 'SHOW_MODAL', ...props })
const updateModal = ({ field, value }) => ({ type: 'UPDATE_MODAL', field, value })
const hideModal = () => ({ type: 'HIDE_MODAL' })

// Game Actions
const startGame = (name, sides) => ({ type: 'START_GAME', name, sides })
const joinGame = (state) => ({ type: 'JOIN_GAME', state })
const updateGame = (updates) => ({ type: 'UPDATE_GAME', ...updates })
const startTurn = (pid) => ({ type: 'START_TURN', pid })
const updatePlayerPositions = (players) => ({ type: 'BOARD_POSITIONS', players })

// Log Actions
const logEvent = (event) => ({ type: 'LOG_EVENT', event })

export default {
  showModal,
  updateModal,
  hideModal,
  startGame,
  joinGame,
  updateGame,
  startTurn,
  updatePlayerPositions,
}
