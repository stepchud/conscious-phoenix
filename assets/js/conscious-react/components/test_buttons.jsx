import React from 'react'
import { map, some } from 'lodash'

import { combinable, playable, selectedCards } from '../reducers/cards'
import { selectedLaws } from '../reducers/laws'
import { selectedParts } from '../reducers/being'

const TestButtons = ({
  actions,
  parts,
  cards,
  laws
}) => {
  const selCards = selectedCards(cards)
  const selLaws = selectedLaws(laws.in_play)
  const selParts = selectedParts(parts)
  const selLawCards = map(selLaws, 'c.card')
  return (
    <div className="actions">
      <button onClick={actions.onDrawCard}>Draw Card</button>
      <button onClick={actions.onDrawLawCard}>Draw Law Card</button>
      <button onClick={actions.onEatFood}>Food</button>
      <button onClick={actions.onBreatheAir}>Air</button>
      <button onClick={actions.onTakeImpression}>Impression</button>
      <button onClick={actions.onAdvanceFoodDiagram}>Digest Food</button>
      <button onClick={actions.onSelfRemember}>Self-Remember</button>
      <button onClick={actions.onTransformEmotions}>Transform Emotion</button>
      <button onClick={actions.onDying}>Die!</button>
      { combinable(selParts) &&
        <button onClick={() => { actions.onCombineSelectedParts(selParts)} }>Combine Parts</button> }
      { playable(selCards.concat(selLawCards)) && !some(selLaws, 'played') &&
        <button onClick={() => { actions.onPlaySelected(selCards, selLaws)} }>Play Cards</button> }
      { selectedLaws(laws.in_play).length===1 &&
        <button onClick={actions.onObeyLaw}>Obey Law</button> }
    </div>
  )
}
export default TestButtons
