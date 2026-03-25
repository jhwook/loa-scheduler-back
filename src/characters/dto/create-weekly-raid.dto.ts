import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class RaidGateSelectionDto {
  @ApiProperty({ example: 11 })
  @IsInt()
  @Min(1)
  raidGateInfoId: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  isExtraRewardSelected: boolean;
}

export class CreateWeeklyRaidDto {
  @ApiProperty({ example: '2026-03-24' })
  @IsDateString()
  weekStartDate: string;

  @ApiProperty({
    type: [RaidGateSelectionDto],
    example: [
      { raidGateInfoId: 11, isExtraRewardSelected: true },
      { raidGateInfoId: 12, isExtraRewardSelected: false },
    ],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => RaidGateSelectionDto)
  raidGateSelections: RaidGateSelectionDto[];
}
