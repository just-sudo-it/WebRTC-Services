import { type Server, type Socket } from 'socket.io'

const chatController = (socket: Socket, io: Server): void => {
  socket.on('chat-message', (message: string) => {
    io.emit('chat-message', { sender: socket.id, message })
  })
}

export default chatController
