import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { v4 as uuidv4 } from 'uuid'; // Import UUID
import { ChatMessage } from '../../../../../server/src/models/ChatMessage'; // Import the ChatMessage type
import { FileData } from '../../../../../server/src/models/FileData';
import { WebRtcData } from '../../../../../server/src/models/WebRtcData'; // Import the ChatMessage type
import { SocketService } from '../services/socket.service'; // Import the Socket service

@Component({
  selector: 'app-video-call',
  templateUrl: './video-call.component.html',
  styleUrls: ['./video-call.component.css']
})
export class VideoCallComponent implements OnInit, OnDestroy {
  @ViewChild('localvideo') localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remotevideo') remoteVideo!: ElementRef<HTMLVideoElement>;

  public username: string;

  private localStream : MediaStream;
  private remoteStream : MediaStream;
  private connection! : RTCPeerConnection;
  private dataChannel!: RTCDataChannel;
  private receivedBuffers: ArrayBuffer[] = [];
  private readonly MAX_CHUNK_SIZE = 16384; // 16 KB
  private readonly END_OF_FILE_MESSAGE = 'EOF';

  isOnCall = false;
  hasJoinedRoom: boolean = false;
  roomId = 'defaultRoom'; // Asuming a default room or dynamically set
  messages: ChatMessage[] = []; // Update the type here
  videoEnabled: boolean = true;
  audioEnabled: boolean = true; //
  participants: string[] = [];
  newMessage: string = ''; // Add this line
  sharedFiles: FileData[] = [];

  constructor(private socketService: SocketService) {
    this.username = `user${uuidv4().slice(0, 6)}`; // Generate a unique username

    this.localStream = new MediaStream();
    this.remoteStream = new MediaStream();
  }

  ngOnInit(): void {
    this.setupConnection();
    this.setupSocketListeners();
    //this.joinRoom();
  }

  ngOnDestroy(): void {
    this.localStream?.getTracks().forEach(track => track.stop());
    this.connection.close();
    this.dataChannel.close();
    this.disconnectCall();
  }


  joinRoom() {
    if(this.roomId.trim()) {
      this.setupVideoCall();
      this.socketService.joinRoom(this.roomId, this.username);
      this.hasJoinedRoom = true;
    }
  }
  createAndJoinRoom() {
    this.roomId = uuidv4().slice(0, 8); // Create a random room ID
    this.joinRoom();
  }

  private setupConnection() {
    const serverConfig = {
      iceServers: [{ urls: ["stun:stun.l.google.com:19302", "stun:stun2.l.google.com:19302"] }],
      iceCandidatePoolSize: 10
    };

    this.connection = new RTCPeerConnection(serverConfig);

    this.connection.ontrack = event => {
      console.log("Event : "+event)
      if (this.remoteVideo.nativeElement.srcObject !== event.streams[0]) {
        this.remoteVideo.nativeElement.srcObject = event.streams[0];
      }

      event.streams[0].getTracks().forEach(track => {
        this.remoteStream.addTrack(track);
      });
    };

    this.connection.onicecandidate = async event => {
      console.log("Event candidate: "+event.candidate)
      event.candidate
      && event.candidate.sdpMLineIndex
      && event.candidate.sdpMid
      && await this.handleIceCandidate(event.candidate);
    };

    //for file sharing:
    const dataChannelOptions = {
      ordered: true, // do not guarantee order
      maxPacketLifeTime: 3000, // in milliseconds
    };
    this.dataChannel = this.connection.createDataChannel("filetransfer",dataChannelOptions);
    this.dataChannel.binaryType = 'arraybuffer';
    this.connection.ondatachannel = (event :RTCDataChannelEvent ) => {
      this.handleDataChannel(event);
    };
}
  handleDataChannel(event: RTCDataChannelEvent) {
    let receiveChannel = event.channel;
    receiveChannel.onopen = () => console.log("Data Channel Opened");
    receiveChannel.onclose = () => {console.log("The Data Channel is Closed");};
    receiveChannel.onerror = function (error) { console.log("Data Channel Error:", error);};
    receiveChannel.onmessage = (event) =>{
      console.log("Data Channel Message received");
      this.handleIncomingData(event.data);
    }
  }
   handleSendChannelStatusChange(event : RTCDataChannelEvent) {
    if (this.dataChannel) {
      if (this.dataChannel.readyState === "open") {
        console.log("Data channel open and ready to send");
      }
       else {
        console.log("Data channel not ready to send");
      }
    }
  }

  private async setupVideoCall() {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      this.localVideo.nativeElement.srcObject = this.localStream;
      this.localStream.getTracks().forEach((track) => {
        this.connection.addTrack(track, this.localStream);
      });
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  }

