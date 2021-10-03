import React, { useState } from 'react'
import { Dice } from '../constants'

/*
 * Adapted from: https://codesandbox.io/s/xjk3xqnprw
 * "name": "animated-3d-dice-roll",
 * "version": "1.0.0",
 * "description": "HTML, CSS, JS - CSS Grid and 3D transform properties.
 *   The JavaScript is a random number generator that applies CSS classes to dice to display results",
 * "license": "MIT"
 */
const DiceComponent = ({ roll, sides, canRoll, onRoll, onCantRoll }) => {
  const [ animateRoll, setAnimateRoll ] = useState('odd-roll')
  const [ currentRoll, setCurrentRoll ] = useState(roll)

  const onCanRoll = () => {
    const new_roll = Dice(sides).roll()
    setAnimateRoll(animateRoll==='odd-roll' ? 'even-roll' : 'odd-roll')
    setCurrentRoll(new_roll)
    setTimeout(() => { onRoll(new_roll) }, 1000)
  }
  const onClick = canRoll ? onCanRoll : onCantRoll

  return (
    <div className="dice-container">
      <div className="dice" onClick={onClick}>
        <ol className={`die-list ${animateRoll}`} data-roll={currentRoll}>
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

export default DiceComponent
