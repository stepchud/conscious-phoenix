import React from 'react'

import Buttons from './buttons'
import TestButtons from './test_buttons'
import Board   from './board'
import { CardHand, LawHand } from './cards'
import FoodDiagram from './food'
import { PlayerStats, ThreeBrains } from './being'
import { TURNS } from '../constants'
import redux from '../redux'

const { store, actions } = redux

export const ConsciousBoardgame = () => {
  const { board, cards, laws, fd, ep } = store.getState()

  return (
    <div>
      <PlayerStats {...ep} />
      <Buttons
        actions={actions}
        roll={board.roll}
        cards={cards.hand}
        laws={laws}
        ep={ep}
        currentTurn={board.current_turn}
      />
      <TestButtons
        actions={actions}
        cards={cards.hand}
        laws={laws}
        parts={ep.parts}
      />
      <FoodDiagram {...fd} store={store} />
      <Board {...board} />
      <CardHand cards={cards.hand} onSelect={actions.onSelectCard} />
      { fd.current.alive && <LawHand
          laws={laws}
          byChoice={board.current_turn===TURNS.choiceLaw}
          onSelect={actions.onSelectLawCard}
          onChoice={actions.onChooseLaw} />
      }
      <ThreeBrains {...ep} onSelect={actions.onSelectPart} />
    </div>
  )
}
