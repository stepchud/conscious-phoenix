const InitialState = {
  showModal: false,
  modalProps: {}
}

const modal = (
  state = InitialState,
  action
) => {
  switch (action.type) {
    case 'SHOW_MODAL':
      return {
        showModal: true,
        modalProps: action.modalProps
      }
    case 'HIDE_MODAL':
      return {
        ...state,
        showModal: false
      }
    case 'UPDATE_MODAL':
      return {
        ...state,
        [action.field]: action.value
      }
    case 'UPDATE_GAME':
      return {
        ...action.game.modal
      }
    default:
      return state
  }
}

export default modal
