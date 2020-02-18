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
import { PlayerStats, ThreeBrains } from './being'
import GameModal, { IntroModal, SetupModal } from './modal'

import "react-toastify/dist/ReactToastify.css";

export class ConsciousBoardgame extends React.Component {

  gameId = () =>
    localStorage.getItem(GAME_ID)

  gameIdChanged = (gid) => {
    leave(this.channel)
    const channel = join(this.socket, gid)
    localStorage.setItem(GAME_ID, gid)
    channel.on("update:game", payload => console.log('update:game', payload))
    channel.on("update:gid", payload => this.gameIdChanged(payload.gid))
    this.channel = channel
  }

  onNewGame = () => {
    const uid = uuid()
    console.log(`new uid=${uid}`)
    this.gameIdChanged(uid)
    redux.store.dispatch(actions.newGame())
  }

  onContinueGame = () => {
    console.log(`continue ${this.gameId()}`)
    this.gameIdChanged(this.gameId())
  }

  onStartGame = () => {
    const { ep: { player_name: name }, board: { dice: { sides } } } = redux.store.getState()
    this.channel.push('game:start', { gid: this.gameId(), name, sides })
    redux.store.dispatch(actions.startGame())
  }

  componentDidMount () {
    this.socket = connect()
  }

  componentWillUnmount () {
    leave(this.channel)
    disconnect(this.socket)
  }

  render () {
    const { board, cards, laws, fd, ep, modal: { showModal, modalProps } } = redux.store.getState()
    const { gameActions } = redux

    switch(board.current_turn) {
      case TURNS.setup1:
      case TURNS.setup2:
        return (
          <SetupModal
            step={board.current_turn}
            playerName={ep.player_name}
            sides={board.dice.sides}
            onStart={this.onStartGame}
            onNewGame={this.onNewGame}
            onContinueGame={!!this.gameId() && this.onContinueGame}
          />
        )
      default: {
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
