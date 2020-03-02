// Modal Actions
const hideModal = () => ({ type: 'HIDE_MODAL' })

const showModal = (modalProps) => ({
  type: 'SHOW_MODAL',
  modalProps: {
    ...modalProps
  }
})

const updateModal = ({ field, value }) => ({ type: 'UPDATE_MODAL', field, value })

const newGame = () => ({ type: 'NEW_GAME' })
const startGame = (name, sides) => ({ type: 'START_GAME', name, sides })
const continueGame = () => ({ type: 'CONTINUE_GAME' })

export default {
  hideModal,
  showModal,
  updateModal,
  newGame,
  startGame,
  continueGame,
}
