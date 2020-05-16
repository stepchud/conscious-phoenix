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

const reducers = combineReducers({ player, board, cards, laws, fd, ep, modal, log })
const store = createStore(reducers)
export default store
