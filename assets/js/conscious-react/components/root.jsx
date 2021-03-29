import React from 'react'
import ReactDOM from 'react-dom'
import ReactModal from 'react-modal'
import { ToastContainer, toast } from 'react-toastify'

import { TURNS, getPlayerId, resetGameId, noop } from '../constants'
import Store from '../reducers/store'
import { gameActions } from '../events'
import { hasnamuss } from '../reducers/laws'

import ButtonRow from './buttons'
import TestButtons from './test_buttons'
import Board   from './board'
import { CardHand, LawHand } from './cards'
import FoodDiagram from './food'
import ThreeBrains from './being'
import { GameLog, PlayerStats } from './game_stats'
import GameModal, { IntroModal, SetupModal, WaitGameModal } from './modal'

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

  handleStartAfterWait = () => {
    this.props.channel.push('game:start_after_wait', {})
  }

  handleWaitGame = (name, sides) => {
    this.props.channel.push('game:wait', { name, sides })
  }

  handleGameOver = () => {
    const pid = getPlayerId()
    this.actions.handleGameOver()
    this.props.channel.push('game:over', { pid })
  }

  handleGameExit = () => {
    const gid = resetGameId()
    this.props.channel.join(gid)
    Store.dispatch({ type: 'RESET_GAME' })
  }

  handleRoll = async () => {
    await this.actions.handleRollClick()
    const game = Store.getState()
    const pid = getPlayerId()
    this.props.channel.push('game:end_turn', { pid, game })
  }

  handleDuplicate = (elem) => {
    const pid = getPlayerId()
    this.actions.onExchangeDuplicates()
    this.props.channel.push('game:exchange_dupes', { pid })
  }

  handleFifthStriving = () => {
    const pid = getPlayerId()
    const game = Store.getState()
    this.props.channel.push('game:fifth_striving', { pid, game })
  }

  handleLogEvent = (event) => {
    const pid = getPlayerId()
    this.props.channel.push('game:log_event', { pid, event })
  }

  toggleEventLog = () => this.setState({ expandLog: !this.state.expandLog })

  componentDidMount () {
    this.actions = gameActions(this.props.channel)
  }

  componentWillUnmount () {
    this.props.channel.disconnect()
  }

  render () {
    const { player, board, cards, laws, fd, ep, modal, log } = Store.getState()
    const { current: { astral, mental } } = fd
    const gameId = modal.gameId || this.props.channel.gid || ''
    const playerId = getPlayerId()
    const gameOver = player.reached_death_space &&
      (!astral || (!mental && !hasnamuss(laws.active) && player.completed_trips > 1))

    if (player.current_turn===TURNS.setup) {
      return <SetupModal
        step={modal.setup_step}
        gameId={gameId}
        name={modal.name}
        sides={modal.sides}
        players={board.players}
        onStart={this.handleStartGame}
        onWait={this.handleWaitGame}
        onJoinGame={!!gameId && this.handleJoinGame}
        onContinueGame={!!playerId && this.handleContinueGame}
        errorMessage={modal.error_message}
      />
    }

    if (board.status==='wait') {
      return <WaitGameModal
        gameId={gameId}
        name={player.name}
        sides={board.sides}
        players={board.players}
        onStart={this.handleStartAfterWait}
      />
    }

    return (
      <div>
        <ButtonRow
          roll={board.roll}
          cards={cards.hand}
          laws={laws}
          ep={ep}
          currentTurn={player.current_turn}
          gameOver={gameOver}
          waiting={!player.active}
          deathTurn={player.reached_death_space}
          onRoll={this.handleRoll}
          onObeyLaw={this.actions.handleObeyLaw}
          onCombineSelectedParts={this.actions.onCombineSelectedParts}
          onPlaySelected={this.actions.onPlaySelected}
          onRandomLaw={this.actions.handleRandomLaw}
          onEndDeath={this.actions.handleEndDeath}
          onGameOver={this.handleGameOver}
          onExit={this.handleGameExit}
        />
        <TestButtons
          actions={this.actions}
          cards={cards.hand}
          laws={laws}
          parts={ep.parts}
        />
        <PlayerStats name={player.name} {...ep} />
        <Board {...board} onFifthStriving={this.handleFifthStriving} />
        <CardHand
          cards={cards.hand}
          active={player.active}
          canDupe={player.can_dupe}
          onSelect={this.actions.onSelectCard}
          onDuplicate={this.handleDuplicate}
        />
        { fd.current.alive && <LawHand
            laws={laws}
            byChoice={player.current_turn===TURNS.choiceLaw}
            onSelect={this.actions.onSelectLawCard}
            onChoice={this.actions.handleChooseLaw} />
        }
        <ThreeBrains {...ep} onSelect={this.actions.onSelectPart} />
        <FoodDiagram {...fd} />
        <GameLog board={board} expanded={this.state.expandLog} onToggle={this.toggleEventLog} entries={log} />
        <GameModal {...modal} />
        <ToastContainer position={toast.POSITION.BOTTOM_CENTER} autoClose={4000} />
      </div>
    )
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
