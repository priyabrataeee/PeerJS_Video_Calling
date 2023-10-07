// video-chat.component.ts
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import Peer from 'peerjs';

@Component({
  selector: 'app-video-chat',
  templateUrl: './video-chat.component.html',
  styleUrls: ['./video-chat.component.css'],
})
export class VideoChatComponent implements OnInit, OnDestroy {
  @ViewChild('localVideo') localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef<HTMLVideoElement>;

  private peer!: Peer;
  private localStream: MediaStream | undefined; // Initialize as undefined
  private remoteStream: MediaStream | undefined; // Initialize as undefined
  private peerId!: string; // Use "!" to indicate it will be initialized later

  constructor() {}

  ngOnInit(): void {
    this.peer = new Peer();

    this.peer.on('open', (id) => {
      this.peerId = id;
    });

    // Rest of your code...
  }

  startCall() {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        this.localStream = stream; // Assign the local stream here
        this.localVideo.nativeElement.srcObject = stream;

        // Continue with your call setup
        const remotePeerId = prompt('Enter the peer ID of the person you want to call:');
        if (remotePeerId) {
          const call = this.peer.call(remotePeerId, stream);

          call.on('stream', (remoteStream) => {
            this.remoteStream = remoteStream;
            this.remoteVideo.nativeElement.srcObject = remoteStream;
          });
        }
      })
      .catch((error) => {
        console.error('Error accessing camera and microphone:', error);
      });
  }

  endCall() {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
    }
    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach((track) => track.stop());
    }
  }

  ngOnDestroy(): void {
    this.endCall();
    this.peer.destroy();
  }
}
