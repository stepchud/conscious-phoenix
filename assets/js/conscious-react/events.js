import { toast } from 'react-toastify'

import store from './reducers/store'
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
import { OfferAstralBody, OfferTakeCard } from './components/custom_modal'
import {
  BOARD_SPACES,
  LAST_SPACE,
  Dice,
  getPlayerId,
  getPlayerName,
  getOtherPlayers,
  noop
} from './constants'

const dispatchShowModal = (props) => store.dispatch(actions.showModal(props))
const promiseShowModal = (props) => {
  return new Promise((resolve, reject) => {
    const modalProps = Object.assign({}, props, { onResolve: resolve })
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
const presentEvent = (event, channel) => {
  const pid = getPlayerId()
  switch(event) {
    case 'DEPUTY-STEWARD':
      const { school_type } = store.getState().ep
      store.dispatch({ type: 'FOUND_SCHOOL', school_type, pid, channel })
      break
    case 'STEWARD':
      store.dispatch({ type: 'ATTAIN_STEWARD', pid, channel })
      break
    case 'MASTER':
      store.dispatch({ type: 'ATTAIN_MASTER', pid, channel })
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
        pid,
        channel,
        logEvent: 'Died with Kesdjan body',
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
        pid,
        channel,
        logEvent: 'Died with Mental body',
        onClick: () => {
          store.dispatch({ type: 'END_TURN' })
          store.dispatch({ type: 'END_DEATH' })
        }
      })
      break
    case 'REINCARNATE': {
      store.dispatch({ type: 'REINCARNATE' })
      const { num_brains } = store.getState().ep
      const message = `Reincarnated as a ${num_brains}-brained being.`
      dispatchShowModal({
        title: 'Reincarnated',
        body: `${message}. Each roll multiplies by ${4-num_brains}.`,
        pid,
        channel,
        logEvent: message,
        onClick: noop,
      })
      break
    }
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

const presentShock = async (shock) => {
  switch(shock) {
    case 'SELF-REMEMBER':
      store.dispatch({type: 'SELF_REMEMBER'})
      break
    case 'TRANSFORM-EMOTIONS':
      store.dispatch({type: 'TRANSFORM_EMOTIONS'})
      break
    case 'WILD-SHOCK':
      await promiseShowModal({
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
      await promiseShowModal({
        title: 'All Shocks',
        body: 'All shocks are felt in your being.',
        options: [
          { text: 'OK', onClick: dispatchWithExtras({type: 'ALL_SHOCKS'}) },
        ]
      })
      break
  }
}

const startCausalDeath = () => {
  const six = Dice()
  const roll1 = six.roll()
  const roll2 = six.roll()
  let planet
  if (roll1 == 6) {
    if (roll1 == roll2) {
      planet = 'ETERNAL-RETRIBUTION'
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
        title: 'Lucky DOG',
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
  let extra = store.getState().fd.extras[0]
  while(extra) {
    store.dispatch({ type: 'CONSUME_EXTRA' })
    await presentExtra(extra)
    extra = store.getState().fd.extras[0]
  }
  if (entering(store.getState().fd.enter)) {
    await advanceFood()
  }
}

const dispatchWithExtras = (action) => async () => {
  store.dispatch(action)
  await handleExtras()
}

const advanceFood = dispatchWithExtras({ type: 'ADVANCE_FOOD_DIAGRAM' })

const rollOptionLaws = async (roll, active, rollSpace, oppositeSpace) => {
  if (!queenHearts(active) && !tenSpades(active)) {
    return
  }

  const title = `You rolled a ${roll} (${rollSpace})`
  let body = []
  let options = []

  if (queenHearts(active)) {
    body.push('Use your Queen of Hearts law to take the opposite?')
    options.push({
      text: `Take opposite (${oppositeSpace})`,
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
  options.push({ text: 'Not this time', onClick: noop })

  await promiseShowModal({
    title,
    body: body.join("\n"),
    options
  })
}

const handlePieces = async (channel, action) => {
  store.dispatch(action)
  const {
    cards: { pieces },
    laws: { active },
  } = store.getState()
  store.dispatch({ type: 'MAKE_PIECES', pieces })
  store.dispatch({ type: 'CLEAR_PIECES' })
  // handle shocks
  for (let shock of store.getState().ep.shocks) {
    await presentShock(shock)
  }
  store.dispatch({ type: 'CLEAR_SHOCKS' })
  // harnel-miaznel
  await advanceFood()
  // handle and log new levels of being
  store.getState().ep.new_levels.forEach(level => presentEvent(level, channel))
  store.dispatch({ type: 'CLEAR_NEW_LEVELS' })
  // check for cleansed hasnamuss
  if (store.getState().ep.pieces[17] > 3 && hasnamuss(active)) {
    presentEvent('CLEANSE-HASNAMUSS', channel)
  }
  handleStartOver()
}

const takePiece = async (position) => {
  const {
    board: { players, spaces },
    fd: { current: { alive } },
  } = store.getState()

  const space = spaces[position]
  switch(space) {
    case 'f':
      await dispatchWithExtras({ type: 'EAT_FOOD' })()
      break;
    case 'F':
      await dispatchWithExtras({ type: 'EAT_FOOD', double: true })()
      store.dispatch({ type: 'REMOVE_DOUBLE_FOOD', position })
      break;
    case 'a':
      await dispatchWithExtras({ type: 'BREATHE_AIR' })()
      break;
    case 'A':
      await dispatchWithExtras({ type: 'BREATHE_AIR', double: true })()
      store.dispatch({ type: 'REMOVE_DOUBLE_FOOD', position })
      break;
    case 'i':
      await dispatchWithExtras({ type: 'TAKE_IMPRESSION' })()
      break;
    case 'I':
      await dispatchWithExtras({ type: 'TAKE_IMPRESSION', double: true })()
      store.dispatch({ type: 'REMOVE_DOUBLE_FOOD', position })
      break;
    case 'c':
      if (alive) {
        store.dispatch({ type: 'DRAW_CARD' })
      } else {
        await handleDecay()
      }
      break;
    case 'l':
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

const handleOfferAstral = (channel) => async ({ pid, astral }) => {
  const title = 'Astral Offered'
  const body = OfferAstralBody(astral)
  const options = [
    { text: 'Yes', onClick: () => channel.push('game:choose_astral', { pid, replace: true }) },
    { text: 'No', onClick: () => channel.push('game:choose_astral', { pid, replace: false }) }
  ]

  await promiseShowModal({ title, body, options })
}

const handleOfferTakeCard = (channel) => async ({ player, board: { players } }) => {
  const { pid, take_cards } = player
  const opid = take_cards[0]
  const victim = getPlayerName(players, opid)
  const clickHandler = () => {
    const optionElem = document.getElementById('take-cards-select')
    channel.push('game:try_to_take_card', { pid, card: optionElem.value })
  }
  await promiseShowModal(OfferTakeCard(pid, victim, clickHandler))
}

const handleDecay = async () => {
  const {
    fd: { current: { food, air, impressions } },
    board: { sides }
  } = store.getState()
  const roll = Dice(sides).roll()

  const rollDiv3 = roll % 3
  if (roll === 0) {
    toast.success("Rolled a zero, decay nothing!")
  } else if (rollDiv3 === 0) {
    await decayImpression(impressions)
  } else if (rollDiv3 === 1) {
    await decayFood(food)
  } else {
    await decayAir(air)
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
    options.push(decayNoteOption('food', 'DO-768'))
  }
  if (notes[1]) {
    options.push(decayNoteOption('food', 'RE-384'))
  }
  if (notes[2]) {
    options.push(decayNoteOption('food', 'MI-192'))
  }
  if (notes[3]) {
    options.push(decayNoteOption('food', 'FA-96'))
  }
  if (notes[4]) {
    options.push(decayNoteOption('food', 'SO-48'))
  }
  if (notes[5]) {
    options.push(decayNoteOption('food', 'LA-24'))
  }
  if (notes[6]) {
    options.push(decayNoteOption('food', 'TI-12'))
  }
  if (notes[7]) {
    options.push(decayNoteOption('food', 'DO-6'))
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
    options.push(decayNoteOption('air', 'DO-192'))
  }
  if (notes[1]) {
    options.push(decayNoteOption('air', 'RE-96'))
  }
  if (notes[2]) {
    options.push(decayNoteOption('air', 'MI-48'))
  }
  if (notes[3]) {
    options.push(decayNoteOption('air', 'FA-24'))
  }
  if (notes[4]) {
    options.push(decayNoteOption('air', 'SO-12'))
  }
  if (notes[5]) {
    options.push(decayNoteOption('air', 'LA-6'))
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
    options.push(decayNoteOption('impression', 'DO-48'))
  }
  if (notes[1]) {
    options.push(decayNoteOption('impression', 'RE-24'))
  }
  if (notes[2]) {
    options.push(decayNoteOption('impression', 'MI-12'))
  }
  if (notes[3]) {
    options.push(decayNoteOption('impression', 'FA-6'))
  }
  await promiseShowModal({ title, body, options })
}

const decayNoteOption = (octave, note) => {
  const {
    fd: { current: { mental } },
    player: { position, direction },
  }  = store.getState()
  return {
    text: note,
    onClick: () => store.dispatch({
      type: 'DECAY_NOTE',
      octave,
      note,
      mental,
      position,
      direction,
    })
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

const handleRollClick = async (roll) => {
  store.dispatch({ type: 'END_TURN' })
  store.dispatch({ type: 'ROLL_DICE', next_roll: roll })

  const {
    player: { position, direction },
    fd: { current: { alive } },
    ep: { num_brains, level_of_being },
    laws: { active },
    board: { spaces, sides },
  } = store.getState()
  let rollSpace, oppositeSpace
  const opposite = Dice(sides).opposite(roll)
  if (direction > 0) {
    rollSpace = (position + roll) > LAST_SPACE
      ? '*' : spaces.charAt(position + roll)
    oppositeSpace = (position + opposite) > LAST_SPACE
      ? '*' : spaces.charAt(position + opposite)
  } else {
    rollSpace = (position - roll) < 0
      ? '*' : spaces.charAt(position - roll)
    oppositeSpace = (position - opposite) < 0
      ? '*' : spaces.charAt(position - opposite)
  }

  let asleep = jackDiamonds(active)
  // HASNAMUSS: no roll-options
  if (!asleep && !hasnamuss(active)) {
    const title = `You rolled ${roll}`
    let options = []
    switch(level_of_being) {
      case  'MASTER':
        options.push({
          text: `Take opposite (${oppositeSpace})`,
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
      options.push({ text: `Take the roll (${rollSpace})`, onClick: noop })
      await promiseShowModal({
        title,
        options
      })
    }
  }
  await rollOptionLaws(roll, active, rollSpace, oppositeSpace)

  const { board: { roll: rollAfterOptions, players } } = store.getState()
  const roll_multiplier = 4 - num_brains
  let next_position = (roll_multiplier * rollAfterOptions) * direction + position
  if (next_position < 0) { next_position = 0 }
  if (next_position > LAST_SPACE) { next_position = LAST_SPACE }
  const other_hasnamuss = getOtherPlayers(players).filter(p => p.position===next_position && p.hasnamuss)
  const same_level_hasnamuss = other_hasnamuss.filter(p => p.level_of_being===level_of_being).length > 0
  store.dispatch({ type: 'MOVE_SPACE', position, next_position, alive, asleep, same_level_hasnamuss })
  // no stuff while asleep or landed on a hasnamuss
  asleep = jackDiamonds(store.getState().laws.active)
  if (!other_hasnamuss.length && !asleep) {
    await takePiece(next_position)
  }
  await handleStartOver()
  store.dispatch({ type: "WAIT_FOR_TURN" })
}

const handleEndDeath = (channel) => () => {
  const {
    fd: { current: { mental } },
    laws: { active },
  } = store.getState()
  presentEvent(deathEvent(mental, hasnamuss(active)), channel)
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
      store.dispatch(actions.startTurn({ pid, active: true }))
      channel.push('game:save_state', { pid, game: store.getState() })
    },
    onGameStartedAfterWait: (pid, active) => {
      store.dispatch(actions.startAfterWait())
      if (active) {
        store.dispatch(actions.startTurn({ pid, active: true, initial: true }))
      }
    },
    onGameWaited: (pid, name, sides) => {
      store.dispatch(actions.waitGame(name, sides))
      channel.push('game:save_state', { pid, game: store.getState() })
    },
    onGameJoined: (pid, state) => {
      store.dispatch(actions.joinGame(state))
      channel.push('game:save_state', { pid, game: store.getState() })
    },
    onPlayerJoined: (game) => {
      store.dispatch(actions.updateGame({ board: game.board, log: game.log }))
    },
    onTurnStarted: (payload) => store.dispatch(actions.startTurn(payload)),
    onSaveGame: (pid, modalProps) => {
      dispatchShowModal(modalProps)
      channel.push('game:save_state', { pid, game: store.getState() })
    },
    onUpdateGame: (payload) => store.dispatch(actions.updateGame(payload)),
    onResetGame: () => store.dispatch(actions.resetGame()),
    onUpdateModal: (props) => store.dispatch(actions.updateModal(props)),
    onEventLog: (event) => store.dispatch(actions.logEvent(event)),
    onShowModal: () => {
      const modalProps = store.getState().modal
      dispatchShowModal(modalProps)
    },
    onHideModal: () => store.dispatch(actions.hideModal()),
    onExchangeDuplicates: () => store.dispatch(actions.exchangeDupes()),
    onFifthOptions: handleFifthOptions(channel),
    onOfferAstral: handleOfferAstral(channel),
    onOfferTakeCard: handleOfferTakeCard(channel),
    handleRollClick,
    onEndDeath: handleEndDeath(channel),
    handleGameOver,
    onDrawCard: () => store.dispatch({type: 'DRAW_CARD'}),
    onDrawLawCard: () => store.dispatch({ type: 'DRAW_LAW_CARD' }),
    onSelectCard: (card) => store.dispatch({ type: 'SELECT_CARD', card }),
    onSelectLawCard: (card) => store.dispatch({ type: 'SELECT_LAW_CARD', card }),
    onSelectPart: (card) => store.dispatch({ type: 'SELECT_PART', card }),
    onPlaySelected: (cards, lawCards) => handlePieces(channel, {
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
    onCombineSelectedParts: (selected) => handlePieces(channel, { type: 'COMBINE_PARTS', selected }),
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
