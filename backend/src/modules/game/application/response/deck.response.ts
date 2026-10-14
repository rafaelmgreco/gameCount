import { PlayerResponse } from './player.response';

export class DeckResponse {
  id: number;
  name: string;
  commander: string;
  player: PlayerResponse;
}
