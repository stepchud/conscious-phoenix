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
  const cardsPlay =
    selCards.length <= ep.card_plays &&
    playable(selCards.concat(selLawCards)) &&
    !selectedPlayedLaws(laws.in_play).length

  const buttons = []
  if (currentTurn===TURNS.randomLaw) {
    buttons.push(<button key={buttons.length} onClick={() => { actions.onRandomLaw() }}>One by random...</button>)
  } else if (currentTurn===TURNS.choiceLaw) {
    buttons.push(<span key={buttons.length}>Pick a law card:</span>)
  } else {
    if (unobeyedLaws(laws.in_play).length) {
      buttons.push(<span key={buttons.length}>* You simply must obey all of the laws in play</span>)
    } else if (currentTurn===TURNS.death) {
      buttons.push(<button key={buttons.length} onClick={actions.onEndDeath}>End Death</button>)
      buttons.push(<span key={buttons.length}>** Select up to 7 cards from your hand to keep first</span>)
    } else {
      buttons.push(<button key={buttons.length} onClick={actions.onRollClick}>Roll Dice</button>)
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
      <div className="dice">{roll}</div>
      {buttons}
    </div>
  )
}
export default Buttons
