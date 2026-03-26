import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateClearStatusDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  isCleared: boolean;
}
