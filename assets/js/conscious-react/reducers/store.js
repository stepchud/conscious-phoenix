import { combineReducers, createStore} from 'redux'

// reducers
import player from './player'
import board from './board'
import cards from './cards'
import laws from './laws'
import fd from './food_diagram'
import ep from './being'
import modal from './modal'
import log from './log'

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
