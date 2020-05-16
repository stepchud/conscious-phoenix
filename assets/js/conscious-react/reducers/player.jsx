import { getPlayerId, lawsPassed, TURNS } from '../constants'

const InitialState = {
  name: "",
  age: 0,
  position: 0,
  direction: 1,
  active: false,
  alive: true,
  current_turn: TURNS.setup,
  laws_passed: 2,
  completed_trips: 0,
}

const stateAfterDeath = (state, reincarnate) => {
  const { position, direction, completed_trips } = state
  const just_completed = position == LAST_SPACE
  return {
    ...state,
    alive: !reincarnate,
    current_turn: reincarnate ? TURNS.randomLaw : TURNS.normal,
    laws_passed: reincarnate ? 2 : 0,
    completed_trips: completed_trips + (just_completed ? 1 : 0),
    direction: just_completed ? -direction : direction,
  }
}

const player = (
  state = InitialState,
  action
) => {
  switch(action.type) {
    case 'MOVE_SPACE': {
      const { alive } = state
      const { position, next_position, asleep } = action
      const laws_passed = asleep || !alive ? 0 : lawsPassed(position, next_position)
      return {
        ...state,
        position: next_position,
        laws_passed: laws_passed,
      }
    }
    case 'ONE_BY_RANDOM': {
      const { laws_passed, next_turn } = state
      const nextState = { ...state }
      delete nextState.next_turn
      let current_turn
      if (next_turn) {
        current_turn = next_turn
      } else if (laws_passed == 2) {
        current_turn = TURNS.choiceLaw
      } else {
        current_turn = TURNS.normal
      }
      return {
        ...nextState,
        current_turn
      }
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
    case 'START_GAME':
      return {
        ...state,
        name: action.name,
        active: true,
        current_turn: TURNS.randomLaw,
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
        age: state.age + 1
      }
    case 'END_DEATH':
      return stateAfterDeath(state, false)
    case 'REINCARNATE':
      return stateAfterDeath(state, true)
    default:
      return state
  }
}

export default player
