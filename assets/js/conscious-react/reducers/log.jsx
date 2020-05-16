const log = (
  state = [],
  action
) => {
  if (action.type==='LOG_EVENT') {
    return [ ...state, action.event ]
  }
  return state
}

export default log
