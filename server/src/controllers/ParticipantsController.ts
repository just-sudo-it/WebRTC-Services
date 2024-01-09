import { type Server, type Socket } from 'socket.io'
import Participant from '../models/Participant'
import { meetingRoomService } from '../services/MeetingRoomService'
import logger from '../utils/Logger'

const participantsController = (socket: Socket, io: Server): void => {
  socket.on('join', (data: { username:string, roomId: string }) => {
    const { username , roomId } = data;
    logger.info('Joining ', roomId,username)

    // Asuming that roomId is passed along with the name when the client emits 'join'
    const participant = new Participant(username, roomId)
    meetingRoomService.addParticipantToRoom(socket.id, participant.roomId, participant.userId)

    socket.join(participant.roomId)

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
