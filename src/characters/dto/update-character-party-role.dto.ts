import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class UpdateCharacterPartyRoleDto {
  @ApiProperty({ example: 'SUPPORT', enum: ['DEALER', 'SUPPORT'] })
  @IsIn(['DEALER', 'SUPPORT'])
  partyRole: 'DEALER' | 'SUPPORT';
}
