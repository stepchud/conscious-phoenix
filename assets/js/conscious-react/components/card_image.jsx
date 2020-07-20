import React from 'react'

export const CardImage = ({ card }) =>
  card=='JO' || card=='XJ'
  ? <img className='card-img' src={`images/${card}.png`} alt={card} />
  : <img className='card-img' src={`images/${card}.gif`} alt={card} />
