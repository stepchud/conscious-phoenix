import * as React from 'react'
import * as ReactDOM from 'react-dom'
import redux from './redux'
import { ConsciousBoardgame } from './components/layout'

const { store } = redux

const render = () => {
  ReactDOM.render(
    <ConsciousBoardgame />,
    document.getElementById('Conscious-Boardgame')
  )
}

store.dispatch({ type: 'START_GAME' })
store.subscribe(render)

document.addEventListener('DOMContentLoaded', () => { render() })

export default ConsciousBoardgame
