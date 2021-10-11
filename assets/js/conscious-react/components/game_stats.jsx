import React, { useMemo, useState } from 'react'
import { map } from 'lodash'

import { combinable, playable, selectedCards } from '../reducers/cards'
import {
  jackDiamonds,
  jackHearts,
  selectedLaws,
  selectedPlayedLaws,
} from '../reducers/laws'
import { selectedParts } from '../reducers/being'
import { TURNS, getPlayerName } from '../constants'


export const TurnMessage = ({ turn, hasLaws, waiting, deathTurn, gameOver }) => {
  let message = ''
  if (waiting) {
    message = "Waiting for your turn..."
  } else if (turn===TURNS.randomLaw) {
    message = 'Draw a random law card from your hand'
  } else if (turn===TURNS.choiceLaw) {
    message = 'Click to choose a law card from your hand'
  } else if (hasLaws) {
    message = 'You simply must obey all of the laws in play'
  } else if (gameOver) {
    message = '💀 Last chance to survive the shock of death 💀 '
  } else if (deathTurn) {
    message = 'Select 7 cards from your hand to keep after death'
  }

  return (
    message.length > 0
      ? <div className="turn-message">{message}</div>
      : null
  )
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
  onObeyLaw,
  onCombineSelectedParts,
  onPlaySelected,
  onSaveShareGame,
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
      buttons.push(<button key={buttons.length} onClick={onSaveShareGame}>Save / Share Game</button>)
      break;
  }

  return (
    <div className="buttons-container">
      {buttons}
    </div>
  )
}

export const GameInfo = ({
  gid,
  name,
  message,
  navRef,
  level_of_being,
  card_plays,
  transforms,
  wild_shock,
  all_shocks,
}) => {
  // collapsible
  const [ expanded, setExpanded ] = useState(false)
  const onToggle = () => setExpanded(!expanded)
  const cnBtn = expanded ? 'collapsible btn active' : 'collapsible btn'
  const cnContent = expanded ? 'collapsible content active' : 'collapsible content'

  let sectionStyle = { paddingTop: "110px" }
  if (navRef && navRef.current) {
    const { height } = navRef.current.getBoundingClientRect()
    sectionStyle.paddingTop = (height + 5) + "px"
  }

  return (
    <div style={sectionStyle} className="section game-info">
      <button className={cnBtn} onClick={onToggle}>Game Info</button>
      <div className={cnContent}>
        {message}
        <div className="game-stats">
          <dl>
            <dt>Game:</dt><dd>{gid}</dd>
            <dt>Name:</dt><dd>{name}</dd>
            <dt>Level:</dt><dd>{level_of_being}</dd>
          </dl>
          <dl>
            <dt>Card Plays:</dt><dd>{card_plays}</dd>
            <dt>Transform:</dt><dd>{transforms}</dd>
            <dt>Wild:</dt><dd>{wild_shock}</dd>
            <dt>All:</dt><dd>{all_shocks}</dd>
          </dl>
        </div>
      </div>
    </div>
  )
}


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
}) => {
  // collapsible
  const [ expanded, setExpanded ] = useState(false)
  const onToggle = () => setExpanded(!expanded)
  const cnBtn = expanded ? 'collapsible btn active' : 'collapsible btn'
  const cnContent = expanded ? 'collapsible content active' : 'collapsible content'

  const logEntries = useMemo(() => {
    return entries.map((entry, index) => <LogEntry key={index} name={getPlayerName(board.players, entry.pid)} {...entry} />)
  }, [entries])

  return (
    <div className='game-log'>
      <button className={cnBtn} onClick={onToggle}>Game Log</button>
      <div className={cnContent}>
        {logEntries}
      </div>
    </div>
  )
}

export default {
  Buttons,
  GameInfo,
  GameLog,
  TurnMessage,
}
