import React from 'react'
import redux from './redux'
import { renderRoot, ConsciousBoardgame } from './components/layout'

// initialize a new game
redux.store.subscribe(renderRoot())

export default ConsciousBoardgame
