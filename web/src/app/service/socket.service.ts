import { Injectable } from '@angular/core';
import {io, Socket} from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private socket: Socket;
  baseUrl = 'http://localhost:3000';

  constructor() {
    this.socket = io(this.baseUrl, { transports: ['websocket'] });

    this.socket.on('connect', () => {
      console.log('✅ Connected to Socket.io:', this.socket.id);
    });
  }

  joinRoom(data: { name: string, room: string }) {
    this.socket.emit('joinRoom', data);
  }

  onPlayerJoined(callback: (data: any) => void) {
    this.socket.on('playerJoined', callback)
  }

  sendPlayerMove(move: string, room: string) {
    this.socket.emit('playerMove', { move, room });
  }

  onMatchResult(callback: (data: any) => void) {
    this.socket.off('matchResult');
    this.socket.on('matchResult', callback);
  }

  startTournament(room: string, rounds: number) {
    this.socket.emit('startTournament', { room, rounds })
  }

  onTournamentStart(callback: (data: any) => void) {
    this.socket.on('tournamentStarted', callback);
  }

  emitPlayAgain(room: string) {
    this.socket.emit('playAgain', { room })
  }
}
