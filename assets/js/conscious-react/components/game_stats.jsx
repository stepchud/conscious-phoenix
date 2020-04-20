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

export {
  PlayerStats,
  GameId,
}
