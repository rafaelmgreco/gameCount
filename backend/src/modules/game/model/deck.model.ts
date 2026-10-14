import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PlayerModel } from './player.model';
import { MatchParticipantModel } from './match-participant.model';

@Entity('decks')
export class DeckModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  commander: string;

  @ManyToOne(() => PlayerModel, (player) => player.decks, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  player: PlayerModel;

  @OneToMany(() => MatchParticipantModel, (participant) => participant.deck)
  participations: MatchParticipantModel[];
}
