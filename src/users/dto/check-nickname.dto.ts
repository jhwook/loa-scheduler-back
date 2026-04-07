import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CheckNicknameDto {
  @ApiProperty({ example: '뿔코' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  nickname: string;
}
