import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateRaidPartyDto {
  @ApiProperty({ example: 1, description: '공격대 그룹 ID' })
  @IsInt()
  @Min(1)
  groupId: number;

  @ApiProperty({ example: 3, description: '레이드 정보 ID' })
  @IsInt()
  @Min(1)
  raidInfoId: number;

  @ApiPropertyOptional({ example: '이번 주 지평의 성당 1파티' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  @ApiProperty({ example: 8, description: '파티 인원 수 (4 또는 8)' })
  @IsInt()
  @Min(1)
  partySize: number;
}
