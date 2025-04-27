import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameComponent } from './game/game.component';
import { StartGameComponent } from './start-game/start-game.component';
import { LobbyComponent } from './lobby/lobby.component';

const routes: Routes = [
  {
    path: 'lobby',
    component: LobbyComponent
  },
  {
    path: 'start-game',
    component: StartGameComponent
  },
  {
    path: 'game',
    component: GameComponent
  },
  {
    path: '**',
    redirectTo: 'lobby',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
