import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateRaidPartyDto {
  @ApiPropertyOptional({ example: '지평의 성당 1파티' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  @ApiPropertyOptional({
    example: '3단계',
    description: '선택한 레이드 난이도',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  selectedDifficulty?: string | null;
}
