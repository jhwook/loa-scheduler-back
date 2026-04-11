import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, Min } from 'class-validator';

export class AddRaidPartyMemberDto {
  @ApiProperty({ example: 101, description: '캐릭터 ID' })
  @IsInt()
  @Min(1)
  characterId: number;

  @ApiProperty({ example: 1, description: '몇 번째 파티인지 (1파티, 2파티)' })
  @IsInt()
  @Min(1)
  partyNumber: number;

  @ApiProperty({ example: 1, description: '파티 내 슬롯 번호' })
  @IsInt()
  @Min(1)
  slotNumber: number;

  @ApiProperty({
    example: 'DEALER',
    enum: ['DEALER', 'SUPPORT'],
    description: '파티 내 역할',
  })
  @IsIn(['DEALER', 'SUPPORT'])
  positionRole: 'DEALER' | 'SUPPORT';
}
