import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateRaidInfoDto {
  @ApiProperty({ example: '종막' })
  @IsString()
  @IsNotEmpty()
  raidName: string;

  @ApiProperty({ example: '카제로스 레이드 종막', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 8, description: '레이드 인원 수' })
  @IsOptional()
  @IsInt()
  partySize?: number;

  @ApiProperty({ example: 1, required: false, default: 0 })
  @IsOptional()
  @IsInt()
  orderNo?: number;

  @ApiProperty({ example: true, required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
