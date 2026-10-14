import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PlayerDomain } from '../domain/player.domain';
import { DeckDomain } from '../domain/deck.domain';
import { MatchDomain } from '../domain/match.domain';
import { CreatePlayerRequest } from './request/create-player.request';
import { CreateDeckRequest } from './request/create-deck.request';
import { CreateMatchRequest } from './request/create-match.request';
import { DeckResponse } from './response/deck.response';
import { MatchResponse } from './response/match.response';
import { PlayerResponse } from './response/player.response';

@Injectable()
export class GameApplication {
  constructor(
    private readonly playerDomain: PlayerDomain,
    private readonly deckDomain: DeckDomain,
    private readonly matchDomain: MatchDomain,
  ) {}

  async createPlayer(request: CreatePlayerRequest): Promise<PlayerResponse> {
    const player = await this.playerDomain.create(request.name);
    return { id: player.id, name: player.name };
  }

  async listPlayers(): Promise<PlayerResponse[]> {
    const players = await this.playerDomain.findAll();
    return players.map((player) => ({ id: player.id, name: player.name }));
  }

  async createDeck(request: CreateDeckRequest): Promise<DeckResponse> {
    const player = await this.playerDomain.findById(request.playerId);
    if (!player) {
      throw new NotFoundException('Player not found');
    }

    const deck = await this.deckDomain.create(request.name, request.commander, player);
    return {
      id: deck.id,
      name: deck.name,
      commander: deck.commander,
      player: { id: player.id, name: player.name },
    };
  }

  async listDecks(): Promise<DeckResponse[]> {
    const decks = await this.deckDomain.findAll();
    return decks.map((deck) => ({
      id: deck.id,
      name: deck.name,
      commander: deck.commander,
      player: {
        id: deck.player.id,
        name: deck.player.name,
      },
    }));
  }

  async createMatch(request: CreateMatchRequest): Promise<MatchResponse> {
    const participantPlayerIds = request.participants.map((participant) => participant.playerId);
    const duplicatedPlayers = participantPlayerIds.filter(
      (playerId, index) => participantPlayerIds.indexOf(playerId) !== index,
    );

    if (duplicatedPlayers.length > 0) {
      throw new BadRequestException('A player can only appear once in a match');
    }

    const seatOrders = request.participants.map((participant) => participant.seatOrder);
    const duplicatedSeatOrders = seatOrders.filter(
      (seatOrder, index) => seatOrders.indexOf(seatOrder) !== index,
    );

    if (duplicatedSeatOrders.length > 0) {
      throw new BadRequestException('Seat order must be unique in a match');
    }

    const participants = await Promise.all(
      request.participants.map(async (item) => {
        const player = await this.playerDomain.findById(item.playerId);
        if (!player) {
          throw new NotFoundException(`Player ${item.playerId} not found`);
        }

        const deck = await this.deckDomain.findById(item.deckId);
        if (!deck) {
          throw new NotFoundException(`Deck ${item.deckId} not found`);
        }

        if (deck.player.id !== player.id) {
          throw new BadRequestException(
            `Deck ${deck.id} does not belong to player ${player.id}`,
          );
        }

        return {
          seatOrder: item.seatOrder,
          player,
          deck,
        };
      }),
    );

    const winner = participants.find((participant) => participant.player.id === request.winnerPlayerId);
    if (!winner) {
      throw new BadRequestException('Winner must be one of the match participants');
    }

    const match = await this.matchDomain.create(
      winner.player,
      request.winningTurn,
      participants,
      request.matchDate,
    );

    return {
      id: match.id,
      matchDate: match.matchDate,
      winningTurn: match.winningTurn,
      winner: {
        id: match.winner.id,
        name: match.winner.name,
      },
      participants: match.participants.map((participant) => ({
        seatOrder: participant.seatOrder,
        player: {
          id: participant.player.id,
          name: participant.player.name,
        },
        deck: {
          id: participant.deck.id,
          name: participant.deck.name,
          commander: participant.deck.commander,
          player: {
            id: participant.deck.player.id,
            name: participant.deck.player.name,
          },
        },
      })),
      createdAt: match.createdAt,
    };
  }

  async listMatches(): Promise<MatchResponse[]> {
    const matches = await this.matchDomain.findAll();
    return matches.map((match) => ({
      id: match.id,
      matchDate: match.matchDate,
      winningTurn: match.winningTurn,
      winner: {
        id: match.winner.id,
        name: match.winner.name,
      },
      participants: match.participants.map((participant) => ({
        seatOrder: participant.seatOrder,
        player: {
          id: participant.player.id,
          name: participant.player.name,
        },
        deck: {
          id: participant.deck.id,
          name: participant.deck.name,
          commander: participant.deck.commander,
          player: {
            id: participant.deck.player.id,
            name: participant.deck.player.name,
          },
        },
      })),
      createdAt: match.createdAt,
    }));
  }
}
