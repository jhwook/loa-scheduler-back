import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateRaidGateInfoDto {
  @ApiPropertyOptional({ example: '하드' })
  @IsOptional()
  @IsString()
  difficulty?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  gateNumber?: number;

  @ApiPropertyOptional({ example: '1관문' })
  @IsOptional()
  @IsString()
  gateName?: string;

  @ApiPropertyOptional({ example: 1730 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minItemLevel?: number;

  @ApiPropertyOptional({ example: 5000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  rewardGold?: number;

  @ApiPropertyOptional({ example: 2500 })
  @IsOptional()
  @IsInt()
  @Min(0)
  boundGold?: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isSingleMode?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  canExtraReward?: boolean;

  @ApiPropertyOptional({ example: 1600 })
  @IsOptional()
  @IsInt()
  @Min(0)
  extraRewardCost?: number;

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
