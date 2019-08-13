import { combineReducers, createStore} from 'redux'

import { sixSides } from './constants'
// reducers
import board from './reducers/board'
import cards, { sameSuit, makeFaceCard } from './reducers/cards'
import laws, {
  hasnamuss,
  jackDiamonds,
  jackClubs,
  jackHearts,
  queenHearts,
  tenSpades,
  cantChooseLaw,
} from './reducers/laws'
import fd, { entering, deathEvent, allNotes } from './reducers/food_diagram'
import ep, { rollOptions } from './reducers/being'

const startCausalDeath = () => {
  const roll1 = sixSides.roll()
  const roll2 = sixSides.roll()
  let planet = 'ETERNAL-RETRIBUTION'
  if (roll1 == 6) {
    if (roll1 == roll2) {
      alert("Eternal retribution! There is no escape from this loathesome place.\n"+
            "You're out of the game backwards.")
      location.reload()
      return
    }
    planet = 'SELF-REPROACH'
  } else if (roll1 < 4) {
    if (roll1 == roll2) {
      store.dispatch({ type: 'CLEANSE_JOKER' })
      if (hasnamuss(store.getState().laws.active)) {
        startCausalDeath()
        return
      }
      alert(`You're automatically cleansed by rolling double ${roll1}!\n`+
            `You can continue playing until you complete yourself.`)
      store.dispatch({ type: 'END_TURN' })
      store.dispatch({ type: 'END_DEATH' })
      return
    } else {
      planet = 'REMORSE-OF-CONSCIENCE'
    }
  } else {
    if (roll1 == roll2) {
      planet = 'REMORSE-OF-CONSCIENCE'
    } else {
      planet = 'REPENTANCE'
    }
  }
  alert(`The planet of your Hasnamuss is ${planet}!.`)
  store.dispatch({ type: 'CAUSAL_DEATH', planet })
  store.dispatch({ type: 'END_TURN' })
  store.dispatch({ type: 'END_DEATH' })
}
const presentEvent = (event) => {
  const active = store.getState().laws.active
  const asleep = jackDiamonds(active)
  const noskills = jackClubs(active)
  switch(event) {
    case 'DEPUTY-STEWARD':
      alert('After some time, with the help of magnetic center, a man may find a school.')
      store.dispatch({ type: 'FOUND_SCHOOL' })
      break
    case 'STEWARD':
      alert('April Fools! You have attained Steward')
      store.dispatch({ type: 'ATTAIN_STEWARD' })
      break
    case 'MASTER':
      alert('Impartiality! You have attained Master')
      store.dispatch({ type: 'ATTAIN_MASTER' })
      break
    case 'MENTAL-BODY':
      alert('I am Immortal within the limits of the Sun')
      break
    case 'ASTRAL-BODY':
      alert('I have crystallized the body Kesdjan')
      break
    case 'EXTRA-IMPRESSION':
      if (confirm('Extra Impression: Draw a card?\nCancel to take it back in as Air.')) {
        store.dispatch({type: 'DRAW_CARD'})
      } else {
        store.dispatch({type: 'BREATHE_AIR'})
      }
      break
    case 'EXTRA-AIR':
      if (confirm('Extra Air: Draw a card?\nCancel to take it back in as Food.')) {
        store.dispatch({type: 'DRAW_CARD'})
      } else {
        store.dispatch({type: 'EAT_FOOD'})
      }
      break
    case 'EXTRA-FOOD':
      alert('Extra Food: Draw a card.')
      store.dispatch({type: 'DRAW_CARD'})
      break
    case 'SELF-REMEMBER':
      store.dispatch({type: 'SELF_REMEMBER'})
      break
    case 'TRANSFORM-EMOTIONS':
      store.dispatch({type: 'TRANSFORM_EMOTIONS'})
      break
    case 'WILD-SHOCK':
      if (confirm('Wild Shock! Transform Emotions?\nCancel to choose another option')) {
        store.dispatch({type: 'TRANSFORM_EMOTIONS'})
      } else {
        if (confirm('Press "OK" to Self-Remember, "Cancel" to Shock Food.')) {
          store.dispatch({type: 'SELF_REMEMBER'})
        } else {
          store.dispatch({type: 'SHOCKS_FOOD'})
        }
      }
      break
    case 'ALL-SHOCKS':
      store.dispatch({type: 'TRANSFORM_EMOTIONS'})
      store.dispatch({type: 'SELF_REMEMBER'})
      store.dispatch({type: 'SHOCKS_FOOD'})
      break
    case 'SHOCKS-FOOD':
      store.dispatch({type: 'SHOCKS_FOOD'})
      break
    case 'SHOCKS-AIR':
      store.dispatch({type: 'SHOCKS_AIR'})
      break
    case 'C-12':
      alert('"Higher 12" - draw a card')
      store.dispatch({type: 'DRAW_CARD'})
      break
    case 'LA-24':
      alert('No 6')
      break
    case 'RE-24':
      alert('No 6')
      break
    case 'SO-48':
      alert('No 12')
      break
    case 'MI-48':
      const ewb = store.getState().ep.ewb
      if (!asleep && !noskills && ewb && confirm('Eat when you breathe?')) {
        store.dispatch({type: 'EAT_WHEN_YOU_BREATHE'})
      } else {
        store.dispatch({type: 'LEAVE_MI_48'})
      }
      break
    case 'DO-48':
      const c12 = store.getState().ep.c12
      if (!asleep && !noskills && c12 && confirm('Carbon-12?')) {
        store.dispatch({type: 'CARBON_12'})
      } else {
        store.dispatch({type: 'LEAVE_DO_48'})
      }
      break
    case 'RE-96':
      alert('No 24')
      break
    case 'FA-96':
      alert('No 24')
      break
    case 'MI-192':
      const bwe = store.getState().ep.bwe
      if (!asleep && !noskills && bwe && confirm('Breathe when you eat?')) {
        store.dispatch({type: 'BREATHE_WHEN_YOU_EAT'})
      } else {
        store.dispatch({type: 'LEAVE_MI_192'})
      }
      break
    case 'DO-192':
      alert('No 48')
      break
    case 'RE-384':
      alert('No 96')
      break
    case 'DO-768':
      alert('No 192')
      break
    case 'BURP':
      alert('Brrrp!')
      break
    case 'HYPERVENTILATE':
      alert('Hyperventilate!')
      break
    case 'VOID':
      alert('Pouring from the empty into the void.')
      break
    case 'NOTHING-TO-REMEMBER':
      alert('Nothing to Remember.')
      break
    case 'CANT-CHOOSE-DEATH':
      alert("Can't choose death when there are other options.")
      break
    case 'CANT-CHOOSE-HASNAMUSS':
      alert("Can't choose hasnamuss when there are other options.")
      break
    case 'GAME-OVER':
      alert('Game over :( ... nothing to do but try again.')
      location.reload()
      break
    case 'ASTRAL-DEATH':
      alert('With Kesdjan body you can complete one roundtrip of the board before you perish for good.')
      store.dispatch({ type: 'END_TURN' })
      store.dispatch({ type: 'END_DEATH' })
      break
    case 'MENTAL-DEATH':
      alert('With Mental body you are beyond the reach of death. Play on until you complete yourself.')
      store.dispatch({ type: 'END_TURN' })
      store.dispatch({ type: 'END_DEATH' })
      break
    case 'REINCARNATE':
      store.dispatch({ type: 'REINCARNATE' })
      const { num_brains } = store.getState().ep
      alert(`You reincarnated as a ${num_brains}-brained being. Each roll multiplies by ${4-num_brains}.`)
      break
    case 'CAUSAL-DEATH':
      startCausalDeath()
      break
    case 'CLEANSE-HASNAMUSS':
      alert('You cleansed yourself from being a Hasnamuss!')
      store.dispatch({ type: 'CLEANSE_JOKER', take_piece: true })
      break
    case 'I-START-OVER':
      alert('You won! Proudly proclaim "I start over!"')
      location.reload()
      break
    default:
      console.warn(`presentEvent unknown event: ${event}`)
  }
}

