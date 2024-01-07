import { type Server, type Socket } from 'socket.io';

const chatController = (socket: Socket, io: Server): void => {
  socket.on('chat-message', (data: { message: string, roomId: string }) => {
    const { message, roomId } = data;

    if (!roomId) {
      console.error('Room ID is required for sending chat messages');
      return;
    }

    // Emit to clients in the specified room
    io.to(roomId).emit('chat-message', { sender: socket.id, message });
  });
}

export default chatController;
