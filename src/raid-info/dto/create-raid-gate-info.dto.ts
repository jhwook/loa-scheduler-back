import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateRaidGateInfoDto {
  @ApiProperty({ example: '하드' })
  @IsString()
  @IsNotEmpty()
  difficulty: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  gateNumber: number;

  @ApiProperty({ example: '1관문', required: false })
  @IsOptional()
  @IsString()
  gateName?: string;

  @ApiProperty({ example: 1730 })
  @IsNumber()
  @Min(0)
  minItemLevel: number;

  @ApiProperty({ example: 5000 })
  @IsInt()
  @Min(0)
  rewardGold: number;

  @ApiProperty({ example: 2500, description: '귀속 골드' })
  @IsOptional()
  @IsInt()
  @Min(0)
  boundGold?: number;

  @ApiProperty({ example: false, description: '싱글 레이드 여부' })
  @IsOptional()
  @IsBoolean()
  isSingleMode?: boolean;

  @ApiProperty({ example: true, description: '더보기 가능 여부' })
  @IsOptional()
  @IsBoolean()
  canExtraReward?: boolean;

  @ApiProperty({ example: 1600, description: '더보기 골드 비용' })
  @IsOptional()
  @IsInt()
  @Min(0)
  extraRewardCost?: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  orderNo?: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
