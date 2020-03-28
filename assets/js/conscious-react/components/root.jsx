import React from 'react'
import ReactDOM from 'react-dom'
import ReactModal from 'react-modal'
import { ToastContainer, toast } from 'react-toastify'

import { TURNS, GAME_ID } from '../constants'
import { gameActions, reduxStore } from '../events'

import Buttons from './buttons'
import TestButtons from './test_buttons'
import Board   from './board'
import { CardHand, LawHand } from './cards'
import FoodDiagram from './food'
import { GameId, PlayerStats, ThreeBrains } from './being'
import GameModal, { IntroModal, SetupModal } from './modal'

import "react-toastify/dist/ReactToastify.css";

export class ConsciousBoardgame extends React.Component {

  actions = () => {
    return gameActions(this.props.channel)
  }

  onJoinGame = () => {
    const { channel } = this.props
    const gid = reduxStore.getState().modal.game || channel.gid
    channel.join(gid)
    this.actions().joinGame(gid)
    localStorage.setItem(GAME_ID, gid)
  }

  onStartGame = () => {
    const { channel } = this.props
    const { name = 'anon', sides = 6 } = reduxStore.getState().modal
    this.actions().startGame(name, sides)
    localStorage.setItem(GAME_ID, channel.gid)
  }

  onRoll = () => {
    this.actions().onRollClick()
    this.actions().updateGame(reduxStore.getState())
  }

  componentWillUnmount () {
    this.props.channel.diconnect()
  }

  render () {
    const { channel } = this.props
    const { player, board, cards, laws, fd, ep, modal } = reduxStore.getState()
    const gameId = modal.gameId || channel.gid || ''
    const actions = { ...this.actions() }

    switch(board.current_turn) {
      case TURNS.setup1:
      case TURNS.setup2:
        return (
          <SetupModal
            step={board.current_turn}
            gameId={gameId}
            name={modal.name}
            sides={modal.sides}
            onStart={this.onStartGame}
            onNewGame={actions.onNewGame}
            onJoinGame={!!gameId && this.onJoinGame}
            errorMessage={modal.error_message}
          />
        )
      default: {
        return (
          <div>
            <Buttons
              actions={actions}
              roll={board.roll}
              onRoll={this.onRoll}
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
            <GameId gid={gameId} />
            <PlayerStats name={player.name} {...ep} />
            <FoodDiagram {...fd} />
            <Board {...board} />
            <CardHand cards={cards.hand} onSelect={actions.onSelectCard} />
            { fd.current.alive && <LawHand
                laws={laws}
                byChoice={board.current_turn===TURNS.choiceLaw}
                onSelect={actions.onSelectLawCard}
                onChoice={actions.onChooseLaw} />
            }
            <ThreeBrains {...ep} onSelect={actions.onSelectPart} />
            <GameModal {...modal} />
            <ToastContainer position={toast.POSITION.BOTTOM_CENTER} autoClose={4000} />
          </div>
        )
      }
    }
  }
}

export const renderRoot = (channel) => {
  const domElement = document.getElementById('Conscious-Boardgame')
  ReactModal.setAppElement(domElement)
  const renderGame = () => {
    ReactDOM.render(
      <ConsciousBoardgame channel={channel} />,
      domElement
    )
  }
  document.addEventListener('DOMContentLoaded', () => { renderGame() })
  return renderGame
}
