import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePartyGroupMemberNicknameDto {
  @ApiProperty({ example: '뿔코', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  nickname?: string;
}
