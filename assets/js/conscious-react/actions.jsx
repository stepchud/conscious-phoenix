// Modal Actions
const hideModal = () => ({ type: 'HIDE_MODAL' })

const showModal = (modalProps) => ({
  type: 'SHOW_MODAL',
  modalProps: {
    ...modalProps
  }
})

const updateName = (name) => ({ type: 'UPDATE_NAME', name })
const updateDice = (sides) => ({ type: 'SET_DICE', sides })
const startGame = () => ({ type: 'START_GAME' })
const continueGame = () => ({ type: 'CONTINUE_GAME' })

export default {
  hideModal,
  showModal,
  updateName,
  updateDice,
  startGame,
  continueGame,
}
