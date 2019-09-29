import redux from './redux'
import { renderRoot, ConsciousBoardgame } from './components/layout'

const render = renderRoot()
redux.initGame(render)

export default ConsciousBoardgame
