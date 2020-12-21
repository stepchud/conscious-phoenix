const log = (
  state = [],
  action
) => {
  switch (action.type) {
    case 'LOG_EVENT':
      return [ action.event, ...state ]
    case 'JOIN_GAME':
      return [ ...action.state.log ]
    case 'UPDATE_GAME':
      return [ ...action.log ]
    default: return state
  }
}

export default log
