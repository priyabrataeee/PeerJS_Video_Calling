// video-chat.component.ts
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Peer, MediaConnection } from 'peerjs';

@Component({
  selector: 'app-video-chat',
  templateUrl: './video-chat.component.html',
  styleUrls: ['./video-chat.component.css'],
})
export class VideoChatComponent implements OnInit, OnDestroy {
  @ViewChild('localVideo') localVideoRef!: ElementRef;
  @ViewChild('remoteVideo') remoteVideoRef!: ElementRef;

  private peer!: Peer;
  private localStream!: MediaStream;
  private remoteStream!: MediaStream;
  private mediaConnection!: MediaConnection;

  constructor() { }

  ngOnInit(): void {
    this.peer = new Peer();

    this.peer.on('open', (id) => {
      console.log('My peer ID is: ' + id);
    });

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        this.localStream = stream;
        this.localVideoRef.nativeElement.srcObject = stream;
      })
      .catch((error) => {
        console.error('Error accessing camera and microphone: ' + error);
      });

    this.peer.on('call', (call) => {
      call.answer(this.localStream);
      this.mediaConnection = call;
      call.on('stream', (remoteStream) => {
        this.remoteStream = remoteStream;
        this.remoteVideoRef.nativeElement.srcObject = remoteStream;
      });
    });
  }

  ngOnDestroy(): void {
    if (this.mediaConnection) {
      this.mediaConnection.close();
    }
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        track.stop();
      });
    }
  }

  startCall(): void {
    const remotePeerId = prompt('Enter the remote peer ID:');
    if (remotePeerId) {
      const call = this.peer.call(remotePeerId, this.localStream);
      call.on('stream', (remoteStream) => {
        this.remoteStream = remoteStream;
        this.remoteVideoRef.nativeElement.srcObject = remoteStream;
      });
    }
  }

  endCall(): void {
    if (this.mediaConnection) {
      this.mediaConnection.close();
    }
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        track.stop();
      });
    }
    this.remoteVideoRef.nativeElement.srcObject = null;
  }
}
