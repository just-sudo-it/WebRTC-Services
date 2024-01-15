import { type Server, type Socket } from 'socket.io';
import { type IceCandidateData } from '../models/IceCandidateData';
import { type WebRtcData } from '../models/WebRtcData';
import logger from '../utils/Logger';

const webRTCController = (socket: Socket, io: Server): void => {
  socket.on('offer', (data: WebRtcData) => {
    logger.info('offer received')
    // Emit the offer to the targeted user
    socket.to(data.target).emit('offer', { sender: socket.id, offer: data.offer });
  });
  
  socket.on('answer', (data: WebRtcData) => {
    logger.info('answer received')
    // Emit the answer back to the original caller
    socket.to(data.target).emit('answer', { sender: socket.id, answer: data.answer });
  });

  socket.on('ice-candidate', (data: IceCandidateData) => {
    // Emit the ICE candidate to the other peer
    socket.to(data.target).emit('ice-candidate', { sender: socket.id, candidate: data.candidate.toJSON() });
  });
  
}

export default webRTCController
