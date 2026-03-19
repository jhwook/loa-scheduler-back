import { IsNotEmpty, IsString } from 'class-validator';

export class GetExpeditionPreviewDto {
  @IsString()
  @IsNotEmpty()
  representativeCharacterName: string;
}
