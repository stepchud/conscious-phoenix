import React from 'react'
import Modal from 'react-modal'
import { gameActions } from '../events'
import PlayerIcons from './player'

const actions = gameActions()
const ButtonTag = (text, onClick, key=1) => <button key={key} onClick={onClick}>{text}</button>
const TitleTag = (title) => title && <h1 className='modal-title'>{title}</h1>
const BodyTag = (body) => body && <div className='modal-body'>{body}</div>
const clickAndResolve = (onClick, onResolve) => async () => {
  actions.onHideModal();
  await onClick();
  if (typeof(onResolve)==='function') { onResolve() }
}

const onUpdateModal = (field, value) => actions.onUpdateModal({ field, value })
const onNameChange = (event) => onUpdateModal('name', event.target.value)
const onDiceChange = (event) => onUpdateModal('sides', event.target.value)
const onIconChange = (value) => onUpdateModal('icon', value)
const onGameChange = (event) => onUpdateModal('gameId', event.target.value)

const iconList = (icon) => {
  const icons = []
  for (const key of Object.keys(PlayerIcons)) {
    const IconComponent = PlayerIcons[key]
    const checked = key==icon ? 'selected' : ''
    icons.push(
      <li key={key} onClick={() => onIconChange(key)} className={`icon-button ${checked}`}>
        <div className="player">
          <IconComponent className="player-svg" />
        </div>
      </li>
    )
  }
  return icons
}

const PickGameModal = () => {
  const options =  [
    { text: 'New Game', onClick: () => onUpdateModal('setup_step', 'name') },
    { text: 'Join Game', onClick: () => onUpdateModal('setup_step', 'join') }
  ]
  const props = {
    show: true,
    title: `Welcome to the Conscious Boardgame!`,
    escapable: false,
    options,
  }
  return <ModalComponent {...props} />
}

const JoinGameModal = ({
  gameId,
  name,
  icon,
  onJoinGame,
  onContinueGame,
  errorMessage,
}) => {
  const icons = iconList(icon)
  const body =
    <div>
      <label name="name">
        Your name:
        <input type="text" name="name" value={name} onChange={onNameChange} />
      </label>
      <label name="player-piece">
        Pick your piece:
        <ul className="player-icons">{icons}</ul>
      </label>
      <label name="game">
        Game ID:
        <input type="text" name="game_id" placeholder={'Game ID'} value={gameId} onChange={onGameChange} />
      </label>
    </div>
  const options = [{ text: 'Join Game', onClick: () => onJoinGame(gameId, name, icon) }]
  if (onContinueGame) {
    options.push({ text: 'Continue Game', onClick: () => onContinueGame(gameId) })
  }
  const props = {
    show: true,
    title: `Which Game?`,
    body,
    options,
    errorMessage,
    escapable: false,
  }

  return <ModalComponent {...props} />
}

const NewGameModal = ({
  name,
  icon,
  sides,
  onStart,
  onWait,
}) => {
  const icons = iconList(icon)
  const body =
    <div>
      <label name="name">
        Name:
        <input type="text" name="name" value={name} onChange={onNameChange} />
      </label>
      <label name="dice" style={{"display": "none"}}>
        Sided-Dice:
        <input type="radio" group="dice" value="6" checked={sides==6} onChange={onDiceChange} /><span>6</span>
        <input type="radio" group="dice" value="10" checked={sides==10} onChange={onDiceChange} /><span>10</span>
      </label>
      <label name="player-piece">
        Pick your piece:
        <ul className="player-icons">{icons}</ul>
      </label>
    </div>
  const options =  [
    { text: 'Start now', onClick: () => onStart(name, icon, sides) },
    { text: 'Wait for players', onClick: () => onWait(name, icon, sides) }
  ]
  const props = {
    show: true,
    title: `Let's get started`,
    body,
    options,
    escapable: false,
  }
  return <ModalComponent {...props} />
}

export const WaitGameModal = ({
  gameId,
  name,
  icon,
  sides,
  players,
  onStart,
}) => {
  let body = <h3>Waiting for other players to join channel {gameId}</h3>
  if (players.length) {
    const other_players = players.map(p => p.name)
    body = <div>
      {body}
      <h4>Players:</h4>
      <ol>
        {players.map(p => <li key={p.pid} style={{ color: `#${p.pid}`}}>{p.name}</li>)}
      </ol>
    </div>
  }

  const options = [
    { text: "Let's begin!", onClick: () => onStart(name, icon, sides) },
  ]
  const props = {
    show: true,
    title: `The Waiting Room`,
    body,
    options,
    escapable: false,
  }
  return <ModalComponent {...props} />
}

export const SetupModal = ({
  step,
  name='',
  icon='',
  sides=6,
  onStart,
  onWait,
  gameId,
  onJoinGame,
  onContinueGame,
  errorMessage,
}) => {
  switch(step) {
  case 'new':
    return <PickGameModal />
  case 'join':
    return <JoinGameModal
      name={name}
      icon={icon}
      gameId={gameId}
      onJoinGame={onJoinGame}
      onContinueGame={onContinueGame}
      errorMessage={errorMessage}
    />
  case 'name':
    return <NewGameModal
      name={name}
      icon={icon}
      sides={sides}
      onStart={onStart}
      onWait={onWait}
    />
  default:
    console.warn(`SetupModal unknown step: ${step}`)
    return null
  }
}

const ModalComponent = ({
  show,
  title,
  body,
  options,
  onClick,
  onResolve,
  errorMessage,
  escapable
}) => {
  let canEscape = escapable
  let buttons
  if (options && options.length) {
    canEscape = false
    buttons = options.map(
      (option, i) => ButtonTag(option.text, clickAndResolve(option.onClick, onResolve), i)
    )
  } else {
    buttons = [
      ButtonTag('OK', clickAndResolve(onClick, onResolve))
    ]
  }
  return (
    <Modal
      isOpen={show}
      contentLabel={title}
      onRequestClose={actions.onHideModal}
      shouldCloseOnOverlayClick={canEscape}
      shouldCloseOnEscape={canEscape}
      closeTimeoutMS={500}
      className={'ModalContent'}
    >
      <div className='modal-container'>
        { TitleTag(title) }
        { BodyTag(body) }
        <div className='modal-buttons'>
          { buttons }
        </div>
        <div className='modal-error'>
          { errorMessage }
        </div>
      </div>
    </Modal>
  )
}

export default ModalComponent
