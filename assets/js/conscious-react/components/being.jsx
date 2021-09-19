import React, { useState } from 'react'
import { times, findIndex, partial } from 'lodash'

import { clickOrReturn } from './utils'
import { Card } from './cards'

const cardComponent = (parts, onSelect, c, i) => {
  const selected = parts ? findIndex(parts, (p) => p.c == c.c ) : i
  const onClick = (e) => clickOrReturn(e) && onSelect(selected)
  return <Card card={c} onClick={onClick} tabIndex='0' />
}

const mapPartOfPart = (mapCard, n, i) =>
<div key={"pop"+i} className="part-of-part cards">
  {mapCard(n, i)}
  <div className="pieces">
    <div key={i} className="holder">
      {times(n, (j) => <div key={`p-${i}-${j}`} className="piece" />)}
    </div>
  </div>
</div>

const mapPiece = (n, i) =>
  <div key={i} className="holder">
    {times(n, (j) => <div key={`p-${i}-${j}`} className="piece" />)}
  </div>

const ThreeBrains = ({
  parts,
  pieces,
  onSelect,
}) => {
  // collapsible
  const [ expanded, setExpanded ] = useState(false)
  const onToggle = () => setExpanded(!expanded)
  const cnBtn = expanded ? 'collapsible btn active' : 'collapsible btn'
  const cnContent = expanded ? 'collapsible content active' : 'collapsible content'

  // render helper for parts of parts with pieces
  const mapCard = partial(cardComponent, parts, onSelect)
  const mapPart = partial(mapPartOfPart, mapCard)
  return (
    <div className="being">
      <button className={cnBtn} onClick={onToggle}>Being</button>
      <div className={cnContent}>
        <div className="brain">
          <div className="essence">
            {parts.slice(12, 15).map(mapPart)}
          </div>
          <div className="personality">
            {parts.slice(15).map(mapPart)}
          </div>
        </div>
        <div className="brain">
          <div className="essence">
            {parts.slice(9, 12).map(mapPart)}
          </div>
          <div className="personality">
            {parts.slice(6, 9).map(mapPart)}
          </div>
        </div>
        <div className="brain">
          <div className="essence">
            {parts.slice(3, 6).map(mapPart)}
          </div>
          <div className="personality">
            {parts.slice(0, 3).map(mapPart)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ThreeBrains
