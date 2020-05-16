import React from 'react'

const classMap = {
  '*': 'wild',
  'F': 'food',
  'A': 'air',
  'I': 'impression',
  'C': 'card',
  'L': 'law',
  'D': 'decay',
}

const Space = ({
  space,
  index,
  players
}) => {
  const playersAtIndex = players.filter(p => p.position===index)

  return (
    <span key={`space-wrap-${index}`} className="space-wrap">
      <span key={`space-${index}`} className={`${classMap[space]}`}></span>
      { playersAtIndex.map(
        (player, pIdx) =>
        <span key={`player-${index}-${pIdx}`} className="player" style={{top: `${-3 * (pIdx+1)}px`, "backgroundColor": `#${player.pid}`}}></span>
        )
      }
    </span>
  )
}

const Board = ({
  spaces,
  players,
}) => {
  const spacesElements = spaces.split('').map(
    (space, index) => <Space key={index} space={space} index={index} players={players} />
  )
  return (
    <div className="section board">
      <h3>Board</h3>
      {spacesElements}
    </div>
  )
}

export default Board
