import {
  each,
  map,
  find,
  compact,
  filter,
  reject,
  shuffle,
  some,
  indexOf,
  partition,
} from 'lodash'

import {
  selectedCards,
  sameSuit,
} from './cards'

import {
  LAW_DECK,
  KD,
  KC,
  KH,
  KS,
} from '../constants'

export const lawAtIndex = (law) => LAW_DECK[law.index]
export const selectedLaws = (cards) => filter(cards, 'selected')
export const selectedPlayedLaws = (cards) => filter(cards, {'selected': true, 'played': true})
export const unobeyedLaws = (cards) => filter(cards, c => !c.obeyed)
export const hasnamuss = (active) => active.map(a => a.index).includes(84)
export const jackDiamonds = (active) => active.map(a => a.index).includes(18)
export const jackClubs = (active) => active.map(a => a.index).includes(40)
export const jackHearts = (active) => active.map(a => a.index).includes(58)
export const queenHearts = (active) => active.map(a => a.index).includes(59)
export const tenSpades = (active) => active.map(a => a.index).includes(77)
export const cantChooseLaw = ({ hand }, index) => {
  const chosen = hand[index].c.card
  if (isAce(chosen) && find(hand, (c) => !isAce(c.c.card))) {
    return 'CANT-CHOOSE-DEATH'
  } else if (isJoker(chosen) && find(hand, (c) => !isAce(c.c.card) && !isJoker(c.c.card))) {
    return 'CANT-CHOOSE-HASNAMUSS'
  }
}

const activeKings = (active) => map(
         filter(active, (c) => [ KD, KC, KH, KS ].includes(c.index)),
  lawAtIndex
)
const isProtected = (card) => !!card.protected.length

// only works with active cards
const isLawCard = (card) => {
  if (card == 'JD') {
    return (law) => law.index == 18
  } else if (card == 'JC') {
    return (law) => law.index == 40
  } else if (card == 'JH') {
    return (law) => law.index == 58
  } else if (card == 'QH') {
    return (law) => law.index == 59
  } else if (card == '10S') {
    return (law) => law.index == 77
  } else if (card == 'JO') {
    return (law) => law.index == 84
  }
}
const isLawSuit = (suit, law) => {
  switch(suit) {
    case 'D':
      return law.index < 22 && law.index != KD
    case 'C':
      return law.index >= 22 && law.index < 44 && law.index != KC
    case 'H':
      return law.index >= 44 && law.index < 62 && law.index != KH
    case 'S':
      return law.index >= 62 && law.index < 83 && law.index != KS
  }
}
const isAce = (card) => ['AD','AC','AH','AS'].includes(card)
const isJoker = (card) => 'JO'===card

const drawLawCard = (state) => {
  let {
    hand,
    deck,
    discards,
  } = state
  if (!deck.length) {
    deck = shuffle(discards)
    discards = []
  }
  return {
    ...state,
    hand: hand.concat({ c: deck[0], selected: false }),
    deck: deck.slice(1),
    discards,
  }
}

const testLawCard = (deck, law_text) => {
  const textTest = new RegExp(`^${law_text}`)
  const lawIndex = deck.findIndex((el) => el.text.match(textTest))
  if (lawIndex >= 0) {
    const tmpLaw = deck[lawIndex]
    deck[lawIndex] = deck[0]
    deck[0] = tmpLaw
  }
  return deck
}

const generateLawDeck = () => {
  const newDeck = shuffle(LAW_DECK.slice(0))
  return newDeck
  //return testLawCard(newDeck, 'MAKE ONE THING')
}

