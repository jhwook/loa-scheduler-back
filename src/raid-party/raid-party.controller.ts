import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth-guard';
import { RaidPartyService } from './raid-party.service';
import { CreateRaidPartyDto } from './dto/create-raid-party.dto';
import { AddRaidPartyMemberDto } from './dto/add-raid-party-member.dto';

@ApiTags('RaidParties')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('raid-parties')
export class RaidPartyController {
  constructor(private readonly raidPartyService: RaidPartyService) {}

  @Post()
  @ApiOperation({ summary: '공격대 파티 생성' })
  createRaidParty(@Req() req: any, @Body() dto: CreateRaidPartyDto) {
    return this.raidPartyService.createRaidParty(req.user.userId, dto);
  }

  @Post(':raidPartyId/members')
  @ApiOperation({ summary: '공격대 파티에 캐릭터 추가' })
  addCharacterToRaidParty(
    @Req() req: any,
    @Param('raidPartyId', ParseIntPipe) raidPartyId: number,
    @Body() dto: AddRaidPartyMemberDto,
  ) {
    return this.raidPartyService.addCharacterToRaidParty(
      req.user.userId,
      raidPartyId,
      dto,
    );
  }
}
