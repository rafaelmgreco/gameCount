import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PlayerModel } from './player.model';
import { MatchParticipantModel } from './match-participant.model';

@Entity('matches')
export class MatchModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  matchDate: string;

  @Column({ type: 'int' })
  winningTurn: number;

  @ManyToOne(() => PlayerModel, (player) => player.wonMatches, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  winner: PlayerModel;

  @OneToMany(() => MatchParticipantModel, (participant) => participant.match, {
    cascade: true,
  })
  participants: MatchParticipantModel[];

  @CreateDateColumn()
  createdAt: Date;
}
