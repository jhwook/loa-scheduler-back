import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUserProfileDto {
  @ApiPropertyOptional({ example: '뿔코' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  nickname?: string;
}
