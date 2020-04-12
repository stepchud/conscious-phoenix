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

  onJoinGame = () => {
    const { channel } = this.props
    const modal = reduxStore.getState().modal
    const gid = modal.game || channel.gid
    const name = modal.name
    channel.join(gid)
    this.props.channel.push('game:join', { gid, name })
    localStorage.setItem(GAME_ID, gid)
  }

  onStartGame = (name, sides) => {
    const { channel } = this.props
    this.props.channel.push('game:start', { name, sides })
    localStorage.setItem(GAME_ID, channel.gid)
  }

  onRoll = async () => {
    await gameActions.onRollClick()
    this.props.channel.push('game:end_turn', { game: reduxStore.getState() })
  }

  componentWillUnmount () {
    this.props.channel.diconnect()
  }

  render () {
    const { channel } = this.props
    const { player, board, cards, laws, fd, ep, modal } = reduxStore.getState()
    const gameId = modal.gameId || channel.gid || ''

    switch(board.current_turn) {
      case TURNS.setup:
        return (
          <SetupModal
            step={modal.setup_step}
            gameId={gameId}
            name={modal.name}
            sides={modal.sides}
            onStart={this.onStartGame}
            onJoinGame={!!gameId && this.onJoinGame}
            errorMessage={modal.error_message}
          />
        )
      default: {
        return (
          <div>
            <Buttons
              actions={gameActions}
              roll={board.roll}
              onRoll={this.onRoll}
              cards={cards.hand}
              laws={laws}
              ep={ep}
              currentTurn={board.current_turn}
              waiting={!player.active}
            />
            <TestButtons
              actions={gameActions}
              cards={cards.hand}
              laws={laws}
              parts={ep.parts}
            />
            <PlayerStats name={player.name} {...ep} />
            <Board {...board} />
            <CardHand cards={cards.hand} onSelect={gameActions.onSelectCard} />
            { fd.current.alive && <LawHand
                laws={laws}
                byChoice={board.current_turn===TURNS.choiceLaw}
                onSelect={gameActions.onSelectLawCard}
                onChoice={gameActions.onChooseLaw} />
            }
            <ThreeBrains {...ep} onSelect={gameActions.onSelectPart} />
            <FoodDiagram {...fd} />
            <GameId gid={gameId} />
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
