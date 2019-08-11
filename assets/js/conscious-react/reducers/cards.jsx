import {
  every,
  isEmpty,
  partition,
  shuffle,
  some,
  sortBy,
  times,
} from 'lodash'
import { Dice } from '../constants'

const generateDeck = () => {
  let deck = []
  for (let suit of ['D','C','H','S']) {
    for (let j=2; j<=4; j++) {
      times(4, ()=>{deck.push(j+suit)})
    }
    for (let j=5; j<=7; j++) {
      times(3, ()=>{deck.push(j+suit)})
    }
    for (let j=8; j<=10; j++) {
      times(2, ()=>{deck.push(j+suit)})
    }
  }
  times(4, deck.push('JS'))
  times(3, deck.push('JD'))
  times(2, deck.push('JC'))
  times(2, deck.push('QD'))
  deck.push('JH')
  deck.push('QC')
  return shuffle(deck)
}

const drawCard = (state) => {
  let deck = state.deck.slice(1)
  let discards = state.discards
  if (isEmpty(state.deck)) {
    deck = shuffle(state.discards).slice(1)
    discards = []
  }
  const hand = sortedHand(state.hand.concat({ c: deck[0], selected: false }))

  return {
    ...state,
    deck,
    discards,
    hand,
  }
}

const suit = card => card[card.length-1]
const suitInt = card => {
  switch(suit(card)) {
    case 'D': return 0
    case 'C': return 100
    case 'H': return 200
    case 'S': return 300
    default:  return 400
  }
}
const rank = card => (card=='XJ' || card=='JO') ? card : card.slice(0, -1)
const isFace = card => ['K','Q','J'].includes(rank(card))
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
export const sameSuit = (...cards) => {
  const firstSuit = suit(cards[0])
  return every(cards, c => suit(c) === firstSuit)
}
const sameRank = (...cards) => {
  const ranks = new Set(cards.map(rank))
  return ranks.size < cards.length
}
const grouped = (...cards) => {
  const ranks = cards.map(rank).map(c => Number(c))
  if (some(ranks, isNaN)) {
    return false
  }

  return every(ranks, c => c>=2 && c<=4) ||
         every(ranks, c => c>=5 && c<=7) ||
         every(ranks, c => c>=8 && c<=10)
}

export const selectedCards = (cards) => cards.filter(c => c.selected).map(c => c.c)
const sortedHand = (cards) => sortBy(cards, c => suitInt(c.c) + rankInt(c.c))
// cards can be played together to make new parts
export const playable = (selected) => {
  if (selected.length == 0 || selected.length > 3) {
    return false
  }
  if (selected.length == 1) {
    return /^[XJQKA]/.test(selected[0])
  }
  if (selected.length == 2 || selected.length == 3) {
    return sameSuit(...selected) && !sameRank(...selected) && grouped(...selected)
  }
}
// board parts can be combined together to make new parts
// ASSUMES parts aren't the same rank/suit
export const combinable = (parts) => {
  if (parts.length != 2) { return false }
  if (parts.includes('JO')) { return false }
  if (parts.includes('XJ') && parts.includes('AS')) {
    return 'all_shocks'
  }
  if (rank(parts[0]) === 'A' && rank(parts[1]) === 'A' && suit(parts[0]) != 'S' && suit(parts[1]) != 'S') {
    return 'wild_shock'
  }
  if (sameSuit(...parts) && isFace(parts[0]) && isFace(parts[1])) {
    return 'transforms'
  }

  return false
}

export const makeFaceCard = (cards) => {
  if (!playable(cards)) { return false }

  const c = cards[0]
  if (cards.length == 1) {
    return [c, 1]
  } else {
    const firstRank = rank(c)
    const face = (firstRank <= 4) ? 'J' : (firstRank <= 7 ? 'Q' : 'K')
    return [
      `${face}${suit(c)}`,
      cards.length == 3 ? 2 : 1
    ]
  }
}
export const makeNewPart = (parts) => {
  switch(combinable(parts)) {
    case 'transforms':
      return 'A'+suit(parts[0])
    case 'wild_shock':
      return 'XJ'
    case 'all_shocks':
      return 'JO'
    default:
      return
  }
}

const cards = (
  state = {
    deck: generateDeck(),
    discards: [],
    hand: [],
    pieces: [],
  },
  action
) => {
  const {
    hand,
    deck,
    discards,
    pieces,
  } = state

  switch(action.type) {
    case 'DRAW_CARD':
      return drawCard(state)
    case 'START_GAME':
      return {
        ...state,
        deck: deck.slice(7),
        hand: sortedHand(
          hand.concat([
            { c: deck[0], selected: false },
            { c: deck[1], selected: false },
            { c: deck[2], selected: false },
            { c: deck[3], selected: false },
            { c: deck[4], selected: false },
            { c: deck[5], selected: false },
            { c: deck[6], selected: false },
          ])
        )
      }
    case 'SELECT_CARD': {
      const card = hand[action.card]
      const nextHand = [
        ...hand.slice(0, action.card),
        { c: card.c, selected: !card.selected },
        ...hand.slice(action.card+1)
      ]
      return {
        ...state,
        hand: nextHand,
      }
    }
    case 'PLAY_SELECTED':
      if (!action.pieces) { return state }

      return {
        ...state,
        pieces: action.pieces,
        discards: [...discards, ...action.cards],
        hand: hand.filter(c => !c.selected),
      }
    case 'COMBINE_PARTS':
      const newPart = makeNewPart(action.selected)
      if (!newPart) { return state }

      return {
        ...state,
        pieces: [newPart, 1],
      }
    case 'DISCARD_BY_RANDOM':
      const rand = Dice(hand.length).roll()
      return {
        ...state,
        hand: [...hand.slice(0, rand), ...hand.slice(rand+1)],
        discards: discards.concat(hand[rand]),
      }
    case 'LOSE_HALF_CARDS':
      const shuffled = shuffle(hand)
      const half = Math.floor(hand.length/2)
      return {
        ...state,
        hand: hand.slice(half),
        discards: discards.concat(hand.slice(0, half)),
      }
    case 'END_DEATH': {
      let nextState = { ...state }
      if (hand.length <= 7) {
        for (let i=hand.length; i<7; i++) {
          nextState = drawCard(nextState)
        }
      } else {
        // hand.length > 7
        let [nextHand, discarded] =  partition(hand, 'selected')
        if (nextHand.length>7) {
          discarded.push(nextHand.slice(7))
          nextHand = nextHand.slice(0, 7)
        } else if (nextHand.length===0) {
          discarded.push(hand.slice(7))
          nextHand = hand.slice(0, 7)
        }
        nextState.hand = nextHand
        nextState.discards = [...discards, ...discarded]
      }
      nextState.hand = nextState.hand.map(card => ({ c: card.c, selected: false }))
      return nextState
    }
    case 'REINCARNATE': {
      let nextState = { ...state }
      const discarded = hand.slice()
      nextState.hand = []
      nextState.discards = [...discards, ...discarded]
      for (let i=0; i<7; i++) {
        nextState = drawCard(nextState)
      }
      return nextState
    }
    case 'CLEAR_PIECES':
      return {
        ...state,
        pieces: []
      }
    default:
      return state
  }
}

export default cards
