import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreatePlayerRequest {
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  name: string;
}
