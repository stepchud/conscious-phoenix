import React from 'react'
import Modal from 'react-modal'
import { gameActions } from '../events'
import { TURNS } from '../constants'

const ButtonTag = (text, onClick, key=1) => <button key={key} onClick={onClick}>{text}</button>
const TitleTag = (title) => title && <h1 className='modal-title'>{title}</h1>
const BodyTag = (body) => body && <div className='modal-body'>{body}</div>
const clickAndResolve = (onClick, onResolve) => async () => {
  onHideModal();
  await onClick();
  if (typeof(onResolve)==='function') { onResolve() }
}

const actions = gameActions()
const onHideModal = () => actions.onHideModal()
const onUpdateModal = (field, value) => actions.onUpdateModal({ field, value })
const onNameChange = (event) => onUpdateModal('name', event.target.value)
const onDiceChange = (event) => onUpdateModal('sides', event.target.value)
const onGameChange = (event) => onUpdateModal('gameId', event.target.value)

const PickGameModal = ({
  gameId,
  onNewGame,
  onJoinGame,
  errorMessage,
}) => {
  const body =
    <div>
      <label name="game">
        Join Game?
        <input type="text" name="game_id" placeholder={'Game ID'} value={gameId} onChange={onGameChange} />
      </label>
    </div>
  const options =  [{
    text: 'New Game',
    onClick: onNewGame,
  }]
  if (onJoinGame) {
    options.push({
      text: 'Join Game',
      onClick: onJoinGame,
    })
  }
  const props = {
    show: true,
    title: `Welcome to the Conscious Boardgame!`,
    escapable: false,
    errorMessage,
    options,
    body
  }
  return <ModalComponent {...props} />
}

const PickNameModal = ({
  name,
  sides,
  onStart,
}) => {
  const body =
    <div>
      <label name="name">
        Hi, what's your name?
        <input type="text" name="name" value={name} onChange={onNameChange} />
      </label>
      <label name="dice">
        Dice sides:<br />
        <input type="radio" group="dice" value="6" checked={sides==6} onChange={onDiceChange} /><span>6</span>
        <input type="radio" group="dice" value="10" checked={sides==10} onChange={onDiceChange} /><span>10</span>
      </label>
    </div>
  const props = {
    show: true,
    title: `Get Started`,
    escapable: false,
    onClick: onStart,
    body
  }
  return <ModalComponent {...props} />
}

export const SetupModal = ({
  step,
  name='',
  sides=6,
  onStart,
  onNewGame,
  gameId,
  onJoinGame,
  errorMessage,
}) => {
  return step===TURNS.setup1
    ? <PickGameModal onNewGame={onNewGame} gameId={gameId} onJoinGame={onJoinGame} errorMessage={errorMessage} />
    : <PickNameModal name={name} sides={sides} onStart={onStart} />
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
      onRequestClose={onHideModal}
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
