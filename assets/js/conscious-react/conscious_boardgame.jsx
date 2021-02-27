import React from 'react'

import Channel from './channel'
import Store from './reducers/store'
import { renderRoot, ConsciousBoardgame } from './components/root'
import { getGameId, generateGameId, getPlayerId } from './constants'

const gid = getGameId() || generateGameId()
console.log("gid="+gid)

const pid = getPlayerId()
console.log("pid="+pid)

const channel = new Channel()
channel.join(gid)
const render = renderRoot(channel)

// re-render each redux store change
Store.subscribe(render)

export default ConsciousBoardgame
