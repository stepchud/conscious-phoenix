import { combineReducers, createStore} from 'redux'

// reducers
import player from './reducers/player'
import board from './reducers/board'
import cards from './reducers/cards'
import laws from './reducers/laws'
import fd from './reducers/food_diagram'
import ep from './reducers/being'
import modal from './reducers/modal'
import log from './reducers/log'

const appReducer = combineReducers({ player, board, cards, laws, fd, ep, modal, log })

// Resets the state back to initial default
const rootReducer = (state, action) => {
  if (action.type === 'RESET_GAME') {
    state = undefined
  }
  return appReducer(state, action)
}

const store = createStore(rootReducer)
export default store