const handleExtras = () => {
  store.getState().fd.extras.forEach(extra => presentEvent(extra))
  store.dispatch({ type: 'CLEAR_EXTRAS' })
  if (entering(store.getState().fd.enter)) {
    dispatchWithExtras({ type: 'ADVANCE_FOOD_DIAGRAM' })
  }
}

const dispatchWithExtras = (action) => {
  store.dispatch(action)
  handleExtras()
}

const handleRollOptions = () => {
  const active = store.getState().laws.active
  const asleep = jackDiamonds(active)
  // HASNAMUSS: no roll-options
  if (asleep || hasnamuss(active)) { return }

  let roll = store.getState().board.roll
  let options = rollOptions(store.getState().ep.level_of_being)
  if (options.includes('OPPOSITE')) {
    if (confirm(`Roll=${roll}. Take the opposite roll?`)) {
      store.dispatch({ type: 'TAKE_OPPOSITE' })
      return
    }
  }
  if (options.includes('ROLL_AGAIN')) {
    if (confirm(`Roll=${roll}. Roll again?`)) {
      store.dispatch({ type: 'ROLL_DICE' })
    }
  }
  if (queenHearts(active)) {
    if (confirm(`Roll=${roll}. Use Queen-Hearts to take the opposite?`)) {
      store.dispatch({ type: 'TAKE_OPPOSITE' })
      store.dispatch({ type: 'REMOVE_ACTIVE', card: 'QH' })
    }
  }
  if (tenSpades(active)) {
    if (confirm(`Roll=${roll}. Use 10-Spades to roll again?`)) {
      store.dispatch({ type: 'ROLL_DICE' })
      store.dispatch({ type: 'REMOVE_ACTIVE', card: '10S' })
    }
  }
}

