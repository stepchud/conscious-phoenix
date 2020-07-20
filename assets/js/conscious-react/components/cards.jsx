import React, { useState } from 'react'
import { map } from 'lodash'
import { lawAtIndex } from '../reducers/laws'
import { CardImage } from './card_image'
import { useDoubleClick } from '../hooks/useDoubleClick'

export const Card = ({
  card,
  active,
  onClick,
  onDuplicate,
}) => {
  const classes = `card ${card.selected ? 'selected' : ''}`
  const [ callbackRef, _ ] = useDoubleClick(onDuplicate)
  return (
    <div ref={callbackRef} className={classes} onClick={onClick} onKeyDown={onClick} tabIndex='0'>
      <CardImage card={card.c} />
    </div>
  )
}

const InactiveCard = ({
  card
}) =>
  <div className={'card'} tabIndex='0'>
    <CardImage card={card.c} />
  </div>

const ActiveLawCard = ({
  card,
  covered,
}) => {
  return (
    <div title={card.text} className='card law'>
      <span className="card-state">
        {!!covered.length && `(${covered.join(',')})`}
      </span>
      <CardImage card={card.card} />
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
      <CardImage card={card.c.card} />
    </div>
  )
}

export const CardHand = ({
  cards,
  active,
  onSelect,
  onDuplicate,
}) => {
  let hand = <span>No Cards.</span>
  const [canDupe, setCanDupe] = useState(true)
  if (!!cards.length) {
    hand = map(cards, (c, i) => {
      if (!active) { return <InactiveCard key={i} card={c} /> }
      const dupe = canDupe && cards.filter(dupes => dupes.c === c.c).length > 1
      return (
        <Card key={i}
          card={c}
          active={active}
          onClick={() => onSelect(i)}
          onDuplicate={() => { if (dupe) { setCanDupe(false); onDuplicate() } }}
          tabIndex='0'
        />
      )
    })
  }
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
          <ActiveLawCard key={i} card={lawAtIndex(c)} covered={c.covered} />
        )
      }
    </div>
  )
}

