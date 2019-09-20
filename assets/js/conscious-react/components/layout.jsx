import React from 'react'

import Buttons from './buttons'
import TestButtons from './test_buttons'
import Board   from './board'
import { CardHand, LawHand } from './cards'
import FoodDiagram from './food'
import { PlayerStats, ThreeBrains } from './being'
import GameModal from './modal'
import GameLog from './log'
import { TURNS } from '../constants'
import redux from '../redux'

const { store, gameActions } = redux

export const ConsciousBoardgame = () => {
  const { board, cards, laws, fd, ep, log, modal: { showModal, modalProps } } = store.getState()

  return (
    <div>
      <PlayerStats {...ep} />
      <GameLog log={log} />
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
      <FoodDiagram {...fd} store={store} />
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
    </div>
  )
}
