import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePartyGroupDto {
  @ApiProperty({ example: '고정 종막팟' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @ApiProperty({
    example: '매주 같이 가는 멤버들',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
