import { getPlayerId } from '../constants'

const InitialState = {
    name: "Player 1",
    age: 0,
    active: false,
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
        active: true,
      }
    case 'JOIN_GAME':
      return {
        ...state,
        name: action.state.player.name
      }
    case 'WAIT_FOR_TURN':
      return {
        ...state,
        active: false,
      }
    case 'START_TURN':
      const active = action.pid === getPlayerId()
      return {
        ...state,
        active,
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
