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

const Dice = ({ roll }) => <span className="dice">{roll}</span>

const Message = ({ turn, hasLaws, waiting, gameOver }) => {
  let message = ''
  if (waiting) {
    message = "Waiting for your turn..."
  } else if (turn===TURNS.choiceLaw) {
    message = 'One by Choice: pick a law card from your pile'
  } else if (hasLaws) {
    message = 'You simply must obey all of the laws in play'
  } else if (gameOver) {
    message = '💀 Last chance to survive the shock of death 💀 '
  } else if (turn===TURNS.death) {
    message = '* Before dying, select 7 cards to keep after death'
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
  gameOver,
  onGameOver,
  onExit
}) => {
  if (waiting) { return [] }

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

  switch(turn) {
    case TURNS.randomLaw:
      return [<button key={'rand'} onClick={() => { actions.onRandomLaw() }}>One by random...</button>]
    case TURNS.end:
      return [<button key={'end'} onClick={onExit}>Exit Game</button>]
    default:
      const buttons = []
      if (turn===TURNS.death) {
        const deathButton = gameOver
          ? <button key={buttons.length} onClick={onGameOver}>End Game</button>
          : <button key={buttons.length} onClick={actions.handleEndDeath}>End Death</button>
        buttons.push(deathButton)
      } else if (turn!==TURNS.choiceLaw && !hasLaws) {
        buttons.push(<button key={buttons.length} onClick={onRoll}>Roll Dice</button>)
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
      return buttons
  }
}

const ButtonRow = ({
  currentTurn: turn,
  laws,
  roll,
  waiting,
  ...props
}) => {
  const hasLaws = !!unobeyedLaws(laws.in_play).length

  return (
    <div className="section actions fixed-nav">
      <Dice roll={roll} />
      <Buttons hasLaws={hasLaws} turn={turn} waiting={waiting} laws={laws} {...props} />
      <Message turn={turn} hasLaws={hasLaws} waiting={waiting} gameOver={props.gameOver} />
    </div>
  )
}
export default ButtonRow
