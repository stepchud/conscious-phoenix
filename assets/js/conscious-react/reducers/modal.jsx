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
    default:
      return state
  }
}

export default modal
