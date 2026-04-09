import { ApiProperty } from '@nestjs/swagger';
import { ArrayUnique, IsArray, IsInt, Min } from 'class-validator';

export class UpdateMyPartyGroupCharactersDto {
  @ApiProperty({
    example: [1, 2, 5],
    description: '이 그룹에서 공개할 내 캐릭터 ID 목록',
  })
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  characterIds: number[];
}
