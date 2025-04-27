import { Component } from '@angular/core';
import { SocketService } from '../service/socket.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent {
  name = '';
  room = '';
  players: { name: string }[] = [];

  constructor(private socketService: SocketService, private router: Router) { }

  ngOnInit() {
    this.socketService.onPlayerJoined((data: any) => {
      this.players.push({ name: data.name });
      console.log(this.players)
    })
  }

  onJoinRoom() {
    if(this.name && this.room){
      this.socketService.joinRoom({name: this.name, room: this.room});
      this.players.push({name: this.name});
      this.router.navigate(['/start-game']);

      localStorage.setItem('room', this.room);
    }
  }
}
