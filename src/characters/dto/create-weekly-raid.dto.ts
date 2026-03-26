import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
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
