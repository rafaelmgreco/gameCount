import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';

export class CreateDeckRequest {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  commander: string;

  @IsInt()
  @Min(1)
  playerId: number;
}