const handlePieces = (action) => {
  store.dispatch(action)
  const {
    cards: { pieces },
    ep: { pieces: epPieces },
    laws: { active },
  } = store.getState()
  store.dispatch({ type: 'MAKE_PIECES', pieces })
  store.dispatch({ type: 'CLEAR_PIECES' })
  // handle shocks
  store.getState().ep.shocks.forEach(shock => presentEvent(shock))
  store.dispatch({ type: 'CLEAR_SHOCKS' })
  // harnel-miaznel
  dispatchWithExtras({ type: 'ADVANCE_FOOD_DIAGRAM' })
  // handle new levels of being
  store.getState().ep.new_levels.forEach(level => presentEvent(level))
  store.dispatch({ type: 'CLEAR_NEW_LEVELS' })
  // check for cleansed hasnamuss
  if (epPieces[17] > 3 && hasnamuss(active)) {
    presentEvent('CLEANSE-HASNAMUSS')
  }
  handleEndGame()
}

const handleDecay = () => {
  const { fd: { current }, board: { dice } } = store.getState()
  const roll = dice.roll()

  const rollDiv3 = roll % 3
  const decay = roll === 0 ? 'nothing' :
    rollDiv3 === 0 ? 'food' :
    rollDiv3 === 1 ? 'air' :
    'impression'
  switch(decay) {
    case 'nothing':
      alert("Decayed nothing")
      return
    case 'food':
      decayFood(current.food)
      return
    case 'air':
      decayAir(current.air)
      return
    case 'impression':
      decayImpression(current.impressions)
      return
  }
}

const handleWildSpace = () => {
  store.dispatch({ type: 'MAGNETIC_CENTER_MOMENT' })
  while(true) {
    if (confirm('Wild Space! Draw a card?')) {
      store.dispatch({ type: 'DRAW_CARD' })
      break
    } else if (confirm('Take impression?')) {
      dispatchWithExtras({ type: 'TAKE_IMPRESSION' })
      break
    } else if (confirm('Take air?')) {
      dispatchWithExtras({ type: 'BREATHE_AIR' })
      break
    } else if (confirm('Take food?')) {
      dispatchWithExtras({ type: 'EAT_FOOD' })
      break
    }
  }
}

