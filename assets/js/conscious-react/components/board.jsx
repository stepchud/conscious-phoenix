import React, { useEffect, useRef, useState } from 'react'

import { BOARD_SPACES, LAST_SPACE } from '../constants'
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

const SPACE_SIZE = 32
const MAX_SCROLL = (BOARD_SPACES.length - 30) * SPACE_SIZE

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
    'top': `${-60 - SPACE_SIZE*playerIndex - 15*playerIndex}px`,
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

const BoardSpaces = ({
  player: { direction },
  players,
  spaces,
  onFifthStriving,
}) => {
  const scrollRef = useRef()
  const timeoutRef = useRef()

  let [ lowestPos, furthestPos ] = [ LAST_SPACE, 0 ]
  if (!!players.length) {
    lowestPos = players.reduce((acc, player) =>  player.position < acc ? player.position : acc, LAST_SPACE)
    furthestPos = players.reduce((acc, player) =>  player.position > acc ? player.position : acc, 0)
  }

  // Scroll Right when:
  // player is moving right
  // & lowest is right of scrollPosition + 3 spaces
  // & there is room to scroll right
  // Scroll Left when:
  // player is moving left
  // & furthestPos is left of scrollPosition + 27 spaces
  // & there is room to scroll left
  const slowScroll = (scrollPosition) => {
    if (scrollPosition < 0 || scrollPosition > MAX_SCROLL) { return }

    const diff = scrollPosition - scrollRef.current.scrollLeft
    const absDiff = Math.abs(diff)
    let step = 0
    if (absDiff < 2) {
      step = diff
    } else if (diff > 0) {
      step = Math.log2(absDiff)
    } else if (diff < 0) {
      step = -1 * Math.log2(absDiff)
    }

    if (step != 0) {
      scrollRef.current.scrollLeft += step
      timeoutRef.current = setTimeout(slowScroll, 10, scrollPosition)
    }
  }

  useEffect(() => {
    let scrollTo = 0
    if (direction > 0 && lowestPos > 3) {
      if (lowestPos < LAST_SPACE - 27) {
        scrollTo = (lowestPos - 3) * SPACE_SIZE
      } else {
        scrollTo = MAX_SCROLL
      }
    } else if (direction < 0 && furthestPos < LAST_SPACE - 3) {
      if (furthestPos > 27) {
        scrollTo = (furthestPos - 27) * SPACE_SIZE
      } else {
        scrollTo = 0
      }
    } else if (direction < 0) {
      scrollTo = MAX_SCROLL
    }
    //console.log(`${direction}, ${lowestPos}, ${furthestPos}, ${scrollTo}`)
    timeoutRef.current = !!players && setTimeout(slowScroll, 10, scrollTo)
    return () => { clearTimeout(timeoutRef.current) }
  }, [direction, lowestPos, furthestPos])

  return (
    <ol ref={scrollRef} className="board-spaces">
      {spaces.split('').map(
        (space, index) => <Space key={index} space={space} position={index} players={players} onFifthStriving={onFifthStriving} />
      )}
    </ol>
  )
}

const Board = ({
  ...props
}) => (
  <div className="section board">
    <h3>Board</h3>
    <BoardSpaces {...props} />
  </div>
)

export default Board
