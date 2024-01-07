import { type Server, type Socket } from 'socket.io';
import { type FileData } from '../models/FileData';

const fileController = (socket: Socket, io: Server): void => {
  socket.on('file-share', (fileData: FileData, roomId: string) => {
    if (!roomId) {
      console.error('Room ID is required for file sharing');
      return;
    }

    io.to(roomId).emit('file-share', { sender: socket.id, file: fileData });
  });
}

export default fileController;
