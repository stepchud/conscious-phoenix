import React from 'react'
import ReactDOM from 'react-dom'
import ReactModal from 'react-modal'
import { ToastContainer, toast } from 'react-toastify'

import { TURNS, getPlayerId, noop } from '../constants'
import Store from '../redux_store'
import { gameActions } from '../events'

import Buttons from './buttons'
import TestButtons from './test_buttons'
import Board   from './board'
import { CardHand, LawHand } from './cards'
import FoodDiagram from './food'
import ThreeBrains from './being'
import { GameLog, PlayerStats } from './game_stats'
import GameModal, { IntroModal, SetupModal } from './modal'

import "react-toastify/dist/ReactToastify.css";

export class ConsciousBoardgame extends React.Component {

  state = {
    expandLog: false,
  }

  onJoinGame = (gid, name) => {
    const { channel } = this.props
    const pid = getPlayerId()
    this.props.channel.push('game:join', { gid, pid, name })
  }

  onContinueGame = (gid) => {
    const { channel } = this.props
    const pid = getPlayerId()
    this.props.channel.push('game:continue', { gid, pid })
  }

  onStartGame = (name, sides) => {
    const { channel } = this.props
    this.props.channel.push('game:start', { name, sides })
  }

  onRoll = async () => {
    await gameActions.onRollClick()
    const game = Store.getState()
    const pid = getPlayerId()
    this.props.channel.push('game:end_turn', { pid, game })
  }

  onLogEvent = (event) => {
    this.props.channel.push('game:log_event', { event })
  }

  toggleEventLog = () => this.setState({ expandLog: !this.state.expandLog })

  componentWillUnmount () {
    this.props.channel.disconnect()
  }

  render () {
    const { channel } = this.props
    const { player, board, cards, laws, fd, ep, modal, log } = Store.getState()
    const gameId = modal.gameId || channel.gid || ''
    const playerId = getPlayerId()

    switch(player.current_turn) {
      case TURNS.setup:
        return (
          <SetupModal
            step={modal.setup_step}
            gameId={gameId}
            name={modal.name}
            sides={modal.sides}
            onStart={this.onStartGame}
            onJoinGame={!!gameId && this.onJoinGame}
            onContinueGame={!!playerId && this.onContinueGame}
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
              currentTurn={player.current_turn}
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
                byChoice={player.current_turn===TURNS.choiceLaw}
                onSelect={gameActions.onSelectLawCard}
                onChoice={gameActions.onChooseLaw} />
            }
            <ThreeBrains {...ep} onSelect={gameActions.onSelectPart} />
            <FoodDiagram {...fd} />
            <GameLog board={board} expanded={this.state.expandLog} onToggle={this.toggleEventLog} entries={log} />
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
