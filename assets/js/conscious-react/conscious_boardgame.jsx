import React from 'react'
import redux from './redux'
import { renderRoot, ConsciousBoardgame } from './components/root'

// initialize a new game, re-render each redux store change
redux.store.subscribe(renderRoot())

export default ConsciousBoardgame
