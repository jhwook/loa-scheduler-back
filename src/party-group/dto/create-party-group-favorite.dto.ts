import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class CreatePartyGroupFavoriteDto {
  @ApiProperty({ example: 5, description: '즐겨찾기 대상 유저 ID' })
  @IsInt()
  @Min(1)
  favoriteUserId: number;
}
