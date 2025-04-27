import { Component } from '@angular/core';
import { SocketService } from '../service/socket.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-start-game',
  templateUrl: './start-game.component.html',
  styleUrls: ['./start-game.component.scss']
})
export class StartGameComponent {
  room = '';
  opponentName: any;
  selectedRounds = 3;

  constructor(private socketService: SocketService, private router: Router) { }

  ngOnInit() {
    this.room = localStorage.getItem('room') || '';
    this.socketService.onTournamentStart((data: any) => {
      this.opponentName = data.opponent;
      // alert(`Your are playing against ${data.opponent}`)
      sessionStorage.setItem('opponent', data.opponent)
    })
  }

  onClickStart() {
    this.socketService.startTournament(this.room, this.selectedRounds);
    localStorage.setItem('rounds', this.selectedRounds.toString());
    this.router.navigate(['/game'])
  }
}
