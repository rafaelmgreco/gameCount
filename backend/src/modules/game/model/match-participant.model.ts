import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { MatchModel } from './match.model';
import { PlayerModel } from './player.model';
import { DeckModel } from './deck.model';

@Entity('match_participants')
@Unique('UQ_match_player', ['match', 'player'])
export class MatchParticipantModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  seatOrder: number;

  @ManyToOne(() => MatchModel, (match) => match.participants, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  match: MatchModel;

  @ManyToOne(() => PlayerModel, (player) => player.participations, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  player: PlayerModel;

  @ManyToOne(() => DeckModel, (deck) => deck.participations, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  deck: DeckModel;
}
