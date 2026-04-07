import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePartyGroupInviteDto {
  @ApiProperty({ example: '뿔코' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  nickname: string;

  @ApiPropertyOptional({ example: '드루와' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  message?: string;
}
