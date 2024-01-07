import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SocketService } from '../services/socket.service'; // Import the Socket service

@Component({
  selector: 'app-video-call',
  templateUrl: './video-call.component.html',
  styleUrls: ['./video-call.component.css']
})
export class VideoCallComponent implements OnInit, OnDestroy {
  @ViewChild('localvideo') localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remotevideo') remoteVideo!: ElementRef<HTMLVideoElement>;

  private localStream : MediaStream;
  private remoteStream : MediaStream;
  private connection!: RTCPeerConnection;

  isOnCall = false;
  roomId = 'defaultRoom'; // Asuming a default room or dynamically set
  messages: string[] = [];
  participants: string[] = [];
  newMessage: string = ''; // Add this line

  constructor(private socketService: SocketService) {
    this.localStream = new MediaStream();
    this.remoteStream = new MediaStream();
  }

  ngOnInit(): void {
    this.setupConnection();
    this.setupSocketListeners();
    this.joinRoom();
  }

  ngOnDestroy(): void {
    this.localStream?.getTracks().forEach(track => track.stop());
    this.connection.close();
  }

  private setupConnection() {
    const serverConfig = {
      iceServers: [{ urls: ["stun:stun.l.google.com:19302", "stun:stun2.l.google.com:19302"] }],
      iceCandidatePoolSize: 10
    };

    this.connection = new RTCPeerConnection(serverConfig);

    this.connection.ontrack = event => {
      event.streams[0].getTracks().forEach(track => {
        this.remoteStream.addTrack(track);
      });
    };

    this.setupVideoCall();
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
  }

  private async handleOffer(data: any) {
    if (!this.isOnCall) {
      await this.connection.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answerDescription = await this.connection.createAnswer();
      await this.connection.setLocalDescription(answerDescription);
      this.socketService.emit('answer', {
        answer: answerDescription,
        target: data.sender // Assuming the sender's ID is sent with the offer
      });
    }
  }

  private async handleAnswer(data: any) {
    if (!this.connection.currentRemoteDescription) {
      await this.connection.setRemoteDescription(new RTCSessionDescription(data.answer));
    }
  }

  private async handleIceCandidate(data: any) {
    if (data.candidate) {
      await this.connection.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
  }

  async toggleCall() {
    if (!this.isOnCall) {
      const offerDescription = await this.connection.createOffer();
      await this.connection.setLocalDescription(offerDescription);
      this.socketService.emit('call-user', { offer: offerDescription });
    } else {
      // End the call logic here
    }
    this.isOnCall = !this.isOnCall;
  }

  joinRoom() {
    this.socketService.emit('join-room', this.roomId);
  }

  sendMessage(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const message = inputElement.value;
    console.log(message);
    this.socketService.emit('chat-message', { message, roomId: this.roomId });
    this.messages.push(message); // Optionally add to local state
  }
}
