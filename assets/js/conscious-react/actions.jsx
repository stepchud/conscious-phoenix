import React from 'react'

// Log Actions
const appendLog = (line) => ({ type: 'LOG_APPEND', line })

// Modal Actions
const hideModal = () => ({ type: 'HIDE_MODAL' })

const showModal = (modalProps, hideModal) => ({
  type: 'SHOW_MODAL',
  modalProps: {
    ...modalProps,
    hideModal
  }
})

export default {
  appendLog,
  hideModal,
  showModal,
}
