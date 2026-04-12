import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLevelRangeFilterDto {
  @ApiProperty({ example: '1750+' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  label: string;

  @ApiProperty({ example: 1750 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minLevel: number;

  @ApiPropertyOptional({ example: 9999 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxLevel?: number;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  orderNo: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
