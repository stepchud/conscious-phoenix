import { getPlayerId, lawsPassed, TURNS, LAST_SPACE } from '../constants'

const InitialState = {
  name: "",
  age: 0,
  position: 0,
  direction: 1,
  active: false,
  can_dupe: true,
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
      current_turn: TURNS.randomLaw,
      laws_passed: 2,
      death_space: state.direction > 0 ? LAST_SPACE : 0
    }
  :
    {
      ...state,
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
      const { death_space, direction } = state
      const { position, next_position, alive, asleep, same_level_hasnamuss } = action
      const just_completed = (direction > 0) ? (next_position == LAST_SPACE) : (next_position == 0)
      const reached_death_space = (direction > 0 && next_position >= death_space) ||
        (direction < 0 && next_position <= death_space)

      const completed_trips = state.completed_trips + (just_completed ? 1 : 0)
      const laws_passed = lawsPassed(position, next_position, asleep, alive)
      let current_turn
      if (reached_death_space || same_level_hasnamuss) {
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
    case 'WAIT_GAME':
      return {
        ...state,
        name: action.name,
        current_turn: TURNS.initial,
      }
    case 'JOIN_GAME':
      return {
        ...state,
        name: action.state.player.name,
        current_turn: TURNS.initial,
      }
    case 'WAIT_FOR_TURN':
      return {
        ...state,
        active: false,
      }
    case 'START_TURN': {
      const { active, initial } = action
      const current_turn = initial ? TURNS.randomLaw : state.current_turn
      return {
        ...state,
        active,
        current_turn,
      }
    }
    case 'END_TURN':
      return {
        ...state,
        age: state.age + 1,
        can_dupe: true,
      }
    case 'EXCHANGE_DUPES':
      return {
        ...state,
        can_dupe: false
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
