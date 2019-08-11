import React from 'react'
import { map } from 'lodash'
import { lawAtIndex } from '../reducers/laws'

const imgTag = (card) => card=='JO' || card=='XJ'
  ? <img className='card-img' src={`images/${card}.png`} alt={card} />
  : <img className='card-img' src={`images/${card}.gif`} alt={card} />

export const Card = ({
  card,
  onClick,
}) => {
  const classes = `card ${card.selected ? 'selected' : ''}`
  return <div className={classes} onClick={onClick} onKeyDown={onClick} tabIndex='0'>
    {imgTag(card.c)}
  </div>
}

const ActiveLawCard = ({
  card,
  covered,
}) => {
  return (
    <div title={card.text} className='card law'>
      <span className="card-state">
        {!!covered.length && `(${covered.join(',')})`}
      </span>
      {imgTag(card.card)}
    </div>
  )
}

const LawCard = ({
  card,
  onClick
}) => {
  const classes = `card law ${card.selected ? 'selected' : ''}`
  const cardState = []
  if (card.obeyed) { cardState.push('O') }
  if (card.played) { cardState.push('P') }
  return (
    <div title={card.c.text} className={classes} onClick={onClick} tabIndex='0'>
      <span className="card-state">
        {cardState.join(',')}
      </span>
      {imgTag(card.c.card)}
    </div>
  )
}

export const CardHand = ({
  cards,
  onSelect,
}) => {
  const hand = cards.length ? (
    map(cards, (c, i) => <Card key={i} card={c} onClick={() => onSelect(i)} tabIndex='0' />)
  ) : (
    <span>No Cards.</span>
    )
  return (
    <div className="section cards">
      <h3>Cards</h3>
      {hand}
    </div>
  )
}

export const LawHand = ({
  laws,
  byChoice,
  onSelect,
  onChoice,
}) => {
  const inHand = laws.hand.length ? (
    map(laws.hand, (c, i) =>
      <LawCard key={i} card={c} onClick={() => byChoice && onChoice(i)} />
    )
  ) : (
    <span>Empty Law Hand.</span>
  )

  return (
    <div className="section cards laws">
      <h3>Laws</h3>
      {inHand}
      { !!laws.in_play.length && <span className="laws">In Play:</span> }
      { !!laws.in_play.length &&
        map(laws.in_play, (c, i) =>
          <LawCard key={i} card={c} onClick={() => onSelect(i)} tabIndex='0' />
        )
      }
      { !!laws.active.length && <span className="laws">Active:</span> }
      { !!laws.active.length &&
        map(laws.active, (c, i) =>
          <ActiveLawCard key={i} card={lawAtIndex(c)} covered={c.protected} />
        )
      }
    </div>
  )
}

