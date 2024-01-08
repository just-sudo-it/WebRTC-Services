import { type Server, type Socket } from 'socket.io';
import logger from '../utils/Logger';

const chatController = (socket: Socket, io: Server): void => {
  socket.on('chat-message', (data: { username:string, message: string, roomId: string }) => {
    const { username, message, roomId } = data;
    logger.info('message received: ' + message 
    + ' in room: ' + roomId 
    + ' from user: ' + username
    + ' from socket: ' + socket.id)

    if (!roomId) {
      console.error('Room ID is required for sending chat messages');
      return;
    }

    // Emit to clients in the specified room
    logger.info('Emitting chat-message to room: ' + roomId);
    io.to(roomId).emit('chat-message', data);
  });
}

export default chatController;
