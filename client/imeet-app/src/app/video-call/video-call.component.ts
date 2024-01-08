import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { v4 as uuidv4 } from 'uuid'; // Import UUID
import { ChatMessage } from '../../../../../server/src/models/ChatMessage'; // Import the ChatMessage type
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
  private connection!: RTCPeerConnection;

  isOnCall = false;
  roomId = 'defaultRoom'; // Asuming a default room or dynamically set
  messages: ChatMessage[] = []; // Update the type here
  videoEnabled: boolean = true;
  audioEnabled: boolean = true;
    participants: string[] = [];
  newMessage: string = ''; // Add this line

  constructor(private socketService: SocketService) {
    this.username = `user${uuidv4().slice(0, 6)}`; // Generate a unique username

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

    this.socketService.on('chat-message', (data: { sender: string, message: string }) => {
      console.log('!!Received message: ', data.message);
      console.log('!!sender: ', data.sender);
      console.log('!!username: ', this.username);

      const displaySender = data.sender == this.username ? 'Me' : data.sender;
      this.messages.push({
        sender: displaySender,
        content: data.message
      });
    });
  }

  private async handleOffer(data: any) {
    if (!this.isOnCall) {
      await this.connection.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answerDescription = await this.connection.createAnswer();
      await this.connection.setLocalDescription(answerDescription);
      this.socketService.emitAnswer(answerDescription,data.sender);
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
    console.log("toggled call button");
    if (!this.isOnCall) {
      const offerDescription = await this.connection.createOffer();

      console.log("offer description: " + offerDescription);

      await this.connection.setLocalDescription(offerDescription);
      this.socketService.emit('call-user', { offer: offerDescription });
    } else {
      // End the call logic here
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

  joinRoom() {
    this.socketService.joinRoom(this.roomId,this.username);
  }

  sendMessage() {
    console.log('Sending message: ', this.newMessage);
    if (this.newMessage.trim()) {
      this.socketService.emitMessage(this.newMessage, this.roomId, this.username)
      this.messages.push({
        sender: 'Me',
        content: this.newMessage
      });
      this.newMessage = '';
    }
  }

  updateMessage(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.newMessage = inputElement.value;
  }
}
