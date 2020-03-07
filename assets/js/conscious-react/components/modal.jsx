import React from 'react'
import Modal from 'react-modal'
import redux from '../redux'
import actions from '../actions'
import { TURNS } from '../constants'

const ButtonTag = (text, onClick, key=1) => <button key={key} onClick={onClick}>{text}</button>
const TitleTag = (title) => title && <h1 className='modal-title'>{title}</h1>
const BodyTag = (body) => body && <div className='modal-body'>{body}</div>
const clickAndHide = (onClick, hide) => () => { onClick(); hide() }

const hideModal = () => redux.store.dispatch(actions.hideModal())
const updateModal = (field, value) => redux.store.dispatch(actions.updateModal({ field, value }))
const onNameChange = (event) => updateModal('name', event.target.value)
const onDiceChange = (event) => updateModal('sides', event.target.value)
const onGameChange = (event) => updateModal('game', event.target.value)

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
  const modalProps = {
    title: `Welcome to the Conscious Boardgame!`,
    escapable: false,
    errorMessage,
    options,
    body
  }
  return <ModalComponent showModal={true} modalProps={modalProps} />
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
        <input type="text" name="player_name" value={name} onChange={onNameChange} />
      </label>
      <label name="dice">
        Dice sides:<br />
        <input type="radio" group="dice" value="6" checked={sides==6} onChange={onDiceChange} /><span>6</span>
        <input type="radio" group="dice" value="10" checked={sides==10} onChange={onDiceChange} /><span>10</span>
      </label>
    </div>
  const modalProps = {
    title: `Get Started`,
    escapable: false,
    onClose: onStart,
    body
  }
  return <ModalComponent showModal={true} modalProps={modalProps} />
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
  showModal,
  modalProps
}) => {
  const { title, body, options, onClose, errorMessage } = modalProps
  let { escapable } = modalProps
  let buttons
  if (options && options.length) {
    escapable = false
    buttons = options.map(
      (option, i) => ButtonTag(option.text, clickAndHide(option.onClick, hideModal), i)
    )
  } else {
    buttons = [
      ButtonTag('OK', () => {
        if (typeof(onClose)==='function') {
          onClose()
        }
        hideModal()
      })
    ]
  }
  return (
    <Modal
      isOpen={showModal}
      contentLabel={title}
      onRequestClose={hideModal}
      shouldCloseOnOverlayClick={escapable}
      shouldCloseOnEscape={escapable}
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
