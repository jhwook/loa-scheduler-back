import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';

export class UpdateRaidPartyMemberPositionDto {
  @ApiProperty({ example: 1, description: '이동할 파티 번호' })
  @IsInt()
  @Min(1)
  partyNumber: number;

  @ApiProperty({ example: 2, description: '이동할 슬롯 번호' })
  @IsInt()
  @Min(1)
  slotNumber: number;

  @ApiPropertyOptional({
    example: 'SUPPORT',
    enum: ['DEALER', 'SUPPORT'],
    description: '이동하면서 역할도 변경할 경우',
  })
  @IsOptional()
  @IsIn(['DEALER', 'SUPPORT'])
  positionRole?: 'DEALER' | 'SUPPORT';
}
