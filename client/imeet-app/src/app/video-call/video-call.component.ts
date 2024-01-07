import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-video-call',
  templateUrl: './video-call.component.html',
  styleUrls: ['./video-call.component.css']
})
export class VideoCallComponent implements AfterViewInit {
  @ViewChild('localVideo') localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef<HTMLVideoElement>;

  ngAfterViewInit() {
    this.setupVideoCall();
  }

  async setupVideoCall() {
    try {
      let localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      this.localVideo.nativeElement.srcObject = localStream;
    } catch (error) {
      console.error('Error accessing media devices.', error);
    }
  }


  async setup(){
    var serverConfig = {
      iceServers:[
        {
          urls:["stun:stun.l.google.com:19302", "stun:stun2.l.google.com:19302"]
        }
      ],
      iceCandidatePoolSize:10,
    };

    let pc = new RTCPeerConnection(serverConfig);

    let localStream: MediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });;
    let remoteStream: MediaStream= new MediaStream();

      localStream.getTracks().forEach((track: MediaStreamTrack) => {
        pc.addTrack(track, localStream);
      });

    pc.ontrack = event => {
      event.streams[0].getTracks().forEach(track => {
          remoteStream.addTrack(track);
      });
    };

    this.localVideo
    this.localVideo.nativeElement.srcObject = localStream;
    this.remoteVideo.nativeElement.srcObject = remoteStream;

  }
}
