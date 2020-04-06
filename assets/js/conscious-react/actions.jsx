// Modal Actions
export const showModal = (props) => ({
  type: 'SHOW_MODAL',
  ...props
})
export const updateModal = ({ field, value }) => ({ type: 'UPDATE_MODAL', field, value })
export const hideModal = () => ({ type: 'HIDE_MODAL' })

// Game Actions
export const startGame = (name, uid, sides) => ({ type: 'START_GAME', name, uid, sides })
export const updateGame = (updates) => ({ type: 'UPDATE_GAME', ...updates })