const laws = (
  state = {
    deck: [],
    hand: [],
    active: [],
    discards: [],
    in_play: [],
    actions: [],
  },
  action
) => {
  const {
    active,
    hand,
    in_play,
    deck,
    discards,
  } = state
  switch(action.type) {
    case 'DRAW_LAW_CARD': {
      return drawLawCard(state)
    }
    case 'START_GAME':
      const newDeck = generateLawDeck()
      return {
        ...state,
        deck: newDeck.slice(3),
        hand: hand.concat([
          { c: newDeck[0], selected: false },
          { c: newDeck[1], selected: false },
          { c: newDeck[2], selected: false }
        ])
      }
    case 'SELECT_LAW_CARD':
      const card = in_play[action.card]
      return {
        ...state,
        in_play: [
          ...in_play.slice(0, action.card),
          { ...card, selected: !card.selected },
          ...in_play.slice(action.card+1)
        ],
      }
    case 'ONE_BY_RANDOM':
      // empty hand or rolled a 0 ("none by random")
      if (!hand.length || !action.roll) {
        return state
      }
      const shuffledHand = shuffle(hand)
      const randomIndex = (action.roll - 1) % shuffledHand.length
      return {
        ...state,
        in_play: in_play.concat(shuffledHand[randomIndex]),
        hand: shuffledHand.filter((v, idx) => idx != randomIndex),
      }
    case 'ONE_BY_CHOICE':
      const chosenIndex = action.card
      return {
        ...state,
        in_play: in_play.concat(hand[chosenIndex]),
        hand: hand.filter((v, idx) => idx != chosenIndex),
      }
    case 'OBEY_WITHOUT_ESCAPE': {
      let nextState = drawLawCard(state)
      let newLaw = nextState.hand.pop()
      if (action.card == '2C') {
        for (let i=1; i<action.being_type; i++) {
          nextState = drawLawCard(nextState)
          newLaw = nextState.hand.pop()
        }
      }
      const no_escape = action.no_escape ? [action.card, ...(action.no_escape)] : [action.card]
      return {
        ...nextState,
        in_play: in_play.concat({ ...newLaw, no_escape }),
      }
    }
    case 'PLAY_SELECTED':
      if (!action.pieces) { return state }

      // mark laws as played, cards reducer handles piece creation
      return {
        ...state,
        in_play: map(in_play, (c) => ({
            ...c,
            selected: c.selected ? false : c.selected,
            played: c.selected ? true : c.played,
        })),
      }
    case 'DISCARD_LAW_HAND':
      return {
        ...state,
        discards: discards.concat(map(hand, 'c')),
        hand: []
      }
    case 'OBEY_LAW': {
      const selectedLaws = filter(in_play, 'selected')
      if (selectedLaws.length !== 1) {
        console.log("only 1 law play at a time")
        return state
      }
      const lawCard = selectedLaws[0]
      if (lawCard.obeyed) {
        console.log("already obeyed ", lawCard)
        return state
      }

      lawCard.obeyed = true
      lawCard.selected = false
      let nextState = { ...state }

      const actions = lawCard.c.actions
      if (lawCard.no_escape) {
        console.log("no escape!")
        each(actions, (action) => {
          if ('ACTIVE_LAW' == action.type) {
            action.protected = lawCard.no_escape
          } else if ('OBEY_WITHOUT_ESCAPE' == action.type) {
            action.no_escape = lawCard.no_escape
          }
        })
      } else if (some(activeKings(active), (k) => sameSuit(k.card, lawCard.c.card))) {
        console.log("Moon escapes! ", lawCard)
        return nextState
      }

      return {
        ...nextState,
        actions,
      }
    }
    case 'ACTIVE_LAW':
      return {
        ...state,
        active: active.concat({ index: action.card, protected: action.protected||[] }),
      }
    case 'REMOVE_ACTIVE': {
      let nextActive
      if (action.suit) {
        // king moon
        nextActive = compact(
          map(active, (law) => {
            if (isProtected(law)) {
              if ((action.suit == 'C' && law.protected[0] == '2C') ||
                  (action.suit == 'S' && law.protected[0] == '2S')) {
                law.protected.shift()
              }
              return law
            } else if (isLawSuit(action.suit, law)) {
              return undefined
            }
          })
        )
      } else if (action.card) {
        // roll option cards
        nextActive = reject(active, isLawCard(action.card))
      }
      return {
        ...state,
        active: nextActive,
      }
    }
    case 'CLEANSE_JOKER': {
      const [jokers, rest] = partition(active, isLawCard('JO'))
      const joker = jokers[0]
      if (isProtected(joker)) {
        joker.protected.shift()
        rest.push(joker)
      }
      return {
        ...state,
        active: rest
      }
    }
    case 'END_DEATH': {
      const discarded = map(hand.concat(in_play), 'c').concat(map(active, lawAtIndex))
      return {
        ...state,
        discards: discards.concat(discarded),
        hand: [],
        active: [],
        in_play: [],
        actions: [],
      }
    }
    case 'REINCARNATE': {
      // discard everything but the active Joker
      const [nextActive, discardActive] = partition(active, isLawCard('JO'))
      const discarded = map(hand.concat(in_play), 'c').concat(map(discardActive, lawAtIndex))
      let nextState = {
        ...state,
        discards: discards.concat(discarded),
        hand: [],
        active: nextActive,
        in_play: [],
        actions: [],
      }
      for (let i=0; i<3; i++) {
        nextState = drawLawCard(nextState)
      }
      return nextState
    }
    case 'ROLL_DICE': {
      // don't discard active laws (they could be re-drawn)
      const actives = map(active, 'index')
      const inPlay = map(in_play, 'c').filter(
        (l) => !actives.includes(indexOf(LAW_DECK, (ld) => ld.card == l.card))
      )
      return {
        ...state,
        discards: discards.concat(inPlay),
        in_play: [],
      }
    }
    case 'CANCEL_ALL_LAWS':
      // remove first protected
      const newActive = map(
        filter(active, isProtected),
        l => ({ ...l, protected: l.protected.slice(1) })
      )
      // remove first no_escape from current in_play, mark others obeyed
      const newInPlay = map(in_play, lc => {
        if (lc.no_escape) {
          if (lc.no_escape.length == 1) {
            delete lc.no_escape
          } else {
            lc.no_escape.shift()
          }
          return lc
        } else {
          return  {
            ...lc,
            obeyed: true
          }
        }
      })
      return {
        ...state,
        active: newActive,
        in_play: newInPlay,
      }
    case 'CLEAR_ACTIONS':
      return {
        ...state,
        actions: []
      }
    default:
      return state
  }
}

export default laws
