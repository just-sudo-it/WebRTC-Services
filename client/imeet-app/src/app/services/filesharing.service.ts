import { Injectable } from '@angular/core';
import { FileData } from '../../../../../server/src/models/FileData'; // Import the 'FileData' type
import { SocketService } from './socket.service';
@Injectable({ providedIn: 'root' })
export class FileSharingService {
  constructor(private socketService: SocketService) {}

  shareFile(fileData: FileData) { // Use the 'FileData' type
    this.socketService.emit('file-share', fileData);
  }

  // Setup listeners for incoming files...
}
