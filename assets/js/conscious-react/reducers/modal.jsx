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
      return InitialState
    default:
      return state
  }
}

export default modal
