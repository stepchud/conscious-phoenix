import React from 'react'
import ReactDOM from 'react-dom'
import ReactModal from 'react-modal'
import { ToastContainer, toast } from 'react-toastify'

import Buttons from './buttons'
import TestButtons from './test_buttons'
import Board   from './board'
import { CardHand, LawHand } from './cards'
import FoodDiagram from './food'
import { PlayerStats, ThreeBrains } from './being'
import GameModal from './modal'
import { TURNS } from '../constants'
import redux from '../redux'

import "react-toastify/dist/ReactToastify.css";

const { store, gameActions } = redux

export const ConsciousBoardgame = () => {
  const { board, cards, laws, fd, ep, modal: { showModal, modalProps } } = store.getState()

  return (
    <div>
      <Buttons
        actions={gameActions}
        roll={board.roll}
        cards={cards.hand}
        laws={laws}
        ep={ep}
        currentTurn={board.current_turn}
      />
      <TestButtons
        actions={gameActions}
        cards={cards.hand}
        laws={laws}
        parts={ep.parts}
      />
      <PlayerStats {...ep} />
      <FoodDiagram {...fd} />
      <Board {...board} />
      <CardHand cards={cards.hand} onSelect={gameActions.onSelectCard} />
      { fd.current.alive && <LawHand
          laws={laws}
          byChoice={board.current_turn===TURNS.choiceLaw}
          onSelect={gameActions.onSelectLawCard}
          onChoice={gameActions.onChooseLaw} />
      }
      <ThreeBrains {...ep} onSelect={gameActions.onSelectPart} />
      <GameModal showModal={showModal} modalProps={modalProps} />
      <ToastContainer position={toast.POSITION.BOTTOM_CENTER} autoClose={4000} />
    </div>
  )
}

export const renderRoot = () => {
  const domElement = document.getElementById('Conscious-Boardgame')
  ReactModal.setAppElement(domElement)
  const renderGame = () => {
    ReactDOM.render(
      <ConsciousBoardgame />,
      domElement
    )
  }
  document.addEventListener('DOMContentLoaded', () => { renderGame() })
  return renderGame
}
