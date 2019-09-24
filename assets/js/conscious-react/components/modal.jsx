import React from 'react'
import Modal from 'react-modal'

const ButtonTag = (text, onClick, key=1) => <button key={key} onClick={onClick}>{text}</button>
const TitleTag = (title) => title && <h1 className='modal-title'>{title}</h1>
const BodyTag = (body) => body && <p className='modal-body'>{body}</p>
const clickAndHide = (click, hide) => () => { click(); hide() }

const ModalComponent = ({
  showModal,
  modalProps
}) => {
  const { title, body, options, onClose, hideModal } = modalProps
  let escapable = modalProps.escapable
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
