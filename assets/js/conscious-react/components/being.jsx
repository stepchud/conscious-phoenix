import React from 'react'
import { times, findIndex, partial } from 'lodash'

import { spaces, s2, s3, clickOrReturn } from './utils'
import { Card } from './cards'

const cardComponent = (parts, onSelect, c, i) => {
  const selected = parts ? findIndex(parts, (p) => p.c == c.c ) : i
  const onClick = (e) => clickOrReturn(e) && onSelect(selected)
  return <Card key={i} card={c} onClick={onClick} tabIndex='0' />
}

const mapPiece = (n, i) =>
  <div key={i} className="holder">
    {times(n, (j) => <div key={i*j} className="piece" />)}
  </div>

const PlayerStats = ({
  level_of_being,
  card_plays,
  transforms,
  wild_shock,
  all_shocks,
}) =>
  <div className="lob">
    Level: {level_of_being},
    Card plays: {card_plays},
    Transform: {transforms},
    Wild: {wild_shock},
    All: {all_shocks}
  </div>

const ThreeBrains = ({
  parts,
  pieces,
  onSelect,
}) => {
  const mapCard = partial(cardComponent, parts, onSelect)
  return (
    <div className="section being">
      <h3>Being</h3>
      <div className="cards">
        {parts.slice(12).map(mapCard)}
      </div>
      <div className="pieces">
        {pieces.slice(12).map(mapPiece)}
      </div>
      <div className="cards">
        {parts.slice(6, 12).map(mapCard)}
      </div>
      <div className="pieces">
        {pieces.slice(6, 12).map(mapPiece)}
      </div>
      <div className="cards">
        {parts.slice(0, 6).map(mapCard)}
      </div>
      <div className="pieces">
        {pieces.slice(0, 6).map(mapPiece)}
      </div>
    </div>
  )
}
export {
  PlayerStats,
  ThreeBrains
}
