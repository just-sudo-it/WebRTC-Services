import Participant from '../models/Participant'

class MeetingRoomService {
  private readonly activeRooms = new Map<string, Set<string>>()
  private readonly participantDetails = new Map<string, Participant>()

  addParticipantToRoom (socketId: string, roomId: string, userId: string): void {
    if (!socketId || !roomId || !userId) {
      throw new Error('Invalid arguments for adding participant to room')
    }

    const roomParticipants = this.activeRooms.get(roomId) ?? new Set<string>()
    roomParticipants.add(userId)
    this.activeRooms.set(roomId, roomParticipants)

    this.participantDetails.set(socketId, new Participant(userId, roomId))
  }

  removeParticipantFromRoom (socketId: string): Participant | null {
    const participant = this.participantDetails.get(socketId)
    if (!participant) return null

    const { roomId } = participant
    const roomParticipants = this.activeRooms.get(roomId)
    roomParticipants?.delete(socketId)

    if (roomParticipants?.size === 0) {
      this.activeRooms.delete(roomId)
    }

    this.participantDetails.delete(socketId)
    return participant
  }

  getParticipantsInRoom (roomId: string): Set<string> {
    if (!roomId) {
      throw new Error('Room ID is required to get participants')
    }
    return this.activeRooms.get(roomId) ?? new Set<string>()
  }
}

export const meetingRoomService = new MeetingRoomService()
