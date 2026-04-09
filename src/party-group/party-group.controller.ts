import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth-guard';
import { PartyGroupService } from './party-group.service';
import { CreatePartyGroupDto } from './dto/create-party-group.dto';
import { AddPartyGroupMemberDto } from './dto/add-party-group-member.dto';
import { UpdatePartyGroupMemberNicknameDto } from './dto/update-party-group-member-nickname.dto';

@ApiTags('PartyGroups')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('party-groups')
export class PartyGroupController {
  constructor(private readonly partyGroupService: PartyGroupService) {}

  @Post()
  @ApiOperation({ summary: '그룹 생성' })
  createGroup(@Req() req: any, @Body() dto: CreatePartyGroupDto) {
    return this.partyGroupService.createGroup(req.user.userId, dto);
  }

  @Get('my')
  @ApiOperation({ summary: '내 그룹 목록 조회' })
  findMyGroups(@Req() req: any) {
    return this.partyGroupService.findMyGroups(req.user.userId);
  }

  @Get(':groupId')
  @ApiOperation({ summary: '그룹 상세 조회' })
  findGroupDetail(
    @Req() req: any,
    @Param('groupId', ParseIntPipe) groupId: number,
  ) {
    return this.partyGroupService.findGroupDetail(groupId, req.user.userId);
  }

  @Post(':groupId/members')
  @ApiOperation({ summary: '그룹 멤버 추가' })
  addMember(
    @Req() req: any,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Body() dto: AddPartyGroupMemberDto,
  ) {
    return this.partyGroupService.addMember(
      groupId,
      req.user.userId,
      dto.userId,
      dto.nickname,
    );
  }

  @Patch(':groupId/members/:memberId/nickname')
  @ApiOperation({ summary: '그룹 멤버 별명 수정' })
  updateMemberNickname(
    @Req() req: any,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Body() dto: UpdatePartyGroupMemberNicknameDto,
  ) {
    return this.partyGroupService.updateMemberNickname(
      groupId,
      memberId,
      req.user.userId,
      dto.nickname,
    );
  }

  @Delete(':groupId/members/:memberId')
  @ApiOperation({ summary: '그룹 멤버 삭제' })
  removeMember(
    @Req() req: any,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
  ) {
    return this.partyGroupService.removeMember(
      groupId,
      memberId,
      req.user.userId,
    );
  }

  @Post(':groupId/leave')
  @ApiOperation({ summary: '공격대 탈퇴' })
  leaveGroup(@Req() req: any, @Param('groupId', ParseIntPipe) groupId: number) {
    return this.partyGroupService.leaveGroup(groupId, req.user.userId);
  }

  @Delete(':groupId')
  @ApiOperation({ summary: '공격대 삭제 (공대장만 가능)' })
  deleteGroup(
    @Req() req: any,
    @Param('groupId', ParseIntPipe) groupId: number,
  ) {
    return this.partyGroupService.deleteGroup(groupId, req.user.userId);
  }
}
