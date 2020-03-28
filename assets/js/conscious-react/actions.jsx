// Modal Actions
const showModal = (props) => ({
  type: 'SHOW_MODAL',
  ...props
})
export const updateModal = ({ field, value }) => ({ type: 'UPDATE_MODAL', field, value })
export const hideModal = () => ({ type: 'HIDE_MODAL' })
export const dispatchShowModal = (store) => (props) => store.dispatch(showModal(props))

// Game Actions
export const startGame = (name, sides) => ({ type: 'START_GAME', name, sides })
export const updateGame = (updates) => ({ type: 'UPDATE_GAME', ...updates })
