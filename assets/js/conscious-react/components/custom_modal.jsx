import React from 'react'

export const OfferAstralBody = ({
  food,
  air,
  impressions
}) =>
  <div>You found a discarded Astral body, do you want to replace yours?</div>

export const OfferTakeCard = (pid, victim, onSubmit) => {
  const title = 'Take A Card'
  const cards = []
  for (let suit of ['Diamonds', 'Clubs', 'Hearts', 'Spades']) {
    for (let rank of ['2','3','4','5','6','7','8','9','10','Jack','Queen','King','Ace']) {
      const value = `${rank[0]}${suit[0]}`
      cards.push(<option key={value} value={value}>{rank} of {suit}</option>)
    }
  }
  const body = <>
    <div>As a hasnamuss you can take a card from {victim}, which card do you want?</div>
    <div><select name="cards" id="take-cards-select">{cards}</select></div>
  </>
  const options = [{ text: 'Take It', onClick: onSubmit }]
  return { title, body, options }
}
