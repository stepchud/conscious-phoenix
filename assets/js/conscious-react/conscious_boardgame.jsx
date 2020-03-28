import uuid from 'uuid/v4'
import React from 'react'

import Channel from './channel'
import { reduxStore } from './events'
import { renderRoot, ConsciousBoardgame } from './components/root'
import { GAME_ID } from './constants'

const gid = localStorage.getItem(GAME_ID) || uuid()
const channel = new Channel()
channel.join(gid)
const render = renderRoot(channel)

// re-render each redux store change
reduxStore.subscribe(render)

export default ConsciousBoardgame
