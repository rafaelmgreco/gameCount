import { DeckResponse } from './deck.response';
import { PlayerResponse } from './player.response';

export class MatchParticipantResponse {
  seatOrder: number;
  player: PlayerResponse;
  deck: DeckResponse;
}

export class MatchResponse {
  id: number;
  matchDate: string;
  winningTurn: number;
  winner: PlayerResponse;
  participants: MatchParticipantResponse[];
  createdAt: Date;
}
