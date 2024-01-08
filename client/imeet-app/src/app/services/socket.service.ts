import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { FileData } from '../../../../../server/src/models/FileData';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io('http://localhost:5000');
  }

  emit(event: string, data: any) {
    this.socket.emit(event, data);
  }

  on(event: string, callback: (data: any) => void) {
    this.socket.on(event, callback);
  }

  joinRoom(roomId: string, username: string): void {
    this.emit('join', { roomId, username });
  }

  emitMessage(username: string,message: string, roomId: string): void {
    this.emit('chat-message', { username, message, roomId });
  }

  emitOffer(offer: RTCSessionDescriptionInit, target: string): void {
    this.emit('offer', { offer, target });
  }

  emitAnswer(answer: RTCSessionDescriptionInit, target: string): void {
    this.emit('answer', { answer, target });
  }

  emitIceCandidate(candidate: RTCIceCandidate, target: any): void {
    this.emit('ice-candidate', { candidate, target });
  }

  emitFileShare(fileData: FileData, roomId: string): void {
    this.emit('file-share', { fileData, roomId });
  }

  shareFile(file: File, roomId: string): void {
    const reader = new FileReader();
    reader.onload = (event: any) => {
        const fileData = {
            name: file.name,
            type: file.type,
            size: file.size,
            content: event.target.result
        };

        this.emitFileShare(fileData, roomId);
    };
    reader.readAsDataURL(file);
}


  onFileReceived(callback: (fileData: any) => void): void {
    this.on('file-received', callback);
  }

  onChatMessage(callback: (data: any) => void): void {
    this.on('chat-message', callback);
  }
}
