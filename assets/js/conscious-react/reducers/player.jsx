import { getPlayerId, lawsPassed, TURNS, LAST_SPACE } from '../constants'

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
  death_space: LAST_SPACE,
}

const stateAfterDeath = (state, reincarnate) =>
  reincarnate
  ?
    {
      ...state,
      alive: true,
      current_turn: TURNS.randomLaw,
      laws_passed: 2,
      death_space: state.direction > 0 ? LAST_SPACE : 0
    }
  :
    {
      ...state,
      alive: false,
      current_turn: TURNS.normal,
      laws_passed: 0,
      death_space: state.direction > 0 ? LAST_SPACE : 0
    }

const player = (
  state = InitialState,
  action
) => {
  switch(action.type) {
    case 'MOVE_SPACE': {
      const { alive, death_space, direction } = state
      const { position, next_position, asleep } = action
      const just_completed = direction > 0
        ? next_position == LAST_SPACE
        : next_position == 0
      const completed_trips = state.completed_trips + (just_completed ? 1 : 0)
      const laws_passed = asleep || !alive ? 0 : lawsPassed(position, next_position)
      let current_turn
      if (direction > 0 && next_position >= death_space) {
        current_turn = TURNS.death
      } else if (direction < 0 && next_position <= death_space) {
        current_turn = TURNS.death
      } else if (laws_passed > 0) {
        current_turn = TURNS.randomLaw
      } else {
        current_turn = state.current_turn
      }
      return {
        ...state,
        laws_passed,
        completed_trips,
        current_turn,
        position: next_position,
        direction: just_completed ? -direction : direction,
      }
    }
    case 'ONE_BY_RANDOM': {
      const { laws_passed, next_turn_override } = state
      const nextState = { ...state }
      delete nextState.next_turn_override
      let current_turn
      if (next_turn_override) {
        current_turn = next_turn_override
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
        next_turn_override: state.current_turn,
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
        name: action.state.player.name,
        current_turn: TURNS.randomLaw,
      }
    case 'WAIT_FOR_TURN':
      return {
        ...state,
        active: false,
      }
    case 'START_TURN': {
      // when the game ends, stay active so they can quit when they want
      const active = action.pid === getPlayerId() || state.current_turn === TURNS.end
      return {
        ...state,
        active,
      }
    }
    case 'END_TURN':
      return {
        ...state,
        age: state.age + 1
      }
    case 'END_DEATH':
      return stateAfterDeath(state, false)
    case 'DEATH_NOW':
      return {
        ...state,
        death_space: state.position,
        current_turn: TURNS.death,
      }
    case 'DEATH_SPACE':
      return {
        ...state,
        death_space: Math.min(state.death_space, state.position + action.in),
      }
    case 'GAME_OVER':
      return {
        ...state,
        current_turn: TURNS.end,
      }
    case 'REINCARNATE':
      return stateAfterDeath(state, true)
    default:
      return state
  }
}

export default player
