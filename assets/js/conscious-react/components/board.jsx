import React from 'react'
import { useDoubleClick } from '../hooks/useDoubleClick'

const classMap = {
  '*': 'wild',
  'F': 'food',
  'A': 'air',
  'I': 'impression',
  'C': 'card',
  'L': 'law',
  'D': 'decay',
}

const PlayerSpace = ({
  pid,
  pIdx,
  onFifthStriving,
}) => {
  const [ callbackRef, _ ] = useDoubleClick(onFifthStriving)
  const style = { top: `${-3 * (pIdx+1)}px`, "backgroundColor": `#${pid}` }
  return <span ref={callbackRef} className="player" style={style} ></span>
}

const Space = ({
  space,
  index,
  players,
  onFifthStriving,
}) => {
  const playersAtIndex = players.filter(p => p.position===index)

  return (
    <span key={`space-wrap-${index}`} className="space-wrap">
      <span key={`space-${index}`} className={`${classMap[space]}`}></span>
      { playersAtIndex.map((player, pIdx) =>
        <PlayerSpace
          key={`player-${index}-${pIdx}`}
          pid={player.pid}
          pIdx={pIdx}
          onFifthStriving={onFifthStriving}
        />)
      }
    </span>
  )
}

const Board = ({
  spaces,
  players,
  onFifthStriving,
}) => {
  const spacesElements = spaces.split('').map(
    (space, index) => <Space key={index} space={space} index={index} players={players} onFifthStriving={onFifthStriving} />
  )
  return (
    <div className="section board">
      <h3>Board</h3>
      {spacesElements}
    </div>
  )
}

export default Board
