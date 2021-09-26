import React, { useState } from 'react'
import { times, findIndex, partial } from 'lodash'

import { clickOrReturn } from './utils'
import { Card } from './cards'

const cardComponent = (parts, onSelect, c, i) => {
  const selected = parts ? findIndex(parts, (p) => p.c == c.c ) : i
  const onClick = (e) => clickOrReturn(e) && onSelect(selected)
  return <Card card={c} onClick={onClick} tabIndex='0' />
}

const mapPartOfPart = (mapCard, card, pieces, i) => {
  return <div key={"pop"+i} className="part-of-part cards">
    {mapCard(card, i)}
    <div className="pieces">
      <div key={i} className="holder">
        {times(pieces, (j) => <div key={`p-${i}-${j}`} className="piece" />)}
      </div>
    </div>
  </div>
}

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
          <div className="personality">
            {[15,16,17].map((i) => mapPart(parts[i], pieces[i], i))}
          </div>
          <div className="essence">
            {[12,13,14].map((i) => mapPart(parts[i], pieces[i], i))}
          </div>
        </div>
        <div className="brain">
          <div className="personality">
            {[9,10,11].map((i) => mapPart(parts[i], pieces[i], i))}
          </div>
          <div className="essence">
            {[6,7,8].map((i) => mapPart(parts[i], pieces[i], i))}
          </div>
        </div>
        <div className="brain">
          <div className="personality">
            {[3,4,5].map((i) => mapPart(parts[i], pieces[i], i))}
          </div>
          <div className="essence">
            {[0,1,2].map((i) => mapPart(parts[i], pieces[i], i))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ThreeBrains
