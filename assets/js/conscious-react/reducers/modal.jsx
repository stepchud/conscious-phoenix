const InitialState = {
  show: false,
}

const modal = (
  state = InitialState,
  action
) => {
  switch (action.type) {
    case 'SHOW_MODAL':
      return {
        show: true,
        ...action
      }
    case 'HIDE_MODAL':
      return {
        show: false
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
