import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class AddPartyGroupMemberDto {
  @ApiProperty({ example: 3 })
  @IsInt()
  @Min(1)
  userId: number;

  @ApiPropertyOptional({ example: '뿔코' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  nickname?: string;
}
