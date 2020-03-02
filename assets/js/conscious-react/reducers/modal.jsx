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
      console.log("UPDATE_MODAL ", action)
      return {
        ...state,
        [action.field]: action.value
      }
    default:
      return state
  }
}

export default modal
