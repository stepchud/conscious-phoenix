// Modal Actions
export const showModal = (props) => ({ type: 'SHOW_MODAL', ...props })
export const updateModal = ({ field, value }) => ({ type: 'UPDATE_MODAL', field, value })
export const hideModal = () => ({ type: 'HIDE_MODAL' })

// Game Actions
export const startGame = (name, sides) => ({ type: 'START_GAME', name, sides })
export const joinGame = (state) => ({ type: 'JOIN_GAME', state })
export const updateGame = (updates) => ({ type: 'UPDATE_GAME', ...updates })
export const startTurn = (pid) => ({ type: 'START_TURN', pid })
