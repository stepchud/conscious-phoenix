import uuid from 'uuid/v4'
import React from 'react'

import Channel from './channel'
import Store from './redux_store'
import { renderRoot, ConsciousBoardgame } from './components/root'
import { getGameId, getPlayerId } from './constants'

let gid = getGameId()
if (gid) {
  console.log("found gid="+gid)
} else {
  // auto-generate a gid locally
  gid = uuid().slice(0, 6)
  console.log("generated new gid="+gid)
}

const pid = getPlayerId()
if (pid) {
  console.log("found pid="+pid)
}

const channel = new Channel()
channel.join(gid)
const render = renderRoot(channel)

// re-render each redux store change
Store.subscribe(render)

export default ConsciousBoardgame
