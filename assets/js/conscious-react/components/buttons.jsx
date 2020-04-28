import React from 'react'
import { map } from 'lodash'

import { combinable, playable, selectedCards } from '../reducers/cards'
import {
  jackDiamonds,
  jackHearts,
  selectedLaws,
  selectedPlayedLaws,
  unobeyedLaws,
} from '../reducers/laws'
import { selectedParts } from '../reducers/being'
import { TURNS } from '../constants'

const Dice = ({
  roll
}) => {
  return <span className="dice">{roll}</span>
}

const Message = ({ turn, hasLaws, waiting }) => {
  let message = ''
  if (waiting) {
    message = "Waiting for your turn..."
  } else if (turn===TURNS.choiceLaw) {
    message = '* Choose a law card from your hand'
  } else if (hasLaws) {
    message = '* You simply must obey all of the laws in play'
  } else if (turn===TURNS.death) {
    message = '* Select up to 7 cards your hand to keep'
  }

  return <span className="turn-message">{message}</span>
}

const Buttons = ({
  actions,
  turn,
  waiting,
  laws,
  cards,
  hasLaws,
  ep,
  onRoll,
}) => {
  if (waiting) { return [] }

  const buttons = []
  const asleep = jackDiamonds(laws.active)
  const nopowers = jackHearts(laws.active)
  const selLaws = selectedLaws(laws.in_play)
  const selCards = selectedCards(cards)
  const selLawCards = map(selLaws, 'c.card')
  const selParts = selectedParts(ep.parts)
  const cardsPlay =
    selCards.length <= ep.card_plays &&
    playable(selCards.concat(selLawCards)) &&
    !selectedPlayedLaws(laws.in_play).length

  if (turn===TURNS.randomLaw) {
    buttons.push(<button key={buttons.length} onClick={() => { actions.onRandomLaw() }}>One by random...</button>)
  } else {
    if (turn!==TURNS.choiceLaw && !hasLaws) {
      if (turn===TURNS.death) {
        buttons.push(<button key={buttons.length} onClick={actions.onEndDeath}>End Death</button>)
      } else {
        buttons.push(<button key={buttons.length} onClick={onRoll}>Roll Dice</button>)
      }
    }
    if (!asleep && !nopowers && ep[combinable(selParts)]) {
      buttons.push(
        <button
          key={buttons.length}
          onClick={() => { actions.onCombineSelectedParts(selParts)} }>
          Combine Parts
        </button>
      )
    }
    if (!asleep && cardsPlay) {
      buttons.push(
        <button
          key={buttons.length}
          onClick={() => { actions.onPlaySelected(selCards, selLawCards)} }>
          Play Cards
        </button>
      )
    }
    if (selLaws.length===1 && !selLaws[0].obeyed) {
      buttons.push(<button key={buttons.length} onClick={actions.onObeyLaw}>Obey Law</button>)
    }
  }
  return buttons
}

const ButtonRow = ({
  currentTurn: turn,
  roll,
  waiting,
  ...props
}) => {
  if (turn===TURNS.setup) {
    return
  }
  const hasLaws = !!unobeyedLaws(props.laws.in_play).length

  return (
    <div className="section actions fixed-nav">
      <Dice roll={roll} />
      <Buttons hasLaws={hasLaws} turn={turn} waiting={waiting} {...props} />
      <Message turn={turn} hasLaws={hasLaws} waiting={waiting} />
    </div>
  )
}
export default ButtonRow