const decayFood = (notes) => {
  if (notes[0] + notes[1] + notes[2] + notes[3] + notes[4] + notes[5] + notes[6] + notes[7] === 0) {
    alert('No food to decay')
    return
  }
  while(true) {
    if (notes[0] && confirm('Decay DO-768?')) {
      store.dispatch({ type: 'DECAY_NOTE', note: 'DO-768' })
      return
    }
    if (notes[1] && confirm('Decay RE-384?')) {
      store.dispatch({ type: 'DECAY_NOTE', note: 'RE-384' })
      return
    }
    if (notes[2] && confirm('Decay MI-192?')) {
      store.dispatch({ type: 'DECAY_NOTE', note: 'MI-192' })
      return
    }
    if (notes[3] && confirm('Decay FA-96?')) {
      store.dispatch({ type: 'DECAY_NOTE', note: 'FA-96' })
      return
    }
    if (notes[4] && confirm('Decay SO-48?')) {
      store.dispatch({ type: 'DECAY_NOTE', note: 'SO-48' })
      return
    }
    if (notes[5] && confirm('Decay LA-24?')) {
      store.dispatch({ type: 'DECAY_NOTE', note: 'LA-24' })
      return
    }
    if (notes[6] && confirm('Decay TI-12?')) {
      store.dispatch({ type: 'DECAY_NOTE', note: 'TI-12' })
      return
    }
    if (notes[7] && confirm('Decay DO-6?')) {
      store.dispatch({ type: 'DECAY_NOTE', note: 'DO-6' })
      return
    }
  }
}

const decayAir = (notes) => {
  if (notes[0] + notes[1] + notes[2] + notes[3] + notes[4] + notes[5] === 0) {
    alert('No air to decay')
    return
  }
  while(true) {
    if (notes[0] && confirm('Decay DO-192?')) {
      store.dispatch({ type: 'DECAY_NOTE', note: 'DO-192' })
      return
    }
    if (notes[1] && confirm('Decay RE-96?')) {
      store.dispatch({ type: 'DECAY_NOTE', note: 'RE-96' })
      return
    }
    if (notes[2] && confirm('Decay MI-48?')) {
      store.dispatch({ type: 'DECAY_NOTE', note: 'MI-48' })
      return
    }
    if (notes[3] && confirm('Decay FA-24?')) {
      store.dispatch({ type: 'DECAY_NOTE', note: 'FA-24' })
      return
    }
    if (notes[4] && confirm('Decay SO-12?')) {
      store.dispatch({ type: 'DECAY_NOTE', note: 'SO-12' })
      return
    }
    if (notes[5] && confirm('Decay LA-6?')) {
      store.dispatch({ type: 'DECAY_NOTE', note: 'LA-6' })
      return
    }
  }
}

const decayImpression = (notes) => {
  if (notes[0] + notes[1] + notes[2] + notes[3] === 0) {
    alert('No impressions to decay')
    return
  }
  while (true) {
    if (notes[0] && confirm('Decay DO-48?')) {
      store.dispatch({ type: 'DECAY_NOTE', note: 'DO-48' })
      return
    }
    if (notes[1] && confirm('Decay RE-24?')) {
      store.dispatch({ type: 'DECAY_NOTE', note: 'RE-24' })
      return
    }
    if (notes[2] && confirm('Decay MI-12?')) {
      store.dispatch({ type: 'DECAY_NOTE', note: 'MI-12' })
      return
    }
    if (notes[3] && confirm('Decay FA-6?')) {
      store.dispatch({ type: 'DECAY_NOTE', note: 'FA-6' })
      return
    }
  }
}

const handleChooseLaw = (card) => {
  const notAnOption =  cantChooseLaw(store.getState().laws, card)
  if (notAnOption) {
    presentEvent(notAnOption)
  } else {
    store.dispatch({ type: "ONE_BY_CHOICE", card })
  }
}
const handleLawEvents = () => {
  const { being_type } = store.getState().ep
  store.dispatch({ type: 'OBEY_LAW' })
  for (let lawAction of store.getState().laws.actions) {
    store.dispatch(Object.assign({ being_type }, lawAction))
  }
  store.dispatch({ type: 'CLEAR_ACTIONS' })
  handleExtras()
  handleEndGame()
}

