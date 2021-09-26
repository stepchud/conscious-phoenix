import React, { useState } from 'react'

/*
 * Adapted from: https://codesandbox.io/s/xjk3xqnprw
 * "name": "animated-3d-dice-roll",
 * "version": "1.0.0",
 * "description": "HTML, CSS, JS - CSS Grid and 3D transform properties.
 *   The JavaScript is a random number generator that applies CSS classes to dice to display results",
 * "license": "MIT"
 */
const Dice = ({ roll, canRoll, onRoll, onCantRoll }) => {
  const [ animateRoll, setAnimateRoll ] = useState('odd-roll')
  const onClick = () => {
    if (!canRoll) { onCantRoll(); return }

    setAnimateRoll(animateRoll==='odd-roll' ? 'even-roll' : 'odd-roll')
    setTimeout(() => { onRoll() }, 1000)
  }

  return (
    <div className="dice-container">
      <div className="dice" onClick={onClick}>
        <ol className={`die-list ${animateRoll}`} data-roll={roll}>
          <li className="die-item" data-side="1">
            <span className="dot"></span>
          </li>
          <li className="die-item" data-side="2">
            <span className="dot"></span>
            <span className="dot"></span>
          </li>
          <li className="die-item" data-side="3">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </li>
          <li className="die-item" data-side="4">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </li>
          <li className="die-item" data-side="5">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </li>
          <li className="die-item" data-side="6">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </li>
        </ol>
      </div>
    </div>
  )
}

export default Dice
