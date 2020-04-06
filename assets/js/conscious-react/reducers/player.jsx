const InitialState = {
    name: "Player 1",
    age: 0,
}

const player = (
  state = InitialState,
  action
) => {
  const { age } = state

  switch(action.type) {
    case 'START_GAME':
      return {
        ...state,
        name: action.name,
        uid: action.uid,
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
