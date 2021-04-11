import React from 'react'

import { useDoubleClick } from '../hooks/useDoubleClick'
import PlayerIcons from './player'


const classMap = {
  '*': 'wild',
  'f': 'food',
  'a': 'air',
  'i': 'impression',
  'c': 'card',
  'l': 'law',
  'd': 'decay',
  'F': 'double food',
  'A': 'double air',
  'I': 'double impression',
}

const PlayerPiece = ({
  pid,
  playerIndex,
  icon,
  moveSpaces,
  onFifthStriving,
}) => {
  const [ callbackRef, _ ] = useDoubleClick(onFifthStriving)
  const IconComponent = PlayerIcons[icon]
  const styleContainer = {
    'top': `${-50 - 24*playerIndex - 15*playerIndex}px`,
    //'left': `${-3*playerIndex}px`,
  }

  return (
    <div ref={callbackRef} className={`player-container bounce bounce--${moveSpaces}`} style={styleContainer} data-pid={pid} >
      <div className={`player move move--${moveSpaces}`}>
        <IconComponent style={{ "fill": `#${pid}` }} />
      </div>
    </div>
  )
}

const Space = ({
  space,
  position,
  players,
  onFifthStriving,
}) => {
  const playersAtIndex = players.filter(p => p.position===position)
  let innerDot
  if (space=='c' || space=='l') {
    innerDot = <div key={`dot-${position}`} className='dot'></div>
  }

  return (
    <li key={`space-${position}`}>
      <div className={`space ${classMap[space]}`}>{innerDot}</div>
      { playersAtIndex.map((player, pIdx) =>
        <PlayerPiece
          key={`player-${pIdx}`}
          pid={player.pid}
          icon={player.icon}
          playerIndex={pIdx}
          moveSpaces={player.moveSpaces}
          onFifthStriving={onFifthStriving}
        />)
      }
    </li>
  )
}

const Board = ({
  spaces,
  players,
  onFifthStriving,
}) => {
  return (
    <div className="section board">
      <h3>Board</h3>
      <ol className="board-spaces">
        {spaces.split('').map(
          (space, index) => <Space key={index} space={space} position={index} players={players} onFifthStriving={onFifthStriving} />
        )}
      </ol>
    </div>
  )
}

export default Board
