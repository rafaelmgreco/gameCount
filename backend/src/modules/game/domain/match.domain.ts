import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MatchModel } from '../model/match.model';
import { MatchParticipantModel } from '../model/match-participant.model';
import { PlayerModel } from '../model/player.model';
import { DeckModel } from '../model/deck.model';

interface CreateParticipantInput {
  seatOrder: number;
  player: PlayerModel;
  deck: DeckModel;
}

@Injectable()
export class MatchDomain {
  constructor(
    @InjectRepository(MatchModel)
    private readonly matchRepository: Repository<MatchModel>,
  ) {}

  async create(
    winner: PlayerModel,
    winningTurn: number,
    participantsInput: CreateParticipantInput[],
    matchDate?: string,
  ): Promise<MatchModel> {
    const participants = participantsInput.map((participant) => {
      return Object.assign(new MatchParticipantModel(), {
        seatOrder: participant.seatOrder,
        player: participant.player,
        deck: participant.deck,
      });
    });

    const match = this.matchRepository.create({
      matchDate,
      winner,
      winningTurn,
      participants,
    });

    const savedMatch = await this.matchRepository.save(match);
    const hydratedMatch = await this.findById(savedMatch.id);

    if (!hydratedMatch) {
      return savedMatch;
    }

    return hydratedMatch;
  }

  async findById(id: number): Promise<MatchModel | null> {
    return this.matchRepository.findOne({
      where: { id },
      relations: {
        winner: true,
        participants: {
          player: true,
          deck: {
            player: true,
          },
        },
      },
    });
  }

  async findAll(): Promise<MatchModel[]> {
    return this.matchRepository.find({
      relations: {
        winner: true,
        participants: {
          player: true,
          deck: {
            player: true,
          },
        },
      },
      order: {
        id: 'DESC',
      },
    });
  }
}
