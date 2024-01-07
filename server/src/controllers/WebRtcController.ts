import { type Server, type Socket } from 'socket.io'
import { type IceCandidateData } from '../models/IceCandidateData'
import { type WebRtcData } from '../models/WebRtcData'

const webRTCController = (socket: Socket, io: Server): void => {
  socket.on('offer', (data: WebRtcData) => {
    socket.to(data.target).emit('offer', { sender: socket.id, sdp: data.sdp })
  })

  socket.on('answer', (data: WebRtcData) => {
    socket.to(data.target).emit('answer', { sender: socket.id, sdp: data.sdp })
  })

  socket.on('ice-candidate', (data: IceCandidateData) => {
    socket.to(data.target).emit('ice-candidate', { sender: socket.id, candidate: data.candidate })
  })
}

export default webRTCController
