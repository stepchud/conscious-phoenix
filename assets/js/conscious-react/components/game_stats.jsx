import React from 'react'

import { getGameId, getPlayerId, getPlayerName } from '../constants'

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

const GameId = ({ gid, pid }) =>
  <div className="section game-id">
    Game: {gid}, Player: {pid}
  </div>


const LogEntry = ({
  pid,
  name,
  entry,
}) =>
  <div className='log-entry' style={{ color: `#${pid}` }}>
    <span className='name'>{name || pid}: </span>
    <span className='log-event'>{entry}</span>
  </div>

const GameLog = ({
  board,
  entries,
  expanded,
  onToggle,
}) => {
  const gid = getGameId()
  const pid = getPlayerId()
  const cn = expanded ? 'game-log expand' : 'game-log collapse'
  const logEntries = entries.map(
    (entry, index) => <LogEntry key={index} name={getPlayerName(board.players, entry.pid)} {...entry} />
  )

  return (
    <div className={cn}>
      <GameId gid={gid} pid={pid} />
      <button onClick={onToggle}>{expanded ? '' : 'View '}Game Log</button>
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
