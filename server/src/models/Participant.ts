class Participant {
  userId: string
  roomId: string
  socketId: string

  constructor (socketId:string,userId: string, roomId: string) {
    this.socketId = socketId;
    this.userId = userId
    this.roomId = roomId
  }
}

export default Participant
