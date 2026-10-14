import { Body, Controller, Get, Post } from '@nestjs/common';
import { GameApplication } from '../application/game.application';
import { CreatePlayerRequest } from '../application/request/create-player.request';
import { CreateDeckRequest } from '../application/request/create-deck.request';
import { CreateMatchRequest } from '../application/request/create-match.request';

@Controller('game')
export class GameController {
  constructor(private readonly gameApplication: GameApplication) {}

  @Post('players')
  createPlayer(@Body() request: CreatePlayerRequest) {
    return this.gameApplication.createPlayer(request);
  }

  @Get('players')
  listPlayers() {
    return this.gameApplication.listPlayers();
  }

  @Post('decks')
  createDeck(@Body() request: CreateDeckRequest) {
    return this.gameApplication.createDeck(request);
  }

  @Get('decks')
  listDecks() {
    return this.gameApplication.listDecks();
  }

  @Post('matches')
  createMatch(@Body() request: CreateMatchRequest) {
    return this.gameApplication.createMatch(request);
  }

  @Get('matches')
  listMatches() {
    return this.gameApplication.listMatches();
  }
}
