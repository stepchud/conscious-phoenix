import React from 'react'

export const CardImage = ({ card }) => {
  switch(card) {
    case 'JO':
    case 'XJ':
      return <img className='card-img' src={`images/${card}.png`} alt={card} />
    case 'AD':
      return <img className='card-img' src={`images/ADiamonds.gif`} alt={card} />
    default:
      return <img className='card-img' src={`images/${card}.gif`} alt={card} />
  }
}
