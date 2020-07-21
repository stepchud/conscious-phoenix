import React from 'react'
import ReactDOM from 'react-dom'
import ReactModal from 'react-modal'
import { ToastContainer, toast } from 'react-toastify'

import { TURNS, getPlayerId, resetGameId, noop } from '../constants'
import Store from '../redux_store'
import { gameActions } from '../events'
import { hasnamuss } from '../reducers/laws'

import ButtonRow from './buttons'
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

  handleJoinGame = (gid, name) => {
    const pid = getPlayerId()
    this.props.channel.push('game:join', { gid, pid, name })
  }

  handleContinueGame = (gid) => {
    const pid = getPlayerId()
    this.props.channel.push('game:continue', { gid, pid })
  }

  handleStartGame = (name, sides) => {
    this.props.channel.push('game:start', { name, sides })
  }

  handleGameOver = () => {
    const pid = getPlayerId()
    gameActions.handleGameOver()
    this.props.channel.push('game:over', { pid })
  }

  handleGameExit = () => {
    const gid = resetGameId()
    this.props.channel.join(gid)
    Store.dispatch({ type: 'RESET_GAME' })
  }

  handleRoll = async () => {
    await gameActions.handleRollClick()
    const game = Store.getState()
    const pid = getPlayerId()
    this.props.channel.push('game:end_turn', { pid, game })
  }

  handleDuplicate = (elem) => {
    const pid = getPlayerId()
    gameActions.onExchageDuplicates()
    this.props.channel.push('game:exchange_dupes', { pid })
  }

  handleLogEvent = (event) => {
    const pid = getPlayerId()
    this.props.channel.push('game:log_event', { pid, event })
  }

  toggleEventLog = () => this.setState({ expandLog: !this.state.expandLog })

  componentWillUnmount () {
    this.props.channel.disconnect()
  }

  render () {
    const { player, board, cards, laws, fd, ep, modal, log } = Store.getState()
    const { current: { astral, mental } } = fd
    const gameId = modal.gameId || this.props.channel.gid || ''
    const playerId = getPlayerId()
    const gameOver = player.current_turn===TURNS.death &&
      (!astral || (!mental && !hasnamuss(laws.active) && player.completed_trips > 1))

    switch(player.current_turn) {
      case TURNS.setup:
        return (
          <SetupModal
            step={modal.setup_step}
            gameId={gameId}
            name={modal.name}
            sides={modal.sides}
            onStart={this.handleStartGame}
            onJoinGame={!!gameId && this.handleJoinGame}
            onContinueGame={!!playerId && this.handleContinueGame}
            errorMessage={modal.error_message}
          />
        )
      default: {
        return (
          <div>
            <ButtonRow
              actions={gameActions}
              roll={board.roll}
              onRoll={this.handleRoll}
              cards={cards.hand}
              laws={laws}
              ep={ep}
              currentTurn={player.current_turn}
              gameOver={gameOver}
              onGameOver={this.handleGameOver}
              onExit={this.handleGameExit}
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
            <CardHand cards={cards.hand} active={player.active} canDupe={player.can_dupe} onSelect={gameActions.onSelectCard} onDuplicate={this.handleDuplicate} />
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
