import React from 'react'
import { map } from 'lodash'

import { combinable, playable, selectedCards } from '../reducers/cards'
import {
  jackDiamonds,
  jackHearts,
  selectedLaws,
  selectedPlayedLaws,
} from '../reducers/laws'
import { selectedParts } from '../reducers/being'
import Dice from './dice'
import { TURNS, getPlayerName } from '../constants'


export const TurnMessage = ({ turn, hasLaws, waiting, deathTurn, gameOver }) => {
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
    message = 'Select 7 cards from your hand to keep after death'
  }

  return <div className="turn-message">{message}</div>
}

export const Buttons = ({
  turn,
  waiting,
  cards,
  laws,
  hasLaws,
  ep,
  gameOver,
  deathTurn,
  onRoll,
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
    </div>
  )
}

export const GameMenu = ({
  children
}) =>
  <div className="section actions fixed-nav">
    {children}
  </div>

export const GameInfo = ({
  gid,
  name,
  level_of_being,
  card_plays,
  transforms,
  wild_shock,
  all_shocks,
}) =>
  <ul className="section game-info">
    <li>Game: {gid}</li>
    <li>Name: {name}</li>
    <li>Level: {level_of_being}</li>
    <li>Card Plays: {card_plays}</li>
    <li>Transform: {transforms}</li>
    <li>Wild: {wild_shock}</li>
    <li>All: {all_shocks}</li>
  </ul>


const LogEntry = ({
  pid,
  name,
  entry,
}) =>
  <div className='log-entry' style={{ color: `#${pid}` }}>
    <span className='name'>{name || pid}: </span>
    <span className='log-event'>{entry}</span>
  </div>

export const GameLog = ({
  board,
  entries,
  expanded,
  onToggle,
}) => {
  const cn = expanded ? 'game-log expand' : 'game-log collapse'
  const logEntries = entries.map(
    (entry, index) => <LogEntry key={index} name={getPlayerName(board.players, entry.pid)} {...entry} />
  )

  return (
    <div className={cn}>
      <button onClick={onToggle}>{expanded ? '' : 'View '}Game Log</button>
      <div className='game-events'>
        {logEntries}
      </div>
    </div>
  )
}

export default {
  Buttons,
  GameMenu,
  GameInfo,
  GameLog,
  TurnMessage,
}
