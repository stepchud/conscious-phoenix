import React from 'react'

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

const GameId = ({ gameId, playerId }) =>
  <div className="section game-id">
    Game: {gameId}, Player: {playerId}
  </div>


const LogEntry = ({
  name,
  text,
  color,
}) =>
  <div className='log-entry' style={{ color: `#${color}` }}>
    <span className='name'>{name}:</span>
    <span className='log-event'>{text}</span>
  </div>

const GameLog = ({
  entries,
  expanded,
  onToggle,
}) => {
  const cn = expanded ? 'view-log active' : 'view-log'
  return (
    <div>
      <button className={cn} onClick={onToggle}>{expanded ? '' : 'View '}Game Log</button>
      <div className='game-events'>
        {entries.map(e => <LogEntry {...e} />)}
      </div>
    </div>
  )
}

export {
  PlayerStats,
  GameId,
  GameLog,
}
