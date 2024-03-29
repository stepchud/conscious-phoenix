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
import { toast } from 'react-toastify'

import { sameSuit } from './cards'
import {
  lawsPassed,
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
const isCovered = (card) => !!card.covered.length

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

const drawLawCard = (state, count = 1) => {
  if (count == 0) { return state }
  let deck = [...state.deck]
  let discards = [...state.discards]
  const hand = [...state.hand]
  if (!deck.length) {
    deck = shuffle(discards)
    discards = []
  }
  const card = deck.shift()
  hand.push({ c: card, selected: false })
  const drawOne = { ...state, hand, deck, discards }

  return (count == 1)
  ? drawOne
  : drawLawCard(drawOne, count-1)
}

const testLawCard = (deck, law_text) => {
  const textTest = new RegExp(law_text)
  const lawIndex = deck.findIndex((el) => el.text.match(textTest))
  if (lawIndex >= 0) {
    const testLaw = deck.splice(lawIndex, 1)
    deck = testLaw.concat(deck)
  } else {
    console.log("law card not found")
  }
  return deck
}

const generateLawDeck = () => {
  const newDeck = shuffle(LAW_DECK.slice(0))
  return newDeck
  //return (
  //  testLawCard(
  //    testLawCard(
  //      newDeck,
  //      'MASTER EXERCISES'
  //    ),
  //    'TWO ENDS'
  //  )
  //)
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
  const in_play_not_shared = in_play.filter(lc => !lc.shared)
  switch(action.type) {
    case 'MOVE_SPACE': {
      const { position, next_position, alive, asleep } = action
      const laws_passed = lawsPassed(position, next_position, asleep, alive)
      const nextState = drawLawCard({ ...state }, laws_passed)
      const nextActive = []
      active.forEach(lc => {
        if (lc.until >= 0) {
          const moved = next_position > position ? next_position - position : position - next_position
          const until = lc.until - moved
          if (until >= 0) {
            nextActive.push({ ...lc, until })
          }
        } else {
          nextActive.push(lc)
        }
      })
      return {
        ...nextState,
        active: nextActive,
      }
    }
    case 'DRAW_LAW_CARD':
      return drawLawCard(state)
    case 'START_GAME':
    case 'WAIT_GAME': {
      const nextState = {
        ...state,
        deck: generateLawDeck()
      }
      return drawLawCard(nextState, 3)
    }
    case 'JOIN_GAME': {
      const { deck, discards } = action.state.laws
      const nextState = {
        ...state,
        deck,
        discards,
      }
      return drawLawCard(nextState, 3)
    }
    case 'UPDATE_GAME':
      if (!action.laws) { return state }
      const { shared_laws = [ ] } = action.laws
      delete(action.laws.shared_laws)
      return {
        ...state,
        in_play: [ ...in_play, ...shared_laws ],
        ...action.laws,
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
      // empty hand or rolled a 0
      if (hand.length==0 || action.roll==0) {
        toast("none by random")
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
      let discarded = []
      if (action.card == '2C') {
        for (let i=1; i<action.being_type; i++) {
          discarded.push(newLaw.c)
          nextState = drawLawCard(nextState)
          newLaw = nextState.hand.pop()
        }
      }
      const no_escape = action.no_escape ? [action.card, ...(action.no_escape)] : [action.card]
      return {
        ...nextState,
        in_play: in_play.concat({ ...newLaw, no_escape }),
        discards: [...discards, ...discarded],
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
    case 'DISCARD_LAW_HAND': {
      const discarded = map(hand, 'c')
      return {
        ...state,
        discards: [...discards, ...discarded],
        hand: []
      }
    }
    case 'OBEY_LAW': {
      const selectedLaws = filter(in_play, 'selected')
      if (selectedLaws.length !== 1) {
        toast("Only 1 law play at a time")
        return state
      }
      const lawCard = selectedLaws[0]
      if (lawCard.obeyed) {
        toast(`You already obeyed ${lawCard.c.card}`)
        return state
      }

      lawCard.obeyed = true
      lawCard.selected = false
      let nextState = { ...state }

      const actions = [ ...lawCard.c.actions ]
      if (lawCard.no_escape) {
        toast('No escape from the law!')
        each(actions, (lawAction) => {
          if ('ACTIVE_LAW' == lawAction.type) {
            lawAction.covered = lawCard.no_escape
          } else if ('OBEY_WITHOUT_ESCAPE' == lawAction.type) {
            lawAction.no_escape = lawCard.no_escape
          }
        })
      } else if (some(activeKings(active), (k) => sameSuit(k.card, lawCard.c.card))) {
        toast(`Moon escapes ${lawCard.c.card}!`)
        return nextState
      }

      return {
        ...nextState,
        actions,
      }
    }
    case 'ACTIVE_LAW': {
      const { card, until, covered } = action
      const nextActive = [...active, { index: card, covered: (covered||[]), until }]
      return {
        ...state,
        active: nextActive
      }
    }
    case 'REMOVE_ACTIVE': {
      let nextActive
      if (action.suit) {
        // king moon
        nextActive = compact(
          map(active, (law) => {
            if (isCovered(law)) {
              if ((action.suit == 'C' && law.covered[0] == '2C') ||
                  (action.suit == 'S' && law.covered[0] == '2S')) {
                law.covered.shift()
              }
            } else if (isLawSuit(action.suit, law)) {
              return undefined
            }
            return law
          })
        )
      } else if (action.card) {
        // roll option cards, or passed the active space
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
      if (isCovered(joker)) {
        joker.covered.shift()
        rest.push(joker)
      }
      return {
        ...state,
        active: rest
      }
    }
    case 'END_DEATH': {
      const discarded = map(hand.concat(in_play_not_shared), 'c').concat(map(active, lawAtIndex))
      return {
        ...state,
        discards: [...discards, ...discarded],
        hand: [],
        active: [],
        in_play: [],
        actions: [],
      }
    }
    case 'REINCARNATE': {
      // discard everything but the active Joker
      const [nextActive, discardActive] = partition(active, isLawCard('JO'))
      const discarded = map(hand.concat(in_play_not_shared), 'c').concat(map(discardActive, lawAtIndex))
      let nextState = {
        ...state,
        discards: [...discards, ...discarded],
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
    case 'END_TURN': {
      // don't discard active (they could be re-drawn)
      const actives = map(active, 'index')
      const shared = map(in_play_not_shared.filter(
        law => law.c.card == 'QC' || law.c.card == 'XJ' || (law.no_escape || []).includes('2S')
      ), 'c')
      // NOTE: discard shared laws, in case someone can pull the XJ again for JO
      const to_discard = map(in_play_not_shared, 'c').filter(
        law => !actives.includes(indexOf(LAW_DECK, (ld) => ld.card == law.card))
      )
      return {
        ...state,
        discards: [...discards, ...to_discard],
        in_play: [],
        shared,
      }
    }
    case 'CANCEL_ALL_LAWS':
      // remove first covered
      const newActive = map(
        filter(active, isCovered),
        l => ({ ...l, covered: l.covered.slice(1) })
      )
      const newInPlay = map(in_play, lc => lc.no_escape ? lc : { ...lc, obeyed: true })
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
