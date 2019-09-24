import * as React from 'react'
import * as ReactDOM from 'react-dom'
import ReactModal from 'react-modal'
import redux from './redux'
import { ConsciousBoardgame } from './components/layout'

const { store } = redux
const domElement = document.getElementById('Conscious-Boardgame')
ReactModal.setAppElement(domElement)

const render = () => {
  ReactDOM.render(
    <ConsciousBoardgame />,
    domElement
  )
}

store.dispatch({ type: 'START_GAME' })
store.subscribe(render)

document.addEventListener('DOMContentLoaded', () => { render() })

export default ConsciousBoardgame
