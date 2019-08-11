import { map, filter } from 'lodash'
import { sameSuit, makeNewPart, combinable } from './cards'
import { LOB, PARTS, sixSides } from '../constants'

const InitialState = {
  num_brains: 3,
  being_type: sixSides.roll(),
  parts: PARTS.map((c) => ({ c, selected: false })),
  pieces: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  shocks: [],
  card_plays: 1,
  transforms: 0,
  wild_shock: 0,
  all_shocks: 0,
  level_of_being: 'MULTIPLICITY',
  new_levels: [],
  bwe: false,
  ewb: false,
  c12: false,
}

const shock = (index) =>
  (index < 12) ?
    'SELF-REMEMBER' :
    (index < 16) ?
      'TRANSFORM-EMOTIONS' :
      (index < 17) ?
        'WILD-SHOCK' : 'ALL-SHOCKS'

const levelOfBeing = (pieces) => {
  const aceSpades = pieces[15] > 0
  let distinctAces = pieces[16] > 1 ? 3 : pieces[16] == 1 ? 2 : 0 // count XJ 'aces'
  if (pieces[14]) { distinctAces += 1 }
  if (pieces[13]) { distinctAces += 1 }
  if (pieces[12]) { distinctAces += 1 }
  if (pieces[17]) {
    return 'MASTER'
  } else if (aceSpades && distinctAces >= 3) {
    return 'STEWARD'
  } else if ((pieces[0] && pieces[1] && pieces[2]) || (pieces[12] > 1) || (pieces[12]==1 && (pieces[0] || pieces[1] || pieces[2])) || // all diamonds
             (pieces[3] && pieces[4] && pieces[5]) || (pieces[13] > 1) || (pieces[13]==1 && (pieces[3] || pieces[4] || pieces[5])) || // all clubs
             (pieces[6] && pieces[7] && pieces[8]) || (pieces[14] > 1) || (pieces[14]==1 && (pieces[6] || pieces[7] || pieces[8])) || // all hearts
             (pieces[9] && pieces[10] && pieces[11]) || (pieces[15] > 1) || (pieces[15]==1 && (pieces[9] || pieces[10] || pieces[11]))) { // all spades
    return 'DEPUTY-STEWARD'
  } else {
    let slyMan = distinctAces
    slyMan += (pieces[1] || pieces[2]) ? 1 : 0
    slyMan += (pieces[4] || pieces[5]) ? 1 : 0
    slyMan += (pieces[7] || pieces[8]) ? 1 : 0
    slyMan += (pieces[10] || pieces[11]) ? 1 : 0
    return slyMan > 2 ? 'DEPUTY-STEWARD' : 'MULTIPLICITY'
  }
}

const numBrains = (roll) => roll == 6 ? 3 : (roll > 3 ? 2 : 1)

const beginTurnState = (lob) => {
  switch(lob) {
    case 'MULTIPLICITY':
      return {
        card_plays: 1,
        transforms: 0,
        wild_shock: 0,
        all_shocks: 0,
        bwe: false,
        ewb: false,
        c12: false,
      }
    case 'DEPUTY-STEWARD':
      return {
        card_plays: 2,
        transforms: 1,
        wild_shock: 0,
        all_shocks: 0,
        bwe: true,
        ewb: false,
        c12: false,
      }
    case 'STEWARD':
      return {
        card_plays: 3,
        transforms: 1,
        wild_shock: 1,
        all_shocks: 0,
        bwe: true,
        ewb: true,
        c12: false,
      }
    case 'MASTER':
      return {
        card_plays: 4,
        transforms: 1,
        wild_shock: 1,
        all_shocks: 1,
        bwe: true,
        ewb: true,
        c12: true,
      }
    default:
      throw('Unknown Level of Being: '+lob)
  }
}

export const selectedParts = (parts) => map(filter(parts.slice(0,17), 'selected'), 'c')

export const rollOptions = (lob) => {
  switch(lob) {
    case 'STEWARD': return ['ROLL_AGAIN']
    case  'MASTER': return ['ROLL_AGAIN', 'OPPOSITE']
    default: return []
  }
}

