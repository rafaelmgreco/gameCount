import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerModel } from './model/player.model';
import { DeckModel } from './model/deck.model';
import { MatchModel } from './model/match.model';
import { MatchParticipantModel } from './model/match-participant.model';
import { PlayerDomain } from './domain/player.domain';
import { DeckDomain } from './domain/deck.domain';
import { MatchDomain } from './domain/match.domain';
import { GameApplication } from './application/game.application';
import { GameController } from './controller/game.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PlayerModel, DeckModel, MatchModel, MatchParticipantModel])],
  controllers: [GameController],
  providers: [PlayerDomain, DeckDomain, MatchDomain, GameApplication],
})
export class GameModule {}
