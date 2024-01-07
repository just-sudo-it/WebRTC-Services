class Participant {
  userId: string
  roomId: string

  constructor (userId: string, roomId: string) {
    this.userId = userId
    this.roomId = roomId
  }
}

export default Participant
