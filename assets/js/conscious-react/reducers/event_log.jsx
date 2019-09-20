const log = (
  state = [],
  action
) => {
  switch (action.type) {
    case 'LOG_APPEND':
      return state.concat(action.line)
    default:
      return state
  }
}

export default log
