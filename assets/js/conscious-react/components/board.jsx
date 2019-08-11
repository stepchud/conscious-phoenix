import React from 'react'
import ReactDOM from 'react-dom'

const classMap = {
  '*': 'wild',
  'F': 'food',
  'A': 'air',
  'I': 'impression',
  'C': 'card',
  'L': 'law',
  'D': 'decay',
}
const spaceElem = (space, index, position) =>
  (<span key={index} className={`${classMap[space]} ${index==position ? 'player' : ''}`}></span>)

const split = (spaces, position) => ({
  before: spaces.slice(0, position),
  at: spaces.slice(position, position+1),
  after: spaces.slice(position+1, spaces.length),
})

const board = ({
  spaces,
  position,
}) => {
  const spacesMapped = spaces.split('').map((letter, index) => spaceElem(letter, index, position))
  return (
    <div className="section board">
      <h3>Board</h3>
      {spacesMapped}
    </div>
  )
}

export default board
