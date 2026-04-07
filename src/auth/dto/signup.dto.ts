import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class SignupDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: '뿔코' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  nickname: string;

  @IsString()
  @MinLength(4)
  password: string;
}
