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

const DiceEntities = [ '⚀', '⚁', '⚂', '⚃', '⚄', '⚅' ]
const Dice = ({
  roll
}) => {
  const entity = DiceEntities[roll-1] || DiceEntities[0]
  return <span className="dice">{entity}</span>
}

const Buttons = ({
  actions,
  roll,
  ep,
  cards,
  laws,
  currentTurn }) => {
  const asleep = jackDiamonds(laws.active)
  const nopowers = jackHearts(laws.active)
  const selCards = selectedCards(cards)
  const selLaws = selectedLaws(laws.in_play)
  const selLawCards = map(selLaws, 'c.card')
  const selParts = selectedParts(ep.parts)
  const hasUnobeyedLaws = !!unobeyedLaws(laws.in_play).length
  const cardsPlay =
    selCards.length <= ep.card_plays &&
    playable(selCards.concat(selLawCards)) &&
    !selectedPlayedLaws(laws.in_play).length
  const message = currentTurn===TURNS.choiceLaw
    ? '* Choose a law card from your hand'
    : hasUnobeyedLaws
      ? '* You simply must obey all of the laws in play'
      : currentTurn===TURNS.death
        ? '* Select up to 7 cards your hand to keep'
        : ''

  const buttons = []
  if (currentTurn===TURNS.randomLaw) {
    buttons.push(<button key={buttons.length} onClick={() => { actions.onRandomLaw() }}>One by random...</button>)
  } else {
    if (currentTurn!==TURNS.choiceLaw && !hasUnobeyedLaws) {
      if (currentTurn===TURNS.death) {
        buttons.push(<button key={buttons.length} onClick={actions.onEndDeath}>End Death</button>)
      } else {
        buttons.push(<button key={buttons.length} onClick={actions.onRollClick}>Roll Dice</button>)
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

  return (
    <div className="section actions">
      <Dice roll={roll} />
      {buttons}
      <div className="turn-message">{message}</div>
    </div>
  )
}
export default Buttons
