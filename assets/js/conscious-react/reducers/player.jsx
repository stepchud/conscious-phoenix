import {
  sortBy,
} from 'lodash'

import {
  suit,
  rank,
} from './cards'

const InitialState = {
    name: "Player 1",
    age: 0,
}

const suitInt = card => {
  switch(suit(card)) {
    case 'D': return 0
    case 'C': return 100
    case 'H': return 200
    case 'S': return 300
    default:  return 400
  }
}
const rankInt = card => {
  const r = rank(card)
  if ('JO' === r) {
    return 16
  } else if ('XJ' === r) {
    return 15
  } else if ('A' === r) {
    return 14
  } else if ('K' === r) {
    return 13
  } else if ('Q' === r) {
    return 12
  } else if ('J' === r) {
    return 11
  } else {
    return parseInt(r)
  }
}

const player = (
  state = InitialState,
  action
) => {

  const { age } = state

  switch(action.type) {
    case 'START_GAME':
      return {
        ...state,
        name: action.name,
      }
    case 'END_TURN':
      return {
        ...state,
        age: age + 1
      }
    default:
      return state
  }
}

export default player
