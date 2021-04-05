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
import Dice from './dice'
import { TURNS } from '../constants'

const Message = ({ turn, hasLaws, waiting, deathTurn, gameOver }) => {
  let message = ''
  if (waiting) {
    message = "Waiting for your turn..."
  } else if (turn===TURNS.choiceLaw) {
    message = 'One by Choice: pick a law card from your pile'
  } else if (hasLaws) {
    message = 'You simply must obey all of the laws in play'
  } else if (gameOver) {
    message = '💀 Last chance to survive the shock of death 💀 '
  } else if (deathTurn) {
    message = '* Before dying, select 7 cards to keep after death'
  }

  return <span className="turn-message">{message}</span>
}

const ButtonItems = ({
  turn,
  waiting,
  laws,
  cards,
  hasLaws,
  ep,
  onRoll,
  gameOver,
  deathTurn,
  onObeyLaw,
  onCombineSelectedParts,
  onPlaySelected,
  onGameOver,
  onRandomLaw,
  onEndDeath,
  onExit
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

  switch(turn) {
    case TURNS.randomLaw:
      buttons.push(<button key={'rand'} onClick={onRandomLaw}>One by random...</button>)
      break;
    case TURNS.end:
      buttons.push(<button key={'end'} onClick={onExit}>Exit Game</button>)
      break;
    default:
      if (deathTurn) {
        const deathButton = gameOver
          ? <button key={buttons.length} onClick={onGameOver}>End Game</button>
          : <button key={buttons.length} onClick={onEndDeath}>End Death</button>
        buttons.push(deathButton)
      } else if (turn!==TURNS.choiceLaw && !hasLaws) {
        buttons.push(<button key={buttons.length} onClick={onRoll}>Roll Dice</button>)
      }
      if (!asleep && !nopowers && ep[combinable(selParts)]) {
        buttons.push(
          <button
            key={buttons.length}
            onClick={() => { onCombineSelectedParts(selParts) }}>
            Combine Parts
          </button>
        )
      }
      if (!asleep && cardsPlay) {
        buttons.push(
          <button
            key={buttons.length}
            onClick={() => { onPlaySelected(selCards, selLawCards)} }>
            Play Cards
          </button>
        )
      }
      if (selLaws.length===1 && !selLaws[0].obeyed) {
        buttons.push(<button key={buttons.length} onClick={onObeyLaw}>Obey Law</button>)
      }
      break;
  }

  return (
    <div className="buttons-container">
      {buttons}
      <Message turn={turn} hasLaws={hasLaws} waiting={waiting} deathTurn={deathTurn} gameOver={gameOver} />
    </div>
  )
}

const GameMenu = ({
  currentTurn: turn,
  laws,
  roll,
  animateRoll,
  ...props
}) => {
  const hasLaws = !!unobeyedLaws(laws.in_play).length

  return <div className="section actions fixed-nav">
    <Dice roll={roll} animateRoll={animateRoll} />
    <ButtonItems
      turn={turn}
      laws={laws}
      hasLaws={hasLaws}
      {...props} />
    <GameInfo gid={gid} pid={pid} {...rest} />
  </div>
}
export default GameMenu
