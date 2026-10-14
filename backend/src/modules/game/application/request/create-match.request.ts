import { ArrayMinSize, IsArray, IsDateString, IsInt, IsOptional, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class MatchParticipantRequest {
  @IsInt()
  @Min(1)
  playerId: number;

  @IsInt()
  @Min(1)
  deckId: number;

  @IsInt()
  @Min(1)
  seatOrder: number;
}

export class CreateMatchRequest {
  @IsOptional()
  @IsDateString()
  matchDate?: string;

  @IsInt()
  @Min(1)
  winnerPlayerId: number;

  @IsInt()
  @Min(1)
  winningTurn: number;

  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => MatchParticipantRequest)
  participants: MatchParticipantRequest[];
}
