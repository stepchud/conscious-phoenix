// Modal Actions
const showModal = (modalProps) => ({
  type: 'SHOW_MODAL',
  modalProps: {
    ...modalProps
  }
})
const updateModal = ({ field, value }) => ({ type: 'UPDATE_MODAL', field, value })
const hideModal = () => ({ type: 'HIDE_MODAL' })

// Game Actions
const newGame = () => ({ type: 'NEW_GAME' })
const startGame = (name, sides) => ({ type: 'START_GAME', name, sides })
const updateGame = (updates) => ({ type: 'UPDATE_GAME', ...updates })
const continueGame = () => ({ type: 'CONTINUE_GAME' })

export default {
  showModal,
  updateModal,
  hideModal,
  newGame,
  startGame,
  updateGame,
  continueGame,
}
