import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { DeckModel } from './deck.model';
import { MatchModel } from './match.model';
import { MatchParticipantModel } from './match-participant.model';

@Entity('players')
export class PlayerModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @OneToMany(() => DeckModel, (deck) => deck.player)
  decks: DeckModel[];

  @OneToMany(() => MatchModel, (match) => match.winner)
  wonMatches: MatchModel[];

  @OneToMany(() => MatchParticipantModel, (participant) => participant.player)
  participations: MatchParticipantModel[];
}
