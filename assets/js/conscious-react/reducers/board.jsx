import { map, filter, isEmpty, every, some, isNaN } from 'lodash'
import { INITIAL_SPACES, LAST_SPACE, TURNS, Dice } from '../constants'

const convertToDeath = (spaces) => spaces.replace(/L/g, '*').replace(/C/g, 'D')

const InitialState = () => ({
  sides: 6,
  roll: 0,
  position: 0,
  laws_passed: 2,
  laws_cancel: [],
  spaces: INITIAL_SPACES,
  death_space: LAST_SPACE,
  current_turn: TURNS.setup,
  completed_trip: false,
})

const AfterDeath = ({ state, reincarnate }) => {
  const initial = InitialState()
  let { position, spaces } = state
  const just_completed = position == LAST_SPACE
  if (just_completed) {
    spaces = [...spaces].reverse().join('')
    position = 0
  }
  if (!reincarnate) {
    spaces = convertToDeath(spaces)
  }
  return {
    ...initial,
    position,
    spaces,
    current_turn: reincarnate ? TURNS.randomLaw : TURNS.normal,
    completed_trip: state.completed_trip || just_completed,
    laws_passed: reincarnate ? 2 : 0,
  }
}

const board = (
  state = InitialState(),
  action
) => {
  const {
    roll,
    sides,
    position,
    death_space,
    laws_passed
  } = state
  switch(action.type) {
    case 'START_GAME':
      return {
        ...state,
        current_turn: TURNS.randomLaw,
        sides: parseInt(action.sides),
      }
    case 'UPDATE_GAME':
      return {
        ...action.game.board
      }
    case 'ROLL_DICE': {
      return {
        ...state,
        roll: Dice(sides).roll(),
      }
    }
    case 'END_TURN':
      return {
        ...state,
        laws_passed: 0,
      }
    case 'TAKE_OPPOSITE': {
      return {
        ...state,
        roll: Dice(sides).opposite(roll)
      }
    }
    case 'DEATH_SPACE':
      return {
        ...state,
        death_space: Math.min(death_space, position + action.in)
      }
    case 'DEATH_NOW':
      return {
        ...state,
        death_space: position,
        current_turn: TURNS.death,
      }
    case 'MOVE_ROLL': {
      const { current_turn } = state
      const { roll_multiplier } = action
      const new_position = position + (roll*roll_multiplier)  >= LAST_SPACE
        ? LAST_SPACE
        : position + (roll*roll_multiplier)
      const nextState = {
        ...state,
        position: new_position,
        current_turn: new_position >= death_space ? TURNS.death : current_turn,
        laws_cancel: [],
      }
      if (new_position > state.JD) {
        delete nextState.JD
        nextState.laws_cancel.push('JD')
      }
      if (new_position > state.JC) {
        delete nextState.JC
        nextState.laws_cancel.push('JC')
      }
      if (new_position > state.JH) {
        delete nextState.JH
        nextState.laws_cancel.push('JH')
      }

      return nextState
    }
    case 'PASS_LAW':
      return {
        ...state,
        laws_passed: laws_passed+1,
        current_turn: TURNS.randomLaw,
      }
    case 'MECHANICAL':
      const card = action.card
      return {
        ...state,
        [card]: position + action.for,
      }
    case 'ONE_BY_RANDOM': {
      const nextState = {
        ...state,
        current_turn: laws_passed == 2 ? TURNS.choiceLaw : TURNS.normal,
      }
      if (nextState.next_turn) {
        nextState.current_turn = nextState.next_turn
        delete nextState.next_turn
      }
      return nextState
    }
    case 'ONE_BY_CHOICE':
      return {
        ...state,
        current_turn: TURNS.normal,
      }
    case 'LAW_BY_CHOICE':
      return {
        ...state,
        current_turn: TURNS.choiceLaw,
      }
    case 'LAW_BY_RANDOM':
      return {
        ...state,
        current_turn: TURNS.randomLaw,
        next_turn: TURNS.normal,
      }
    case 'DEATH':
      return {
        ...state,
        current_turn: TURNS.death,
      }
    case 'END_DEATH':
      return AfterDeath({ state, reincarnate: false })
    case 'REINCARNATE':
      return AfterDeath({ state, reincarnate: true })
    default:
      return state
  }
}

export default board
