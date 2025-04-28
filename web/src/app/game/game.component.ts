import { Component } from '@angular/core';
import { SocketService } from '../service/socket.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent {
  opponent = '';
  room = '';
  result = '';
  myMove = '';
  opponentMove = '';
  buttonDisabled = false;
  playAgainClicked = false;
  score = { me: 0, against: 0 }
  rounds = 0;
  currentRound = 1;
  resultVisible : boolean = false;

  constructor(private socketService: SocketService) { }

  ngOnInit() {
    this.room = localStorage.getItem('room') || '';
    this.opponent = sessionStorage.getItem('opponent') || '';
    this.rounds = parseInt(localStorage.getItem('rounds') || '0', 10)

    // this.socketService.onTournamentStart((data: any) => {
    //   debugger
    //   this.rounds = data.rounds;
    //   console.log(this.rounds)
    //   localStorage.setItem('rounds', data.rounds.toString())
    // });

    this.socketService.onMatchResult((data: any) => {
      this.result = data.result;
      console.log(this.result)
      this.resultVisible = true;
      this.opponentMove = data.opponentMove;

      if (data.result === 'You Won!') {
        this.score.me++;
      }
      else if (data.result === 'You Lost!') {
        this.score.against++;
      }
      // Check if last round and game is over
      if (this.currentRound >= this.rounds) {
        let finalMessage = '';
        if (this.score.me > this.score.against) {
          finalMessage = '🎉 You are the Overall Winner!';
        }
        else if (this.score.me < this.score.against) {
          finalMessage = '😞 You Lost the Tournament!';
        }
        else {
          finalMessage = "It's a Draw!";
        }
        this.result = finalMessage;
      }
    });

    this.socketService.onStartPlayNextRound((data: any) => {
      this.currentRound = data.round;
    });
  }

  choose(move: string) {
    if (this.buttonDisabled) return;
    this.myMove = move;
    this.buttonDisabled = true;
    this.socketService.sendPlayerMove(move, this.room);
  }

  onClickPlayAgain() {
    console.log(this.rounds)
    if(this.currentRound<=this.rounds ){
      this.currentRound++;
      this.playAgainClicked = true;
      this.buttonDisabled = false;
      this.resultVisible = false;
      this.socketService.emitPlayAgain(this.room);
    }
  }
}
