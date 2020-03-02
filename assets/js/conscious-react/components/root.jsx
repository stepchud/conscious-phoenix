import uuid from 'uuid/v4'
import React from 'react'
import ReactDOM from 'react-dom'
import ReactModal from 'react-modal'
import { ToastContainer, toast } from 'react-toastify'

import { connect, disconnect, join, leave } from '../channel'
import { TURNS, GAME_ID } from '../constants'
import redux from '../redux'
import actions from '../actions'

import Buttons from './buttons'
import TestButtons from './test_buttons'
import Board   from './board'
import { CardHand, LawHand } from './cards'
import FoodDiagram from './food'
import { GameId, PlayerStats, ThreeBrains } from './being'
import GameModal, { IntroModal, SetupModal } from './modal'

import "react-toastify/dist/ReactToastify.css";

export class ConsciousBoardgame extends React.Component {

  gameId = () =>
    localStorage.getItem(GAME_ID)

  gameIdChanged = (gid) => {
    leave(this.channel)
    const channel = join(this.socket, gid)
    localStorage.setItem(GAME_ID, gid)
    channel.on("game:update", payload => console.log('game:update', payload))
    channel.on("game:joined", payload => {
      payload.error
        ? this.displayError(payload.error)
        : this.gameIdChanged(payload.gid)
    })
    this.channel = channel
  }

  onNewGame = () => {
    redux.store.dispatch(actions.newGame())
  }

  onJoinGame = () => {
    const { game } = redux.store.getState().modal
    this.channel.push('game:join', { game })
  }

  onStartGame = () => {
    const { name = 'anon', sides = 6 } = redux.store.getState().modal
    this.channel.push('game:start', { gid: this.gameId(), name, sides })
    redux.store.dispatch(actions.startGame(name, sides))
  }

  onRoll = () => {
    redux.gameActions.onRollClick()
    this.channel.push('game:roll', { gid: this.gameId(), roll: redux.store.getState().board.roll })
  }

  componentDidMount () {
    this.socket = connect()
    const gid = this.gameId() || uuid()
    console.log(`gid=${gid}`)
    this.gameIdChanged(gid)
  }

  componentWillUnmount () {
    leave(this.channel)
    disconnect(this.socket)
  }

  render () {
    const { board, cards, laws, fd, ep, modal } = redux.store.getState()
    const { gameActions } = redux
    const gameId = modal.game || this.gameId() || ''

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
            onNewGame={this.onNewGame}
            onJoinGame={!!(gameId) && this.onJoinGame}
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
            />
            <TestButtons
              actions={gameActions}
              cards={cards.hand}
              laws={laws}
              parts={ep.parts}
            />
            <GameId gid={this.gameId()} />
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
            <GameModal showModal={modal.showModal} modalProps={modal.modalProps} />
            <ToastContainer position={toast.POSITION.BOTTOM_CENTER} autoClose={4000} />
          </div>
        )
      }
    }
  }
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
