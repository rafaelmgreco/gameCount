import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeckModel } from '../model/deck.model';
import { PlayerModel } from '../model/player.model';

@Injectable()
export class DeckDomain {
  constructor(
    @InjectRepository(DeckModel)
    private readonly deckRepository: Repository<DeckModel>,
  ) {}

  async create(name: string, commander: string, player: PlayerModel): Promise<DeckModel> {
    const deck = this.deckRepository.create({
      name,
      commander,
      player,
    });

    return this.deckRepository.save(deck);
  }

  async findAll(): Promise<DeckModel[]> {
    return this.deckRepository.find({
      relations: {
        player: true,
      },
      order: {
        id: 'DESC',
      },
    });
  }

  async findById(id: number): Promise<DeckModel | null> {
    return this.deckRepository.findOne({
      where: { id },
      relations: {
        player: true,
      },
    });
  }
}
