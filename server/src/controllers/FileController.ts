import { type Server, type Socket } from 'socket.io'
import { type FileData } from '../models/FileData'

const fileController = (socket: Socket, io: Server): void => {
  socket.on('file-share', (fileData: FileData) => {
    // Implement more complex file sharing logic here
    socket.broadcast.emit('file-share', { sender: socket.id, file: fileData })
  })
}

export default fileController
