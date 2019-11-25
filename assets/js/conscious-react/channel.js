import { Socket } from 'phoenix'

export const connectSocket = () => {
  let socket = new Socket(`ws://${location.hostname}:4000/socket`, {})
  socket.connect()
  return socket
}

export const joinChannel = (socket, gid) => {
  const channel = socket.channel(`game:${gid}`, {})
  channel
    .join()
    .receive("ok", payload => console.log('Connected to channel', payload))
    .receive("error", resp => console.log("Unable to join", resp));
  return channel
}

export const leave = (channel) => {
  channel.leave().receive('ok', () => console.log("left channel"))
}
