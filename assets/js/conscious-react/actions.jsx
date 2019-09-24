import React from 'react'

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
  hideModal,
  showModal,
}
