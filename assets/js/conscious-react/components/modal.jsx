import React from 'react'
import Modal from 'react-modal'
import redux from '../redux'
import actions from '../actions'
import { TURNS } from '../constants'

const ButtonTag = (text, onClick, key=1) => <button key={key} onClick={onClick}>{text}</button>
const TitleTag = (title) => title && <h1 className='modal-title'>{title}</h1>
const BodyTag = (body) => body && <div className='modal-body'>{body}</div>
const clickAndHide = (onClick, hide) => () => { onClick(); hide() }

const onNameChange = (event) => redux.store.dispatch(actions.updateName(event.target.value))
const onDiceChange = (event) => redux.store.dispatch(actions.updateDice(event.target.value))
const hideModal = () => redux.store.dispatch(actions.hideModal())

const PickGameModal = ({
  onNewGame,
  onContinueGame,
  onJoinGame,
}) => {
  const options =  [{
    text: 'New Game',
    onClick: onNewGame,
  }]
  if (onContinueGame) {
    options.push({
      text: 'Continue',
      onClick: onContinueGame,
    })
  }
  if (onJoinGame) {
    options.push({
      text: 'Join Game',
      onClick: onJoinGame,
    })
  }
  const modalProps = {
    title: `Welcome to the Conscious Boardgame!`,
    escapable: false,
    options
  }
  return <ModalComponent showModal={true} modalProps={modalProps} />
}

const PickNameModal = ({
  playerName='',
  sides=6,
  onStart,
}) => {
  const body =
    <div>
      <label name="name">
        Hi, what's your name?
        <input type="text" name="player_name" value={playerName} onChange={onNameChange} />
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
  playerName='',
  sides=6,
  onStart,
  onNewGame,
  onContinueGame,
  onJoinGame,
}) => {
  return step===TURNS.setup1
    ? <PickGameModal onNewGame={onNewGame} onContinueGame={onContinueGame} onJoinGame={onJoinGame} />
    : <PickNameModal playerName={playerName} sides={sides} onStart={onStart} />
}

const ModalComponent = ({
  showModal,
  modalProps
}) => {
  const { title, body, options, onClose } = modalProps
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
      </div>
    </Modal>
  )
}

export default ModalComponent
