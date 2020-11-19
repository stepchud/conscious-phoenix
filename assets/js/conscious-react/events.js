import { toast } from 'react-toastify'

import store from './redux_store'
import actions from './actions'
import { makeFaceCard } from './reducers/cards'
import {
  hasnamuss,
  jackDiamonds,
  jackClubs,
  queenHearts,
  tenSpades,
  cantChooseLaw,
} from './reducers/laws'
import { entering, deathEvent, allNotes } from './reducers/food_diagram'
import { BOARD_SPACES, LAST_SPACE, Dice, getPlayerName, noop } from './constants'

const dispatchShowModal = (props) => store.dispatch(actions.showModal(props))
const promiseShowModal = (props) => {
  return new Promise((resolve, reject) => {
    const modalProps = Object.assign({}, props, { onResolve: resolve })
    const show = actions.showModal(modalProps)
    dispatchShowModal(modalProps)
  })
}

const presentExtra = async (extra) => {
  const active = store.getState().laws.active
  const asleep = jackDiamonds(active)
  const noskills = jackClubs(active)

  switch(extra) {
    case 'EXTRA-IMPRESSION':
      await promiseShowModal({
        title: 'Extra Impression',
        body: 'Draw a card or take it back in as Air.',
        options: [
          { text: 'Draw Card', onClick: () => store.dispatch({type: 'DRAW_CARD'}) },
          { text: 'Breathe Air', onClick: () => store.dispatch({type: 'BREATHE_AIR'}) }
        ]
      })
      break
    case 'EXTRA-AIR':
      await promiseShowModal({
        title: 'Extra Air',
        body: 'Draw a card or take it back in as Food.',
        options: [
          { text: 'Draw Card', onClick: () => store.dispatch({type: 'DRAW_CARD'}) },
          { text: 'Eat Food', onClick: () => store.dispatch({type: 'EAT_FOOD'}) }
        ]
      })
      break
    case 'EXTRA-FOOD':
      await promiseShowModal({
        title: 'Extra Food',
        body: 'Extra food chip, draw a card.',
        onClick: () => store.dispatch({type: 'DRAW_CARD'})
      })
      break
    case 'SHOCKS-FOOD':
      store.dispatch({type: 'SHOCKS_FOOD'})
      break
    case 'SHOCKS-AIR':
      store.dispatch({type: 'SHOCKS_AIR'})
      break
    case 'C-12':
      await promiseShowModal({
        title: 'Higher 12',
        body: 'Draw a card by "Higher-12"',
        onClick: () => store.dispatch({type: 'DRAW_CARD'})
      })
      break
    case 'LA-24':
    case 'RE-24':
      toast.warn('No 6')
      break
    case 'SO-48':
      toast.warn('No 12')
      break
    case 'MI-48':
      if (!asleep && !noskills && store.getState().ep.ewb) {
        await promiseShowModal({
          title: 'Eat when you breathe?',
          body: 'Use your skills to shock Mi-48 to Fa-24?',
          options: [
            { text: 'Yes', onClick: dispatchWithExtras({type: 'EAT_WHEN_YOU_BREATHE'}) },
            { text: 'No', onClick: () => store.dispatch({type: 'LEAVE_MI_48'}) }
          ]
        })
      } else {
        store.dispatch({type: 'LEAVE_MI_48'})
      }
      break
    case 'DO-48':
      if (!asleep && !noskills && store.getState().ep.c12) {
        await promiseShowModal({
          title: 'Carbon-12?',
          body: 'Use your skills to shock Do-48 to Re-24?',
          options: [
            { text: 'Yes', onClick: dispatchWithExtras({type: 'CARBON_12'}) },
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
        await promiseShowModal({
          title: 'Breathe when you eat?',
          body: 'Use your skills to shock Mi-192 to Fa-96?',
          options: [
            { text: 'Yes', onClick: dispatchWithExtras({type: 'BREATHE_WHEN_YOU_EAT'}) },
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
    case 'ASTRAL-BODY':
      store.dispatch({ type: 'ASTRAL_BODY' })
      break
    case 'MENTAL-BODY':
      store.dispatch({ type: 'MENTAL_BODY' })
      break
    default:
      console.warn(`present unknown extra: ${extra}`)
  }
  console.log("[END] presentExtra "+extra)
}

// NOTE: keep synchronous
const presentEvent = (event) => {
  switch(event) {
    case 'DEPUTY-STEWARD':
      const { school_type } = store.getState().ep
			store.dispatch({ type: 'FOUND_SCHOOL', school_type })
      break
    case 'STEWARD':
      store.dispatch({ type: 'ATTAIN_STEWARD' })
      break
    case 'MASTER':
      store.dispatch({ type: 'ATTAIN_MASTER' })
      break
    case 'SELF-REMEMBER':
      store.dispatch({type: 'SELF_REMEMBER'})
      break
    case 'TRANSFORM-EMOTIONS':
      store.dispatch({type: 'TRANSFORM_EMOTIONS'})
      break
    case 'WILD-SHOCK':
      dispatchShowModal({
        title: 'Wild Shock',
        body: 'A wild shock appears! Which will it be?',
        options: [
          { text: 'Transform Emotions', onClick: dispatchWithExtras({type: 'TRANSFORM_EMOTIONS'}) },
          { text: 'Self Remember',      onClick: dispatchWithExtras({type: 'SELF_REMEMBER'}) },
          { text: 'Shock Food',         onClick: dispatchWithExtras({type: 'SHOCKS_FOOD'}) },
        ]
      })
      break
    case 'ALL-SHOCKS':
      dispatchShowModal({
        title: 'All Shocks',
        body: 'All shocks are felt in your being.',
        onClick: () => {
          Promise.all(
            dispatchWithExtras({type: 'TRANSFORM_EMOTIONS'}),
            dispatchWithExtras({type: 'SELF_REMEMBER'}),
            dispatchWithExtras({type: 'SHOCKS_FOOD'})
          )
        }
      })
      break
    case 'CANT-CHOOSE-DEATH':
      dispatchShowModal({
        title: "Can't choose death",
        body: "You can't choose death when there are other options available.",
        onClick: noop,
      })
      break
    case 'CANT-CHOOSE-HASNAMUSS':
      dispatchShowModal({
        title: "Can't choose hasnamuss",
        body: "You can't choose hasnamuss when there are other non-death options available.",
        onClick: noop,
      })
      break
    case 'ASTRAL-DEATH':
      dispatchShowModal({
        title: 'You are dead',
        body: 'With Kesdjan-body you can complete one roundtrip of the board before you perish for good.',
        onClick: () => {
          store.dispatch({ type: 'END_TURN' })
          store.dispatch({ type: 'END_DEATH' })
        }
      })
      break
    case 'MENTAL-DEATH':
      dispatchShowModal({
        title: 'You are dead',
        body: 'With Mental body you are beyond the reach of death. Play on until you complete yourself.',
        onClick: () => {
          store.dispatch({ type: 'END_TURN' })
          store.dispatch({ type: 'END_DEATH' })
        }
      })
      break
    case 'REINCARNATE':
      store.dispatch({ type: 'REINCARNATE' })
      const { num_brains } = store.getState().ep
      dispatchShowModal({
        title: 'Reincarnated',
        body: `You reincarnated as a ${num_brains}-brained being. Each roll multiplies by ${4-num_brains}.`,
        onClick: noop,
      })
      break
    case 'CAUSAL-DEATH':
      startCausalDeath()
      break
    case 'CLEANSE-HASNAMUSS':
      dispatchShowModal({
        title: 'Hasnamuss Cleansed!',
        body: 'Congratulations, you cleansed yourself from being a Hasnamuss!',
        onClick: () => store.dispatch({ type: 'CLEANSE_JOKER', take_piece: true })
      })
      break
    default:
      console.warn(`present unknown event: ${event}`)
  }
}

const startCausalDeath = () => {
  const six = Dice()
  const roll1 = six.roll()
  const roll2 = six.roll()
  let planet = 'ETERNAL-RETRIBUTION'
  if (roll1 == 6) {
    if (roll1 == roll2) {
      dispatchShowModal({
        title: 'Eternal retribution!',
        body: "There is no escape from this loathesome place. You are out of the game backwards.",
        onClick: () => store.dispatch({ type: 'GAME_OVER' }),
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
      dispatchShowModal({
        title: 'Lucky Dog',
        body: `You're automatically cleansed by rolling double ${roll1}! `+
          `You can continue playing until you complete yourself.`,
        onClick: () => {
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
  dispatchShowModal({
    title: 'Hasnamuss planet',
    body: `The planet of your Hasnamuss is called ${planet}.`,
    onClick: () => {
      store.dispatch({ type: 'CAUSAL_DEATH', planet })
      store.dispatch({ type: 'END_TURN' })
      store.dispatch({ type: 'END_DEATH' })
    }
  })
}

const handleExtras = async () => {
  await Promise.all(store.getState().fd.extras.map(presentExtra))
  store.dispatch({ type: 'CLEAR_EXTRAS' })
  if (entering(store.getState().fd.enter)) {
    await advanceFood()
  }
}

const dispatchWithExtras = (action) => async () => {
  store.dispatch(action)
  await handleExtras()
}

const advanceFood = dispatchWithExtras({ type: 'ADVANCE_FOOD_DIAGRAM' })

const rollOptionLaws = async (roll, active) => {
  if (!queenHearts(active) && !tenSpades(active)) {
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
      }
    })
  }
  options.push({ text: 'Not this time', onClick: () => {} })

  await promiseShowModal({
    title,
    body: body.join("\n"),
    options
  })
}

const handlePieces = async (action) => {
  store.dispatch(action)
  const {
    cards: { pieces },
    laws: { active },
  } = store.getState()
  store.dispatch({ type: 'MAKE_PIECES', pieces })
  store.dispatch({ type: 'CLEAR_PIECES' })
  // handle shocks
  store.getState().ep.shocks.forEach(shock => presentEvent(shock))
  store.dispatch({ type: 'CLEAR_SHOCKS' })
  // harnel-miaznel
  await advanceFood()
  // handle new levels of being
  store.getState().ep.new_levels.forEach(level => presentEvent(level))
  store.dispatch({ type: 'CLEAR_NEW_LEVELS' })
  // check for cleansed hasnamuss
  if (store.getState().ep.pieces[17] > 3 && hasnamuss(active)) {
    presentEvent('CLEANSE-HASNAMUSS')
  }
  handleStartOver()
}

const takePiece = async (position) => {
  const {
    laws: { active },
    player: { alive },
  } = store.getState()

  // no stuff while asleep
  if (jackDiamonds(active)) { return }

  switch(BOARD_SPACES[position]) {
    case 'F':
      await dispatchWithExtras({ type: 'EAT_FOOD' })()
      break;
    case 'A':
      await dispatchWithExtras({ type: 'BREATHE_AIR' })()
      break;
    case 'I':
      await dispatchWithExtras({ type: 'TAKE_IMPRESSION' })()
      break;
    case 'C':
      if (alive) {
        store.dispatch({ type: 'DRAW_CARD' })
      } else {
        await handleDecay()
      }
      break;
    case 'L':
      if (alive) {
        store.dispatch({ type: 'DRAW_LAW_CARD' })
        store.dispatch({ type: 'MAGNETIC_CENTER_MOMENT' })
        break;
      }
    // NOTE: Dead players fall through to Wild here
    case '*':
      store.dispatch({ type: 'MAGNETIC_CENTER_MOMENT' })
      await promiseShowModal({
        title: 'Wild space!',
        body: 'Take your choice:',
        options: [
          { text: 'Card', onClick: () => store.dispatch({ type: 'DRAW_CARD' }) },
          { text: 'Food',  onClick: dispatchWithExtras({ type: 'EAT_FOOD' }) },
          { text: 'Air', onClick: dispatchWithExtras({ type: 'BREATHE_AIR' }) },
          { text: 'Impression', onClick: dispatchWithExtras({ type: 'TAKE_IMPRESSION' }) }
        ],
      })
      break;
    default:
  }
}

const handleFifthOptions = (channel) => async ({ pid, lower_pid, options: cards }) => {
  debugger
  const { board: { players } } = store.getState()
  const lower = getPlayerName(players, lower_pid)
  const title = 'Fifth Obligolnian Striving'
  const body = `Choose your card to help ${lower} reach the next level`
  const options = cards.map((card) => ({
    text: card["c"],
    onClick: () => channel.push('game:choose_fifth', { pid, lower_pid, card })
  }))

  await promiseShowModal({ title, body, options })
}

const handleDecay = async () => {
  const { fd: { current }, board: { sides } } = store.getState()
  const roll = Dice(sides).roll()

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
      await decayFood(current.food)
      return
    case 'air':
      await decayAir(current.air)
      return
    case 'impression':
      await decayImpression(current.impressions)
      return
  }
}

const decayFood = async (notes) => {
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
    options.push({ text: 'LA-24', onClick: () => store.dispatch({ type: 'DECAY_NOTE', note: 'LA-24' }) })
  }
  if (notes[6]) {
    options.push({ text: 'TI-12', onClick: () => store.dispatch({ type: 'DECAY_NOTE', note: 'TI-12' }) })
  }
  if (notes[7]) {
    options.push({ text: 'DO-6', onClick: () => store.dispatch({ type: 'DECAY_NOTE', note: 'DO-6' }) })
  }
  await promiseShowModal({ title, body, options })
}

const decayAir = async (notes) => {
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
    options.push({ text: 'FA-24', onClick: () => store.dispatch({ type: 'DECAY_NOTE', note: 'FA-24' }) })
  }
  if (notes[4]) {
    options.push({ text: 'SO-12', onClick: () => store.dispatch({ type: 'DECAY_NOTE', note: 'SO-12' }) })
  }
  if (notes[5]) {
    options.push({ text: 'LA-6', onClick: () => store.dispatch({ type: 'DECAY_NOTE', note: 'LA-6' }) })
  }
  await promiseShowModal({ title, body, options })
}

const decayImpression = async (notes) => {
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
  await promiseShowModal({ title, body, options })
}

const handleChooseLaw = (card) => {
  const notAnOption =  cantChooseLaw(store.getState().laws, card)
  if (notAnOption) {
    presentEvent(notAnOption)
  } else {
    store.dispatch({ type: "ONE_BY_CHOICE", card })
  }
}

const handleRandomLaw = () => {
  const roll = Dice(store.getState().board.sides).roll()
  store.dispatch({ type: "ONE_BY_RANDOM", roll })
}
const handleObeyLaw = async () => {
  const { being_type } = store.getState().ep
  store.dispatch({ type: 'OBEY_LAW' })
  for (let lawAction of store.getState().laws.actions) {
    store.dispatch(Object.assign({ being_type }, lawAction))
  }
  store.dispatch({ type: 'CLEAR_ACTIONS' })
  await handleExtras()
  await handleStartOver()
}

const handleRollClick = async () => {
  store.dispatch({ type: 'END_TURN' })
  store.dispatch({ type: 'ROLL_DICE' })

  const {
    player: { position, direction, alive },
    ep: { num_brains, level_of_being },
    laws: { active },
  } = store.getState()
  let roll = store.getState().board.roll

  const asleep = jackDiamonds(active)
  // HASNAMUSS: no roll-options
  if (!asleep && !hasnamuss(active)) {
    let lob = store.getState().ep.level_of_being
    const title = `You rolled ${roll}`
    let options = []
    switch(lob) {
      case  'MASTER':
        options.push({
          text: 'Take opposite',
          onClick: () => {
            store.dispatch({ type: 'TAKE_OPPOSITE' })
          }
        })
        // fall through
      case 'STEWARD':
        options.push({ text: 'Roll again',
          onClick: () => {
            store.dispatch({ type: 'ROLL_DICE' })
          }
        })
      break;
    }

    if (options.length) {
      options.push({ text: 'Take the roll', onClick: () => {} })
      await promiseShowModal({
        title,
        options
      })
    }
    await rollOptionLaws(roll, active)
  }

  roll = store.getState().board.roll
  const roll_multiplier = 4 - num_brains
  let next_position = (roll_multiplier * roll) * direction + position
  if (next_position < 0) { next_position = 0 }
  if (next_position > LAST_SPACE) { next_position = LAST_SPACE }
  store.dispatch({ type: 'MOVE_SPACE', position, next_position, alive, asleep })

  await takePiece(next_position)
  await handleStartOver()
  store.dispatch({ type: "WAIT_FOR_TURN" })
}

const handleEndDeath = () => {
  const {
    fd: { current: { mental } },
    laws: { active },
  } = store.getState()
  presentEvent(deathEvent(mental, hasnamuss(active)))
}

const handleGameOver = () => {
  dispatchShowModal({
    title: 'Game over :(',
    body: 'Nothing else to do but try again.',
    onClick: () => store.dispatch({ type: 'GAME_OVER' }),
  })
}

const handleStartOver = async () => {
  const {
    fd: { current },
    ep: { pieces },
    laws: { active },
  } = store.getState()
  if (pieces[17] > 2 && current.mental && allNotes(current) && !hasnamuss(active)) {
    await promiseShowModal({
      title: 'You are a winner!',
      body: 'Proudly proclaim "I start over!"',
      onClick: noop,
    })
  }
}

export const gameActions = (channel) => {
  return {
    onGameStarted: (pid, name, sides) => {
      store.dispatch(actions.startGame(name, sides))
      channel.push('game:save_state', { pid, game: store.getState() })
    },
    onGameJoined: (pid, state) => {
      store.dispatch(actions.joinGame(state))
      channel.push('game:save_state', { pid, game: store.getState() })
    },
    onGameContinued: (payload) => store.dispatch(actions.updateGame(payload)),
    onTurnStarted: ({ pid }) => store.dispatch(actions.startTurn(pid)),
    onUpdateGame: (payload) => store.dispatch(actions.updateGame(payload)),
    onUpdateModal: (props) => store.dispatch(actions.updateModal(props)),
    onEventLog: (event) => store.dispatch(actions.logEvent(event)),
    onShowModal: () => {
      const modalProps = store.getState().modal
      dispatchShowModal(modalProps)
    },
    onHideModal: () => store.dispatch(actions.hideModal()),
    onExchageDuplicates: () => store.dispatch(actions.exchangeDupes()),
    onFifthOptions: handleFifthOptions(channel),
    handleRollClick,
    handleEndDeath,
    handleGameOver,
    onDrawCard: () => store.dispatch({type: 'DRAW_CARD'}),
    onDrawLawCard: () => store.dispatch({ type: 'DRAW_LAW_CARD' }),
    onSelectCard: (card) => store.dispatch({ type: 'SELECT_CARD', card }),
    onSelectLawCard: (card) => store.dispatch({ type: 'SELECT_LAW_CARD', card }),
    onSelectPart: (card) => store.dispatch({ type: 'SELECT_PART', card }),
    onPlaySelected: (cards, lawCards) => handlePieces({
      type: 'PLAY_SELECTED',
      cards,
      pieces: makeFaceCard(cards.concat(lawCards))
    }),
    handleObeyLaw,
    onEatFood: dispatchWithExtras({ type: 'EAT_FOOD' }),
    onBreatheAir: dispatchWithExtras({ type: 'BREATHE_AIR' }),
    onTakeImpression: dispatchWithExtras({ type: 'TAKE_IMPRESSION' }),
    onSelfRemember: dispatchWithExtras({ type: 'SELF_REMEMBER' }),
    onTransformEmotions: dispatchWithExtras({ type: 'TRANSFORM_EMOTIONS' }),
    onCombineSelectedParts: (selected) => handlePieces({ type: 'COMBINE_PARTS', selected }),
    onAdvanceFoodDiagram: dispatchWithExtras({ type: 'ADVANCE_FOOD_DIAGRAM' }),
    onDying: () => store.dispatch({ type: 'DEATH_NOW' }),
    onToast: (message, level) => {
      const type = level || toast.type.INFO
      toast(message, { type })
    },
    handleRandomLaw,
    handleChooseLaw,
  }
}

export const reduxStore = store
