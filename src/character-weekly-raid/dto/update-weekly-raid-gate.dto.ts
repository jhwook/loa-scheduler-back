import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, Min } from 'class-validator';

export class UpdateWeeklyRaidGateDto {
  @ApiProperty({ example: 12 })
  @IsInt()
  @Min(1)
  raidGateInfoId: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  isExtraRewardSelected: boolean;
}
