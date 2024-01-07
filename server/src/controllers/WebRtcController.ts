import { type Server, type Socket } from 'socket.io';
import { type IceCandidateData } from '../models/IceCandidateData';
import { type WebRtcData } from '../models/WebRtcData';

const webRTCController = (socket: Socket, io: Server): void => {
  socket.on('offer', (data: WebRtcData) => {
    // Emit the offer to the targeted user
    socket.to(data.target).emit('offer', { sender: socket.id, sdp: data.sdp });
  });
  
  socket.on('answer', (data: WebRtcData) => {
    // Emit the answer back to the original caller
    socket.to(data.target).emit('answer', { sender: socket.id, sdp: data.sdp });
  });

  socket.on('ice-candidate', (data: IceCandidateData) => {
    // Emit the ICE candidate to the other peer
    socket.to(data.target).emit('ice-candidate', { sender: socket.id, candidate: data.candidate });
  });

  socket.on('disconnect', () => {
    // Notify other users that this user has disconnected
    socket.broadcast.emit('user-disconnected', socket.id);
  });
}

export default webRTCController
