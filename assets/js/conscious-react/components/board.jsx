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
  const boardRef = useRef()
  const timeoutRef = useRef()

  let [ lowestPos, furthestPos ] = [ LAST_SPACE, 0 ]
  if (!!players.length) {
    lowestPos = players.reduce((acc, player) =>  player.position < acc ? player.position : acc, LAST_SPACE)
    furthestPos = players.reduce((acc, player) =>  player.position > acc ? player.position : acc, 0)
  }

  // Scroll Right when:
  // player is moving right
  // & lowest player position is right of scrollPosition + (3 padding spaces for larger screen sizes)
  // & there is room to scroll right
  // Scroll Left when:
  // player is moving left
  // & furthestPos is left of scrollPosition + number of spaces on screen
  // & there is room to scroll left
  const slowScroll = (scrollPosition, maxScroll) => {
    if (scrollPosition < 0 || scrollPosition > maxScroll) { return }

    const diff = scrollPosition - boardRef.current.scrollLeft
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
      boardRef.current.scrollLeft += step
      timeoutRef.current = setTimeout(slowScroll, 10, scrollPosition, maxScroll)
    }
  }

  useEffect(() => {
    let scrollTo = 0
    const boardSpacesWidth = boardRef.current ? boardRef.current.offsetWidth / SPACE_SIZE : 30
    const maxScroll = (BOARD_SPACES.length - boardSpacesWidth) * SPACE_SIZE
    const playerOffset = boardSpacesWidth > 20 ? 3 : 0
    const maxPlayerPos = boardSpacesWidth - playerOffset
    if (direction > 0 && lowestPos > playerOffset) {
      if (lowestPos < LAST_SPACE - maxPlayerPos) {
        scrollTo = (lowestPos - playerOffset) * SPACE_SIZE
      } else {
        scrollTo = maxScroll
      }
    } else if (direction < 0 && furthestPos < LAST_SPACE - playerOffset) {
      if (furthestPos > maxPlayerPos) {
        scrollTo = (furthestPos - maxPlayerPos + 1) * SPACE_SIZE
      } else {
        scrollTo = 0
      }
    } else if (direction < 0) {
      scrollTo = maxScroll
    }
    //console.log(`${direction}, ${lowestPos}, ${furthestPos}, ${scrollTo}`)
    timeoutRef.current = !!players && setTimeout(slowScroll, 10, scrollTo, maxScroll)
    return () => { clearTimeout(timeoutRef.current) }
  }, [direction, lowestPos, furthestPos, boardRef.current])

  return (
    <ol ref={boardRef} className="board-spaces">
      {spaces.split('').map(
        (space, index) => <Space key={index} space={space} position={index} players={players} onFifthStriving={onFifthStriving} />
      )}
    </ol>
  )
}

const Board = ({
  ...props
}) => {
  // collapsible
  const [ expanded, setExpanded ] = useState(false)
  const onToggle = () => setExpanded(!expanded)
  const cnBtn = expanded ? 'collapsible btn active' : 'collapsible btn'
  const cnContent = expanded ? 'collapsible content active' : 'collapsible content'

  return (
    <div className="section board">
      <button className={cnBtn} onClick={onToggle}>Board</button>
      <div className={cnContent}>
        <BoardSpaces {...props} />
      </div>
    </div>
  )
}

export default Board
