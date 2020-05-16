import { map, filter, isEmpty, every, some, isNaN } from 'lodash'
import { BOARD_SPACES, LAST_SPACE, TURNS, Dice } from '../constants'

const InitialState = () => ({
  sides: 6,
  roll: 0,
  spaces: BOARD_SPACES,
  players: [],
})

export const getPlayerName = ({ players }, pid) => {
  const player = players.find(p => p.pid === pid)
  return player ? player.name : 'Unknown'
}

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
    case 'JOIN_GAME':
      return {
        ...state,
        sides: parseInt(action.state.board.sides),
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
    case 'BOARD_POSITIONS':
      return {
        ...state,
        players: action.players
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
