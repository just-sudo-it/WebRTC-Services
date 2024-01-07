/* eslint-disable @typescript-eslint/no-dynamic-delete */
import { type Server, type Socket } from 'socket.io'
import Participant from '../models/Participant'

import { meetingRoomService } from '../services/MeetingRoomService'

const participantsController = (socket: Socket, io: Server): void => {
  socket.on('join', (name: string) => {
    const participant = new Participant(socket.id, name)
    meetingRoomService.addParticipantToRoom(socket.id, participant.roomId, participant.userId)
    io.emit('participants-list', Array.from(meetingRoomService.getParticipantsInRoom(participant.roomId)))
  })

  socket.on('disconnect', () => {
    meetingRoomService.removeParticipantFromRoom(socket.id)
    // Update participants list for all clients
    io.emit('participants-list', Array.from(meetingRoomService.getParticipantsInRoom(socket.id))) // Adjust roomId if necessary
  })
}

export default participantsController
