/* eslint-disable @typescript-eslint/no-dynamic-delete */
import { type Server, type Socket } from 'socket.io'
import Participant from '../models/Participant'

const participants: Record<string, Participant> = {}

const participantsController = (socket: Socket, io: Server) => {
  socket.on('join', (name: string) => { // Explicitly type the 'name' parameter as a string
    participants[socket.id] = new Participant(socket.id, name)
    io.emit('participants-list', Object.values(participants))
  })

  socket.on('disconnect', () => {
    delete participants[socket.id]
    io.emit('participants-list', Object.values(participants))
  })
}

export default participantsController
