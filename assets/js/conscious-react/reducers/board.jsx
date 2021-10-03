import { map, filter, isEmpty, every, some, isNaN } from 'lodash'
import { BOARD_SPACES, LAST_SPACE, Dice } from '../constants'

const InitialState = () => ({
  sides: 6,
  roll: 6,
  spaces: BOARD_SPACES,
  players: [],
  status: 'active',
})

const leaveFoodPiece = (spaces, { octave, position, direction }) => {
  const lower = octave.slice(0, 1)
  const upper = lower.toUpperCase()
  const nextNote = direction > 0
    ? spaces.indexOf(lower, position + 1)
    : spaces.lastIndexOf(lower, position - 1)
  const nextDouble = direction > 0
    ? spaces.indexOf(upper, position + 1)
    : spaces.lastIndexOf(upper, position - 1)

  if (nextNote > 0 &&
       ((nextDouble == -1) ||
        (direction > 0 && nextNote < nextDouble) ||
        (direction < 0 && nextNote > nextDouble))) {
    return (
      spaces.substring(0, nextNote) +
      spaces.charAt(nextNote).toUpperCase() +
      spaces.substring(nextNote + 1)
    )
  }

  return spaces
}

const removeFoodPiece = (spaces, position) =>
  spaces.substring(0, position) +
  spaces.charAt(position).toLowerCase() +
  spaces.substring(position + 1)

const board = (
  state = InitialState(),
  action
) => {
  const {
    roll,
    sides,
    spaces
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
      const next_roll = action.next_roll || Dice(sides).roll()
      return {
        ...state,
        roll: next_roll,
      }
    }
    case 'TAKE_OPPOSITE':
      return {
        ...state,
        roll: Dice(sides).opposite(roll)
      }
    case 'DECAY_NOTE': {
      if (action.mental) {
        return {
          ...state,
          spaces: leaveFoodPiece(spaces, action)
        }
      }
      return state
    }
    case 'REMOVE_DOUBLE_FOOD': {
      return {
        ...state,
        spaces: removeFoodPiece(spaces, action.position)
      }
    }
    default:
      return state
  }
}

export default board
