import { bindActionCreators, combineReducers, createStore} from 'redux'
import { toast } from 'react-toastify'

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
import ep from './reducers/being'
import modal from './reducers/modal'
import actions from './actions'

const reducers = combineReducers({ board, cards, laws, fd, ep, modal })
export const store = createStore(reducers)
const boundActions = bindActionCreators(actions, store.dispatch)

const showModal = (props) => boundActions.showModal(props, boundActions.hideModal)

const startCausalDeath = () => {
  const roll1 = sixSides.roll()
  const roll2 = sixSides.roll()
  let planet = 'ETERNAL-RETRIBUTION'
  if (roll1 == 6) {
    if (roll1 == roll2) {
      showModal({
        title: 'Eternal retribution!',
        body: "There is no escape from this loathesome place. You're out of the game backwards.",
        onClose: () => { location.reload() }
      })
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
      showModal({
        title: 'Lucky Dog',
        body: `You're automatically cleansed by rolling double ${roll1}! `+
          `You can continue playing until you complete yourself.`,
        onClose: () => {
          store.dispatch({ type: 'END_TURN' })
          store.dispatch({ type: 'END_DEATH' })
        }
      })
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
  showModal({
    title: 'Hasnamuss planet',
    body: `The planet of your Hasnamuss is called ${planet}.`,
    onClose: () => {
      store.dispatch({ type: 'CAUSAL_DEATH', planet })
      store.dispatch({ type: 'END_TURN' })
      store.dispatch({ type: 'END_DEATH' })
    }
  })
}
const presentEvent = (event) => {
  const active = store.getState().laws.active
  const asleep = jackDiamonds(active)
  const noskills = jackClubs(active)
  switch(event) {
    case 'DEPUTY-STEWARD':
      showModal({
        title: 'Found School',
        body: 'After some time, with the help of magnetic center, a man may find a school.',
        onClose: () => store.dispatch({ type: 'FOUND_SCHOOL' })
      })
      break
    case 'STEWARD':
      showModal({
        title: 'April Fools!',
        body: 'You have attained Steward.',
        onClose: () => store.dispatch({ type: 'ATTAIN_STEWARD' })
      })
      break
    case 'MASTER':
      showModal({
        title: 'Impartiality!',
        body: 'You have attained Master',
        onClose: () => store.dispatch({ type: 'ATTAIN_MASTER' })
      })
      break
    case 'MENTAL-BODY':
      showModal({ title: 'Mental Body', body: 'I am Immortal within the limits of the Sun' })
      break
    case 'ASTRAL-BODY':
      showModal({ title: "Astral Body", body: 'I have crystallized the body Kesdjan' })
      break
    case 'EXTRA-IMPRESSION':
      showModal({
        title: 'Extra Impression',
        body: 'Draw a card or take it back in as Air.',
        options: [
          { text: 'Draw Card', onClick: () => store.dispatch({type: 'DRAW_CARD'}) },
          { text: 'Breathe Air', onClose: () => store.dispatch({type: 'BREATHE_AIR'}) }
        ]
      })
      break
    case 'EXTRA-AIR':
      showModal({
        title: 'Extra Air',
        body: 'Draw a card or take it back in as Food.',
        options: [
          { text: 'Draw Card', onClick: () => store.dispatch({type: 'DRAW_CARD'}) },
          { text: 'Eat Food', onClick: () => store.dispatch({type: 'EAT_FOOD'}) }
        ]
      })
      break
    case 'EXTRA-FOOD':
      showModal({
        title: 'Extra Food',
        body: 'Extra food chip, draw a card.',
        onClose: () => store.dispatch({type: 'DRAW_CARD'})
      })
      break
    case 'SELF-REMEMBER':
      store.dispatch({type: 'SELF_REMEMBER'})
      break
    case 'TRANSFORM-EMOTIONS':
      store.dispatch({type: 'TRANSFORM_EMOTIONS'})
      break
    case 'WILD-SHOCK':
      showModal({
        title: 'Wild Shock',
        body: 'A wild shock appears! Which will it be?',
        options: [
          { text: 'Transform Emotions', onClick: () => dispatchWithExtras({type: 'TRANSFORM_EMOTIONS'}) },
          { text: 'Self Remember',      onClick: () => dispatchWithExtras({type: 'SELF_REMEMBER'}) },
          { text: 'Shock Food',         onClick: () => dispatchWithExtras({type: 'SHOCKS_FOOD'}) },
        ]
      })
      break
    case 'ALL-SHOCKS':
      showModal({
        title: 'All Shocks',
        body: 'All shocks are felt in your being.',
        onClose: () => {
          dispatchWithExtras({type: 'TRANSFORM_EMOTIONS'})
          dispatchWithExtras({type: 'SELF_REMEMBER'})
          dispatchWithExtras({type: 'SHOCKS_FOOD'})
        }
      })
      break
    case 'SHOCKS-FOOD':
      store.dispatch({type: 'SHOCKS_FOOD'})
      break
    case 'SHOCKS-AIR':
      store.dispatch({type: 'SHOCKS_AIR'})
      break
    case 'C-12':
      showModal({
        title: 'Higher 12',
        body: 'Draw a card by "Higher-12"',
        onClose: () => store.dispatch({type: 'DRAW_CARD'})
      })
      break
    case 'LA-24':
      toast.warn('No 6')
      break
    case 'RE-24':
      toast.warn('No 6')
      break
    case 'SO-48':
      toast.warn('No 12')
      break
    case 'MI-48':
      if (!asleep && !noskills && store.getState().ep.ewb) {
        showModal({
          title: 'Eat when you breathe?',
          body: 'Use your skills to shock Mi-48 to Fa-24?',
          options: [
            { text: 'Yes', onClick: () => dispatchWithExtras({type: 'EAT_WHEN_YOU_BREATHE'}) },
            { text: 'No', onClick: () => store.dispatch({type: 'LEAVE_MI_48'}) }
          ]
        })
      } else {
        store.dispatch({type: 'LEAVE_MI_48'})
      }
      break
    case 'DO-48':
      if (!asleep && !noskills && store.getState().ep.c12) {
        showModal({
          title: 'Carbon-12?',
          body: 'Use your skills to shock Do-48 to Re-24?',
          options: [
            { text: 'Yes', onCLick: () => dispatchWithExtras({type: 'CARBON_12'}) },
            { text: 'No', onClick: () => store.dispatch({type: 'LEAVE_DO_48'}) }
          ]
        })
      } else {
        store.dispatch({type: 'LEAVE_DO_48'})
      }
      break
    case 'RE-96':
      toast.warn('No 24')
      break
    case 'FA-96':
      toast.warn('No 24')
      break
    case 'MI-192':
      if (!asleep && !noskills && store.getState().ep.bwe) {
        showModal({
          title: 'Breathe when you eat?',
          body: 'Use your skills to shock Mi-192 to Fa-96?',
          options: [
            { text: 'Yes', onClick: () => dispatchWithExtras({type: 'BREATHE_WHEN_YOU_EAT'}) },
            { text: 'No', onClick: () => store.dispatch({type: 'LEAVE_MI_192'}) }
          ]
        })
      } else {
        store.dispatch({type: 'LEAVE_MI_192'})
      }
      break
    case 'DO-192':
      toast.warn('No 48')
      break
    case 'RE-384':
      toast.warn('No 96')
      break
    case 'DO-768':
      toast.warn('No 192')
      break
    case 'NOTHING-TO-REMEMBER':
      toast.warn('Nothing to remember at Do-48.')
      break
    case 'CANT-CHOOSE-DEATH':
      showModal({
        title: "Can't choose death",
        body: "You can't choose death when there are other options available."
      })
      break
    case 'CANT-CHOOSE-HASNAMUSS':
      showModal({
        title: "Can't choose hasnamuss",
        body: "You can't choose hasnamuss when there are other non-death options available."
      })
      break
    case 'GAME-OVER':
      showModal({
        title: 'Game over :(',
        body: 'Nothing else to do but try again.',
        onClose: () => { location.reload() }
      })
      break
    case 'ASTRAL-DEATH':
      showModal({
        title: 'You are dead',
        body: 'With Kesdjan-body you can complete one roundtrip of the board before you perish for good.',
        onClose: () => {
          store.dispatch({ type: 'END_TURN' })
          store.dispatch({ type: 'END_DEATH' })
        }
      })
      break
    case 'MENTAL-DEATH':
      showModal({
        title: 'You are dead',
        body: 'With Mental body you are beyond the reach of death. Play on until you complete yourself.',
        onClose: () => {
          store.dispatch({ type: 'END_TURN' })
          store.dispatch({ type: 'END_DEATH' })
        }
      })
      break
    case 'REINCARNATE':
      store.dispatch({ type: 'REINCARNATE' })
      const { num_brains } = store.getState().ep
      showModal({
        title: 'Reincarnated',
        body: `You reincarnated as a ${num_brains}-brained being. Each roll multiplies by ${4-num_brains}.`
      })
      break
    case 'CAUSAL-DEATH':
      startCausalDeath()
      break
    case 'CLEANSE-HASNAMUSS':
      showModal({
        title: 'Hasnamuss Cleansed!',
        body: 'Congratulations, you cleansed yourself from being a Hasnamuss!',
        onClose: () => store.dispatch({ type: 'CLEANSE_JOKER', take_piece: true })
      })
      break
    case 'I-START-OVER':
      showModal({
        title: 'You are a winner!',
        body: 'Proudly proclaim "I start over!"',
        onClose: () => { location.reload() }
      })
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
  if (asleep || hasnamuss(active)) {
    moveAfterRoll()
    return
  }
  let roll = store.getState().board.roll
  let lob = store.getState().ep.level_of_being
  const title = `You rolled ${roll}`
  let options = []
  switch(lob) {
    case  'MASTER':
      options.push({
        text: 'Take opposite',
        onClick: () => {
          store.dispatch({ type: 'TAKE_OPPOSITE' })
          moveAfterRoll()
        }
      })
      // fall through
    case 'STEWARD':
      options.push({ text: 'Roll again',
        onClick: () => {
          store.dispatch({ type: 'ROLL_DICE' })
          rollOptionLaws(store.getState().board.roll, active)
        }
      })
    break;
  }

  if (!!options.length) {
    options.push({ text: 'Take the roll', onClick: () => moveAfterRoll() })
    showModal({
      title,
      options
    })
  } else {
    rollOptionLaws(roll, active)
  }
}

const rollOptionLaws = (roll, active) => {
  if (!queenHearts(active) && !tenSpades(active)) {
    moveAfterRoll()
    return
  }

  const title = `You rolled ${roll}.`
  let body = []
  let options = []

  if (queenHearts(active)) {
    body.push('Use your Queen of Hearts law to take the opposite?')
    options.push({
      text: 'Take opposite',
      onClick: () => {
        store.dispatch({ type: 'TAKE_OPPOSITE' })
        store.dispatch({ type: 'REMOVE_ACTIVE', card: 'QH' })
        moveAfterRoll()
      }
    })
  }
  if (tenSpades(active)) {
    body.push('Use your 10 of Spades law to roll again?')
    options.push({
      text: 'Roll again',
      onClick: () => {
        store.dispatch({ type: 'ROLL_DICE' })
        store.dispatch({ type: 'REMOVE_ACTIVE', card: '10S' })
        moveAfterRoll()
      }
    })
  }
  options.push({ text: 'Not this time', onClick: () => moveAfterRoll() })

  showModal({
    title,
    body: body.join("\n"),
    options
  })
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
      toast.success("Decayed nothing!")
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
  showModal({
    title: 'Wild space!',
    body: 'Which would you choose:',
    options: [
      { text: 'Card', onClick: () => store.dispatch({ type: 'DRAW_CARD' }) },
      { text: 'Food',  onClick: () => dispatchWithExtras({ type: 'EAT_FOOD' }) },
      { text: 'Air', onClick: () => dispatchWithExtras({ type: 'BREATHE_AIR' }) },
      { text: 'Impression', onClick: () => dispatchWithExtras({ type: 'TAKE_IMPRESSION' }) }
    ]
  })
}

const decayFood = (notes) => {
  if (notes[0] + notes[1] + notes[2] + notes[3] + notes[4] + notes[5] + notes[6] + notes[7] === 0) {
    toast('No food to decay')
    return
  }
  const title = 'Decay food'
  const body = 'Choose which food to decay:'
  let options = []
  if (notes[0]) {
    options.push({ text: 'DO-768', onClick: () => store.dispatch({ type: 'DECAY_NOTE', note: 'DO-768' }) })
  }
  if (notes[1]) {
    options.push({ text: 'RE-384', onClick: () => store.dispatch({ type: 'DECAY_NOTE', note: 'RE-384' }) })
  }
  if (notes[2]) {
    options.push({ text: 'MI-192', onClick: () => store.dispatch({ type: 'DECAY_NOTE', note: 'MI-192' }) })
  }
  if (notes[3]) {
    options.push({ text: 'FA-96', onClick: () => store.dispatch({ type: 'DECAY_NOTE', note: 'FA-96' }) })
  }
  if (notes[4]) {
    options.push({ text: 'SO-48', onClick: () => store.dispatch({ type: 'DECAY_NOTE', note: 'SO-48' }) })
  }
  if (notes[5]) {
    options.push({ text: 'LA-24', onCLick: () => store.dispatch({ type: 'DECAY_NOTE', note: 'LA-24' }) })
  }
  if (notes[6]) {
    options.push({ text: 'TI-12', onClick: () => store.dispatch({ type: 'DECAY_NOTE', note: 'TI-12' }) })
  }
  if (notes[7]) {
    options.push({ text: 'DO-6', onClick: () => store.dispatch({ type: 'DECAY_NOTE', note: 'DO-6' }) })
  }
  showModal({ title, body, options })
}

const decayAir = (notes) => {
  if (notes[0] + notes[1] + notes[2] + notes[3] + notes[4] + notes[5] === 0) {
    toast('No air to decay')
    return
  }
  const title = 'Decay air'
  const body = 'Choose which air to decay:'
  let options = []
  if (notes[0]) {
    options.push({ text: 'DO-192', onClick: () => store.dispatch({ type: 'DECAY_NOTE', note: 'DO-192' }) })
  }
  if (notes[1]) {
    options.push({ text: 'RE-96', onClick: () => store.dispatch({ type: 'DECAY_NOTE', note: 'RE-96' }) })
  }
  if (notes[2]) {
    options.push({ text: 'MI-48', onClick: () => store.dispatch({ type: 'DECAY_NOTE', note: 'MI-48' }) })
  }
  if (notes[3]) {
    options.push({ text: 'FA-24', onCLick: () => store.dispatch({ type: 'DECAY_NOTE', note: 'FA-24' }) })
  }
  if (notes[4]) {
    options.push({ text: 'SO-12', onClick: () => store.dispatch({ type: 'DECAY_NOTE', note: 'SO-12' }) })
  }
  if (notes[5]) {
    options.push({ text: 'LA-6', onClick: () => store.dispatch({ type: 'DECAY_NOTE', note: 'LA-6' }) })
  }
  showModal({ title, body, options })
}

const decayImpression = (notes) => {
  if (notes[0] + notes[1] + notes[2] + notes[3] === 0) {
    toast('No impressions to decay')
    return
  }
  const title = 'Decay impression'
  const body = 'Choose which impression to decay:'
  let options = []
  if (notes[0]) {
    options.push({ text: 'DO-48', onClick: () => store.dispatch({ type: 'DECAY_NOTE', note: 'DO-48' }) })
  }
  if (notes[1]) {
    options.push({ text: 'RE-24', onClick: () => store.dispatch({ type: 'DECAY_NOTE', note: 'RE-24' }) })
  }
  if (notes[2]) {
    options.push({ text: 'MI-12', onClick: () => store.dispatch({ type: 'DECAY_NOTE', note: 'MI-12' }) })
  }
  if (notes[3]) {
    options.push({ text: 'FA-6', onClick: () => store.dispatch({ type: 'DECAY_NOTE', note: 'FA-6' }) })
  }
  showModal({ title, body, options })
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
  store.dispatch({ type: 'END_TURN' })
  store.dispatch({ type: 'ROLL_DICE' })
  handleRollOptions()
}
const moveAfterRoll = () => {
  const { position: position_before } = store.getState().board
  const roll_multiplier = 4 - store.getState().ep.num_brains
  const { active } = store.getState().laws
  const asleep = jackDiamonds(active)
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

const gameActions = {
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
  onOptions: () => showModal({
    title: "Title Ho!",
    body: "this a good body",
    options: [
      { text: 'Hi There', onClick: () => { console.log("Chose Hi") } },
      { text: 'Ho Derr', onClick: () => { console.log("Chose Ho") } }
    ]
  }),
  onModal: () => showModal({
    title: 'basic',
    body: "has\nmany\n\nlines"
  }),
  onToast: () => toast("wow it worked 🤔"),
  onRandomLaw: () => store.dispatch({
    type: "ONE_BY_RANDOM",
    roll: store.getState().board.dice.roll()
  }),
  onChooseLaw: (card) => handleChooseLaw(card),
}

export default {
  store,
  gameActions
}
