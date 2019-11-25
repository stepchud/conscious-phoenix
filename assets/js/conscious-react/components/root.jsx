import React from 'react'
import ReactDOM from 'react-dom'
import ReactModal from 'react-modal'
import { ToastContainer, toast } from 'react-toastify'

import { connectSocket, joinChannel, leave } from '../channel'
import { TURNS, GAME_ID } from '../constants'
import redux from '../redux'
import actions from '../actions'

import Buttons from './buttons'
import TestButtons from './test_buttons'
import Board   from './board'
import { CardHand, LawHand } from './cards'
import FoodDiagram from './food'
import { PlayerStats, ThreeBrains } from './being'
import GameModal, { IntroModal } from './modal'

import "react-toastify/dist/ReactToastify.css";

export class ConsciousBoardgame extends React.Component {

  gameId = () => localStorage.getItem(GAME_ID) || "_"

  gameIdChanged = (payload) => {
    console.log('update:gid', payload)
    leave(this.channel)
    this.channel = joinChannel(this.socket, payload.gid)
    localStorage.setItem(GAME_ID, payload.gid)
  }

  onStart = (name, sides) => {
    this.channel.push('game:start', { name, sides })
    redux.store.dispatch(actions.startGame())
  }

  componentDidMount () {
    this.socket = connectSocket()
		this.channel = joinChannel(this.socket, this.gameId())
    this.channel.on("update:gid", this.gameIdChanged)
    this.channel.on("update:game", payload => console.log('update', payload));
  }

  componentWillUnmount () {
    leave(this.channel)
    this.socket.disconnect(() => console.log('Bye!'))
  }

  render () {
    const { board, cards, laws, fd, ep, modal: { showModal, modalProps } } = redux.store.getState()
    const { gameActions } = redux
    const continue_game = this.gameId() !== '_'

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
        { board.current_turn===TURNS.initial ?
          <IntroModal
            playerName={ep.player_name}
            sides={board.dice.sides}
            continueGame={continue_game}
            onStart={() => { this.onStart(ep.player_name, board.dice.sides) }}
          />
          : <GameModal showModal={showModal} modalProps={modalProps} />
        }
        <ToastContainer position={toast.POSITION.BOTTOM_CENTER} autoClose={4000} />
      </div>
    )
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
