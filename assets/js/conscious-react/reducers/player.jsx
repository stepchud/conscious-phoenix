const InitialState = {
    name: "Player 1",
    age: 0,
    active: false,
}

const player = (
  state = InitialState,
  action
) => {
  const { age, pid } = state

  switch(action.type) {
    case 'START_GAME':
      return {
        ...state,
        name: action.name,
        pid: action.pid,
      }
    case 'WAIT_FOR_TURN':
      return {
        active: false,
        ...state,
      }
    case 'START_TURN':
      const active = action.pid === pid
      return {
        active,
        ...state,
      }
    case 'END_TURN':
      return {
        ...state,
        age: age + 1
      }
    default:
      return state
  }
}

export default player
