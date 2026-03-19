import { ArrayNotEmpty, IsArray, IsString, ArrayUnique } from 'class-validator';

export class SyncCharactersDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsString({ each: true })
  characterNames: string[];
}
