import { Socket } from 'phoenix'

export const connect = () => {
  const scheme = location.protocol.startsWith('https') ? 'wss' : 'ws'
  const url = location.port === "" ? location.hostname : `${location.hostname}:${location.port}`
  let socket = new Socket(`${scheme}://${url}/socket`, {})
  socket.connect()
  return socket
}

export const disconnect = (socket) => {
  if (!socket) { return }
  socket.disconnect(() => console.log('Bye Socket!'))
}

export const join = (socket, gid) => {
  const channel = socket.channel(`game:${gid}`, {})
  channel
    .join()
    .receive("ok", payload => console.log('Connected to channel', payload))
    .receive("error", resp => console.log("Unable to join", resp));
  return channel
}

export const leave = (channel) => {
  if (!channel) { return }
  channel.leave().receive('ok', () => console.log("left channel"))
}

export const channelActions = (channel) => {
  return {
    startGame: (name, sides) => channel.push('game:start', { name, sides }),
    joinGame: (game) => channel.push('game:join', { game }),
    updateGame: (state) => channel.push('game:update', { game: state }),
    drawCards: (count) => channel.push('deck:draw', { count }),
  }
}
