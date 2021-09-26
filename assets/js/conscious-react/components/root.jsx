import React from 'react'
import ReactDOM from 'react-dom'
import ReactModal from 'react-modal'
import { ToastContainer, toast } from 'react-toastify'

import { TURNS, getGameId, getPlayerId, resetGameId, noop } from '../constants'
import Store from '../reducers/store'
import { gameActions } from '../events'
import { hasnamuss, unobeyedLaws } from '../reducers/laws'

import Dice from './dice'
import {
  Buttons,
  GameInfo,
  GameLog,
  TurnMessage,
} from './game_stats'
import TestButtons from './test_buttons'
import Board   from './board'
import { CardHand, LawHand } from './cards'
import FoodDiagram from './food'
import ThreeBrains from './being'
import GameModal, { IntroModal, SetupModal, WaitGameModal } from './modal'

import "react-toastify/dist/ReactToastify.css";

export class ConsciousBoardgame extends React.Component {

  handleJoinGame = (gid, name, icon) => {
    const pid = getPlayerId()
    this.props.channel.push('game:join', { gid, pid, name, icon })
  }

  handleContinueGame = (gid) => {
    const pid = getPlayerId()
    this.props.channel.push('game:continue', { gid, pid })
  }

  handleStartGame = (name, icon, sides) => {
    this.props.channel.push('game:start', { name, icon, sides })
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
    this.actions.onResetGame()
  }

  handleSaveGame = () => {
    const gid = getGameId()
    const pid = getPlayerId()
    const gameLink = `${document.location.href}?game_id=${gid}&player_id=${pid}`
    const title = "Save / Share Game"
    const body = <div>
      To continue this game as the same player,
      simply open this link from any browser:
        <blockquote className="white-space-normal"><a href={gameLink}>{gameLink}</a></blockquote>
      To invite a friend, ask them to join the Game ID:
        <blockquote>{gid}</blockquote>
    </div>
    const saveModal = { title, body, onClick: noop }
    this.actions.onSaveGame(pid, saveModal)
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

  componentDidMount () {
    this.actions = gameActions(this.props.channel)
    this.navRef = React.createRef()
  }

  componentWillUnmount () {
    this.props.channel.disconnect()
  }

  render () {
    const { player, board, cards, laws, fd, ep, modal, log } = Store.getState()
    const { current: { astral, mental } } = fd
    const gameId = modal.gameId || this.props.channel.gid || ''
    const playerId = getPlayerId()
    const playerActive = player.active
    const hasLaws = !!unobeyedLaws(laws.in_play).length
    const gameOver = player.reached_death_space &&
      (!astral || (!mental && !hasnamuss(laws.active) && player.completed_trips > 1))
    const canRoll = ![TURNS.choiceLaw, TURNS.randomLaw, TURNS.end].includes(player.current_turn) && !hasLaws && !player.reached_death_space

    if (player.current_turn===TURNS.setup) {
      return <SetupModal
        step={modal.setup_step}
        gameId={gameId}
        name={modal.name}
        icon={modal.icon}
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

    const TurnMsg = <TurnMessage
      turn={player.current_turn}
      hasLaws={hasLaws}
      waiting={!playerActive}
      deathTurn={player.reached_death_space}
      gameOver={gameOver}
    />

    const onRoll = this.handleRoll
    const onCantRoll = () => toast.warn(TurnMsg)

    return (
      <div>
        <div ref={this.navRef} className="section actions fixed-nav">
          <Dice
            roll={board.roll}
            canRoll={canRoll}
            onRoll={onRoll}
            onCantRoll={onCantRoll}
          />
          <Buttons
            turn={player.current_turn}
            waiting={!playerActive}
            cards={cards.hand}
            laws={laws}
            hasLaws={hasLaws}
            ep={ep}
            gameOver={gameOver}
            deathTurn={player.reached_death_space}
            onRoll={onRoll}
            onObeyLaw={this.actions.handleObeyLaw}
            onCombineSelectedParts={this.actions.onCombineSelectedParts}
            onPlaySelected={this.actions.onPlaySelected}
            onRandomLaw={this.actions.handleRandomLaw}
            onEndDeath={this.actions.handleEndDeath}
            onGameOver={this.handleGameOver}
            onExit={this.handleGameExit}
            onSaveShareGame={this.handleSaveGame}
          />
        </div>
        <TestButtons
          actions={this.actions}
          cards={cards.hand}
          laws={laws}
          parts={ep.parts}
        />
        <GameInfo
          message={TurnMsg}
          gid={gameId}
          pid={playerId}
          name={player.name}
          navRef={this.navRef}
          {...ep}
        />
        <Board player={player} onFifthStriving={this.handleFifthStriving} {...board} />
        <CardHand
          cards={cards.hand}
          active={playerActive}
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
        <div className="section ep-fd">
          <ThreeBrains {...ep} onSelect={this.actions.onSelectPart} />
          <FoodDiagram {...fd} />
        </div>
        <GameLog
          board={board}
          entries={log}
        />
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