const ep = (
  state = InitialState,
  action
) => {
  const {
    parts,
    pieces,
    shocks,
    level_of_being,
    card_plays,
  } = state
  switch(action.type) {
    case 'END_TURN':
      return {
        ...state,
        ...beginTurnState(level_of_being)
      }
    case 'PLAY_SELECTED':
      if (!action.pieces) { return state }
      return {
        ...state,
        card_plays: card_plays - action.cards.length,
      }
    case 'EAT_WHEN_YOU_BREATHE':
      return {
        ...state,
        ewb: false,
      }
    case 'BREATHE_WHEN_YOU_EAT':
      return {
        ...state,
        bwe: false,
      }
    case 'CARBON_12':
      return {
        ...state,
        c12: false,
      }
    case 'SELECT_PART':
      if (pieces[action.card]) {
        parts[action.card].selected = !parts[action.card].selected
      }
      return {
        ...state,
        parts
      }
    case 'MAKE_PIECES':
      let i = PARTS.indexOf(action.pieces[0])
      pieces[i] += action.pieces[1]
      shocks.push(shock(i))
      while (pieces[i]>2 && i<PARTS.indexOf('JO')) {
        pieces[i] -= 2 // one goes up, one comes off
        i++
        pieces[i] += 1
        shocks.push(shock(i))
      }
      const new_lob = levelOfBeing(pieces)
      const new_levels = LOB.slice(LOB.indexOf(level_of_being)+1, LOB.indexOf(new_lob)+1)
      return {
        ...state,
        pieces,
        shocks,
        new_levels,
        level_of_being: new_lob,
      }
    case 'COMBINE_PARTS':
      const newPart = makeNewPart(action.selected)
      const combine = combinable(action.selected)
      if (!newPart) { return state }

      const powers = {
        transforms: combine==='transforms' ? state.transforms - 1 : state.transforms,
        wild_shock: combine==='wild_shock' ? state.wild_shock - 1 : state.wild_shock,
        all_shocks: combine==='all_shocks' ? state.all_shocks - 1 : state.all_shocks,
      }
      action.selected.forEach(s => {
        parts[PARTS.indexOf(s)].selected = false
        pieces[PARTS.indexOf(s)] -= 1
      })
      return {
        ...state,
        ...powers,
        pieces,
        parts,
      }
    case 'CLEAR_SHOCKS':
      return {
        ...state,
        shocks: [],
      }
    case 'MAGNETIC_CENTER_MOMENT':
      return {
        ...state,
        card_plays: card_plays + 1,
      }
    case 'FOUND_SCHOOL':
      return {
        ...state,
        card_plays: card_plays + 1,
        transforms: state.transforms + 1,
      }
    case 'ATTAIN_STEWARD':
      return {
        ...state,
        card_plays: card_plays + 1,
        wild_shock: state.wild_shock + 1,
      }
    case 'ATTAIN_MASTER':
      return {
        ...state,
        card_plays: card_plays + 1,
        all_shocks: state.all_shocks + 1,
      }
    case 'CLEAR_NEW_LEVELS':
      return {
        ...state,
        new_levels: []
      }
    case 'REINCARNATE': {
      const roll = sixSides.roll()
      const pieces = state.pieces.slice()
      pieces.fill(0, 0, pieces.length-1)
      return {
        ...state,
        being_type: roll,
        num_brains: numBrains(roll),
        pieces,
      }
    }
    case 'CAUSAL_DEATH': {
      let num_brains
      if (action.planet == 'REMORSE-OF-CONSCIENCE') {
        num_brains = 3
      } else if (action.planet == 'REPENTANCE') {
        num_brains = 2
      } else if (action.planet == 'SELF-REPROACH') {
        num_brains = 1
      } else {
        console.log(`Unknown planet: ${action.planet}`)
      }
      return {
        ...state,
        num_brains,
      }
    }
    case 'CLEANSE_JOKER':
      if (action.take_piece && pieces[17] > 0) {
        pieces[17]--
      }
      return {
        ...state,
        pieces,
      }
    case 'START_GAME':
      return {
        ...state,
        card_plays: card_plays + 1,
      }
    case 'GAME_OVER':
      return {
        ...state,
        game_over: true
      }
    default:
      return state
  }
}
export default ep
