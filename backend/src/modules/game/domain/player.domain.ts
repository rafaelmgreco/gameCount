import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerModel } from '../model/player.model';

@Injectable()
export class PlayerDomain {
  constructor(
    @InjectRepository(PlayerModel)
    private readonly playerRepository: Repository<PlayerModel>,
  ) {}

  async create(name: string): Promise<PlayerModel> {
    const player = this.playerRepository.create({ name });
    return this.playerRepository.save(player);
  }

  async findAll(): Promise<PlayerModel[]> {
    return this.playerRepository.find({ order: { name: 'ASC' } });
  }

  async findById(id: number): Promise<PlayerModel | null> {
    return this.playerRepository.findOne({ where: { id } });
  }
}
