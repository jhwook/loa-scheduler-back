import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  Get,
  Req,
  UseGuards,
  Patch,
  Delete,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth-guard';
import { RaidPartyService } from './raid-party.service';
import { CreateRaidPartyDto } from './dto/create-raid-party.dto';
import { AddRaidPartyMemberDto } from './dto/add-raid-party-member.dto';
import { UpdateRaidPartyMemberPositionDto } from './dto/update-raid-party-member-position.dto';

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

  @Delete(':raidPartyId')
  @ApiOperation({ summary: '공격대 파티 삭제' })
  deleteRaidParty(
    @Req() req: any,
    @Param('raidPartyId', ParseIntPipe) raidPartyId: number,
  ) {
    return this.raidPartyService.deleteRaidParty(req.user.userId, raidPartyId);
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

  @Get('/group/:groupId')
  @ApiOperation({ summary: '그룹의 공격대 파티 목록 조회' })
  findRaidPartiesByGroup(
    @Req() req: any,
    @Param('groupId', ParseIntPipe) groupId: number,
  ) {
    return this.raidPartyService.findRaidPartiesByGroup(
      req.user.userId,
      groupId,
    );
  }

  @Get(':raidPartyId')
  @ApiOperation({ summary: '공격대 파티 상세 조회' })
  findRaidPartyDetail(
    @Req() req: any,
    @Param('raidPartyId', ParseIntPipe) raidPartyId: number,
  ) {
    return this.raidPartyService.findRaidPartyDetail(
      req.user.userId,
      raidPartyId,
    );
  }

  @Delete(':raidPartyId/members/:memberId')
  @ApiOperation({ summary: '공격대 파티에서 캐릭터 제거' })
  removeRaidPartyMember(
    @Req() req: any,
    @Param('raidPartyId', ParseIntPipe) raidPartyId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
  ) {
    return this.raidPartyService.removeRaidPartyMember(
      req.user.userId,
      raidPartyId,
      memberId,
    );
  }

  @Patch(':raidPartyId/members/:memberId/position')
  @ApiOperation({ summary: '공격대 파티 멤버 위치 이동/순서 변경' })
  moveRaidPartyMember(
    @Req() req: any,
    @Param('raidPartyId', ParseIntPipe) raidPartyId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Body() dto: UpdateRaidPartyMemberPositionDto,
  ) {
    return this.raidPartyService.moveRaidPartyMember(
      req.user.userId,
      raidPartyId,
      memberId,
      dto,
    );
  }
}
