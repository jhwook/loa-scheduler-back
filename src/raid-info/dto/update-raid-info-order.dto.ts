import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RaidInfoOrderItemDto {
  @ApiProperty({ example: 3, description: '레이드 ID' })
  @IsInt()
  @Min(1)
  raidInfoId: number;

  @ApiProperty({ example: 1, description: '정렬 순서' })
  @IsInt()
  @Min(1)
  orderNo: number;
}

export class UpdateRaidInfoOrderDto {
  @ApiProperty({
    type: [RaidInfoOrderItemDto],
    example: [
      { raidInfoId: 3, orderNo: 1 },
      { raidInfoId: 7, orderNo: 2 },
      { raidInfoId: 5, orderNo: 3 },
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => RaidInfoOrderItemDto)
  raidOrders: RaidInfoOrderItemDto[];
}
