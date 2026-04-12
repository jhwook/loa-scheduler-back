import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateRaidInfoDto {
  @ApiPropertyOptional({ example: '종막' })
  @IsOptional()
  @IsString()
  raidName?: string;

  @ApiPropertyOptional({ example: '카제로스 레이드 종막' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 8, description: '레이드 인원 수' })
  @IsOptional()
  @IsInt()
  partySize?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  orderNo?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
