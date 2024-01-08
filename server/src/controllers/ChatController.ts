import { type Server, type Socket } from 'socket.io';
import logger from '../utils/Logger';

const chatController = (socket: Socket, io: Server): void => {
  socket.on('chat-message', (data: { message: string, roomId: string }) => {
    const { message, roomId } = data;
    logger.info('message received: ' + message + ' in room: ' + roomId + ' from socket: ' + socket.id)

    if (!roomId) {
      console.error('Room ID is required for sending chat messages');
      return;
    }

    // Emit to clients in the specified room
    logger.info('emitting chat-message to room: ' + roomId);
    io.to(roomId).emit('chat-message', { sender: socket.id, message });
  });
}

export default chatController;
