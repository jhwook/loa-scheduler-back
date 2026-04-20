import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class WeeklyRaidOrderItemDto {
  @ApiProperty({ example: 3, description: '레이드 ID' })
  @IsInt()
  @Min(1)
  raidInfoId: number;

  @ApiProperty({ example: 1, description: '정렬 순서' })
  @IsInt()
  @Min(1)
  orderNo: number;
}

export class UpdateWeeklyRaidOrderDto {
  @ApiProperty({
    type: [WeeklyRaidOrderItemDto],
    example: [
      { raidInfoId: 3, orderNo: 1 },
      { raidInfoId: 5, orderNo: 2 },
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => WeeklyRaidOrderItemDto)
  raidOrders: WeeklyRaidOrderItemDto[];
}
