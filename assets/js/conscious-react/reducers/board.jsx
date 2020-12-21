import { map, filter, isEmpty, every, some, isNaN } from 'lodash'
import { BOARD_SPACES, LAST_SPACE, Dice } from '../constants'

const InitialState = () => ({
  sides: 6,
  roll: 0,
  spaces: BOARD_SPACES,
  players: [],
  status: 'active',
})

const board = (
  state = InitialState(),
  action
) => {
  const {
    roll,
    sides,
  } = state
  switch(action.type) {
    case 'START_GAME':
      return {
        ...state,
        sides: parseInt(action.sides),
      }
    case 'WAIT_GAME':
      return {
        ...state,
        sides: parseInt(action.sides),
        status: 'wait',
      }
    case 'START_AFTER_WAIT':
      return {
        ...state,
        status: 'active',
      }
    case 'JOIN_GAME': {
      const { sides, status, players } = action.state.board
      return {
        ...state,
        sides,
        status,
        players,
      }
    }
    case 'UPDATE_GAME':
      return {
        ...state,
        ...action.board,
      }
    case 'ROLL_DICE': {
      return {
        ...state,
        roll: Dice(sides).roll(),
      }
    }
    case 'TAKE_OPPOSITE':
      return {
        ...state,
        roll: Dice(sides).opposite(roll)
      }
    default:
      return state
  }
}

export default board
