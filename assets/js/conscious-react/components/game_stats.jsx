import React from 'react'

import { getGameId, getPlayerId } from '../constants'
import { getPlayerName } from '../reducers/board'

const PlayerStats = ({
  name,
  level_of_being,
  card_plays,
  transforms,
  wild_shock,
  all_shocks,
  gid,
}) =>
  <div className="section level-of-being">
    {name},
    Level: {level_of_being},
    Card plays: {card_plays},
    Transform: {transforms},
    Wild: {wild_shock},
    All: {all_shocks}
  </div>

const GameId = () =>
  <div className="section game-id">
    Game: {getGameId()}, Player: {getPlayerId()}
  </div>


const LogEntry = ({
  pid,
  entry,
}) =>
  <div className='log-entry' style={{ color: `#${pid}` }}>
    <span className='name'>{name || pid}:</span>
    <span className='log-event'>{entry}</span>
  </div>

const GameLog = ({
  board,
  entries,
  expanded,
  onToggle,
}) => {
  const cn = expanded ? 'view-log active' : 'view-log'
  const logEntries = entries.map( entry => <LogEntry name={getPlayerName(board, entry.pid)} {...entry} /> )

  return (
    <div>
      <button className={cn} onClick={onToggle}>{expanded ? '' : 'View '}Game Log</button>
      {expanded && <GameId />}
      <div className='game-events'>
        {logEntries}
      </div>
    </div>
  )
}

export {
  PlayerStats,
  GameId,
  GameLog,
}