const handleRollClick = () => {
  const { position: position_before } = store.getState().board
  const roll_multiplier = 4 - store.getState().ep.num_brains
  const { active } = store.getState().laws
  const asleep = jackDiamonds(active)
  store.dispatch({ type: 'END_TURN' })
  store.dispatch({ type: 'ROLL_DICE' })
  handleRollOptions()
  store.dispatch({ type: 'MOVE_ROLL', roll_multiplier })
  const { position, spaces, laws_cancel } = store.getState().board
  for (let s of spaces.substring(position_before+1, position)) {
    if (s==='L' && !asleep) {
      store.dispatch({ type: 'DRAW_LAW_CARD' })
      store.dispatch({ type: 'PASS_LAW' })
    }
  }
  for (let card of laws_cancel) {
    store.dispatch({ type: 'REMOVE_ACTIVE', card })
  }

  // no stuff while asleep
  if (asleep) { return }

  switch(spaces[position]) {
    case 'F':
      dispatchWithExtras({ type: 'EAT_FOOD' })
      break;
    case 'A':
      dispatchWithExtras({ type: 'BREATHE_AIR' })
      break;
    case 'I':
      dispatchWithExtras({ type: 'TAKE_IMPRESSION' })
      break;
    case 'C':
      store.dispatch({ type: 'DRAW_CARD' })
      break;
    case 'L':
      store.dispatch({ type: 'DRAW_LAW_CARD' })
      store.dispatch({ type: 'MAGNETIC_CENTER_MOMENT' })
      break;
    case 'D':
      handleDecay()
      break;
    case '*':
      handleWildSpace()
      break;
    default:
  }
  handleEndGame()
}

const endDeath = () => {
  const {
    fd: { current },
    board: { completed_trip },
    laws: { active },
  } = store.getState()
  presentEvent(deathEvent(current, completed_trip, hasnamuss(active)))
}

const handleEndGame = () => {
  const {
    fd: { current },
    ep: { pieces },
    laws: { active },
  } = store.getState()
  if (pieces[17] > 2 && current.mental && allNotes(current) && !hasnamuss(active)) {
    presentEvent('I-START-OVER')
  }
}

export const actions = {
  onRollClick: handleRollClick,
  onEndDeath: endDeath,
  onDrawCard: () => store.dispatch({ type: 'DRAW_CARD' }),
  onDrawLawCard: () => store.dispatch({ type: 'DRAW_LAW_CARD' }),
  onSelectCard: (card) => store.dispatch({ type: 'SELECT_CARD', card }),
  onSelectLawCard: (card) => store.dispatch({ type: 'SELECT_LAW_CARD', card }),
  onSelectPart: (card) => store.dispatch({ type: 'SELECT_PART', card }),
  onPlaySelected: (cards, lawCards) => handlePieces({
    type: 'PLAY_SELECTED',
    cards,
    pieces: makeFaceCard(cards.concat(lawCards))
  }),
  onObeyLaw: handleLawEvents,
  onEatFood: () => dispatchWithExtras({ type: 'EAT_FOOD' }),
  onBreatheAir: () => dispatchWithExtras({ type: 'BREATHE_AIR' }),
  onTakeImpression: () => dispatchWithExtras({ type: 'TAKE_IMPRESSION' }),
  onSelfRemember: () => dispatchWithExtras({ type: 'SELF_REMEMBER' }),
  onTransformEmotions: () => dispatchWithExtras({ type: 'TRANSFORM_EMOTIONS' }),
  onCombineSelectedParts: (selected) => handlePieces({ type: 'COMBINE_PARTS', selected }),
  onAdvanceFoodDiagram: () => dispatchWithExtras({ type: 'ADVANCE_FOOD_DIAGRAM' }),
  onDying: () => store.dispatch({ type: 'DEATH' }),
  onRandomLaw: () => store.dispatch({
    type: "ONE_BY_RANDOM",
    roll: store.getState().board.dice.roll()
  }),
  onChooseLaw: (card) => handleChooseLaw(card),
}

const reducers = combineReducers({ board, cards, laws, fd, ep })
const store = createStore(reducers)
export default store
