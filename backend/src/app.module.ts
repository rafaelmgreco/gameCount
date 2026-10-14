import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameModule } from './modules/game/game.module';
import { PlayerModel } from './modules/game/model/player.model';
import { DeckModel } from './modules/game/model/deck.model';
import { MatchModel } from './modules/game/model/match.model';
import { MatchParticipantModel } from './modules/game/model/match-participant.model';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST', '127.0.0.1'),
        port: configService.get<number>('DB_PORT', 3306),
        username: configService.get<string>('DB_USERNAME', 'root'),
        password: configService.get<string>('DB_PASSWORD', 'root'),
        database: configService.get<string>('DB_DATABASE', 'commander_tracker'),
        entities: [PlayerModel, DeckModel, MatchModel, MatchParticipantModel],
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        migrationsRun: configService.get<string>('DB_MIGRATIONS_RUN', 'true') === 'true',
        synchronize: configService.get<string>('DB_SYNCHRONIZE', 'false') === 'true',
      }),
    }),
    GameModule,
  ],
})
export class AppModule {}
