import { type Server, type Socket } from 'socket.io'
import { type ICECandidateData, type WebRTCData } from '../types/CustomTypes'

const webRTCController = (socket: Socket, io: Server): void => {
  socket.on('offer', (data: WebRTCData) => {
    socket.to(data.target).emit('offer', { sender: socket.id, sdp: data.sdp })
  })

  socket.on('answer', (data: WebRTCData) => {
    socket.to(data.target).emit('answer', { sender: socket.id, sdp: data.sdp })
  })

  socket.on('ice-candidate', (data: ICECandidateData) => {
    socket.to(data.target).emit('ice-candidate', { sender: socket.id, candidate: data.candidate })
  })
}

export default webRTCController