  private setupSocketListeners() {
    this.socketService.on('offer', (data: any) => {
      this.handleOffer(data);
    });

    this.socketService.on('answer', (data: any) => {
      this.handleAnswer(data);
    });

    this.socketService.on('ice-candidate', (data: any) => {
      this.handleIceCandidate(data);
    });

    this.socketService.onParticipantList((participants: string[]) => {
      console.log('participants');
      this.participants = participants;
    });

    this.socketService.on('chat-message', (data: { username: string, message: string, roomId: string }) => {
      const displaySender = data.username == this.username ? 'Me' : data.username;
      this.messages.push({
        sender: displaySender,
        content: data.message
      });
    });
  }

  private async handleOffer(data: WebRtcData) {
    console.log('offer received');
    console.log(data);
    await this.connection.setRemoteDescription(new RTCSessionDescription(data.offer));
    const answerDescription = await this.connection.createAnswer();
    await this.connection.setLocalDescription(answerDescription);
    console.log('Initiating answer ');
    this.socketService.emitAnswer(answerDescription, data.sender);

    console.log("Answer desc : "+answerDescription);
    //fires when remote answers
    if(!this.connection.currentRemoteDescription && data?.answer) {
      const answerdesc  = new RTCSessionDescription(answerDescription )
      this.connection.setRemoteDescription(answerdesc);
      console.log(this.connection.currentRemoteDescription);
      console.log(data);
    }

  }

  private async handleAnswer(data: any) {
    if (!this.connection.currentRemoteDescription) {
      await this.connection.setRemoteDescription(new RTCSessionDescription(data.answer));
    }
  }

  private async handleIceCandidate(data: any) {
    if (data.candidate) {
      console.log(data)
      console.log(data.candidate.sdpMid)
      console.log(data.candidate.sdpMLineIndex)
      await this.connection.addIceCandidate(
        new RTCIceCandidate(
          {
            candidate :data.candidate,
            sdpMid :data.sdpMid ?? data.candidate.id ,
            sdpMLineIndex :data.sdpMLineIndex ??  data.candidate.label}));
    }
  }

  disconnectCall(): void {
    // Logic to disconnect from the call
      this.localStream?.getTracks().forEach(track => track.stop());
      this.socketService.emit('manual-disconnect', { roomId: this.roomId, username: this.username });
  }

  async toggleCall() {
    console.log("toggled call button");
    if (!this.isOnCall) {
      const offerDescription = await this.connection.createOffer();

      console.log("offer description: " + offerDescription);

      await this.connection.setLocalDescription(offerDescription);
      this.socketService.emit('offer', { offer: offerDescription , target: this.roomId});
    } else
    {
      // End the call
      this.connection.close();
      this.connection = new RTCPeerConnection();
      this.socketService.emit('manual-disconnect', { roomId: this.roomId, username: this.username });
      this.setupConnection();
      this.setupSocketListeners();
    }
    this.isOnCall = !this.isOnCall;
  }

  toggleVideo(): void {
    this.localStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
    this.videoEnabled = !this.videoEnabled;
  }

  toggleAudio(): void {
    this.localStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
    this.audioEnabled = !this.audioEnabled;
  }

  shareFile(event: any) {
    const file = event.target.files[0];
    console.log(file);
    if (file) {
      const fileReader = new FileReader();
      let offset = 0;

      fileReader.onload = (event: any) => {
        this.dataChannel.send(event.target.result);
        offset += event.target.result.byteLength;
        if (offset < file.size) {
          readChunk(offset);
        } else {
          this.dataChannel.send(this.END_OF_FILE_MESSAGE);
        }
      };

      const readChunk = (offset: number) => {
        const slice = file.slice(offset, offset + this.MAX_CHUNK_SIZE);
        fileReader.readAsArrayBuffer(slice);
      };

      readChunk(0);
    }
}

private handleIncomingData(data: any) {
  console.log("Incoming data");
  if (data !== this.END_OF_FILE_MESSAGE) {
    this.receivedBuffers.push(data);
  } else {
    const blob = new Blob(this.receivedBuffers);
    console.log('received files'+this.sharedFiles);
    this.sharedFiles.push({ name: 'receivedFile', content: blob }); // Add metadata as needed
    console.log('received files'+this.sharedFiles);
    this.receivedBuffers = [];
  }
}

 downloadFile(blob: Blob, fileName: string) {
    const a = document.createElement('a');
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  sendMessage() {
    if (this.newMessage.trim()) {
      this.socketService.emitMessage(this.username,this.newMessage, this.roomId)
      this.newMessage = '';
    }
  }

  updateMessage(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.newMessage = inputElement.value;
  }
}
