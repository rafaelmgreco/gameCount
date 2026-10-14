import 'dotenv/config';
import { DataSource } from 'typeorm';
import { PlayerModel } from '../modules/game/model/player.model';
import { DeckModel } from '../modules/game/model/deck.model';
import { MatchModel } from '../modules/game/model/match.model';
import { MatchParticipantModel } from '../modules/game/model/match-participant.model';

export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST ?? '127.0.0.1',
  port: Number(process.env.DB_PORT ?? 3306),
  username: process.env.DB_USERNAME ?? 'commander',
  password: process.env.DB_PASSWORD ?? 'commander',
  database: process.env.DB_DATABASE ?? 'commander_tracker',
  entities: [PlayerModel, DeckModel, MatchModel, MatchParticipantModel],
  migrations: ['src/migrations/*{.ts,.js}'],
  synchronize: false,
});
