import { type Server, type Socket } from 'socket.io'
import Participant from '../models/Participant'
import { meetingRoomService } from '../services/MeetingRoomService'

const participantsController = (socket: Socket, io: Server): void => {
  socket.on('join', (name: string, roomId: string) => {
    // Assuming that roomId is passed along with the name when the client emits 'join'
    const participant = new Participant(socket.id, roomId)
    meetingRoomService.addParticipantToRoom(socket.id, participant.roomId, participant.userId)

    io.to(participant.roomId).emit('participants-list', Array.from(meetingRoomService.getParticipantsInRoom(participant.roomId)))
  })

  socket.on('disconnect', () => {
    const participant = meetingRoomService.removeParticipantFromRoom(socket.id)
    if (participant) {
      io.to(participant.roomId).emit('participants-list', Array.from(meetingRoomService.getParticipantsInRoom(participant.roomId)))
    }
  })
}

export default participantsController
