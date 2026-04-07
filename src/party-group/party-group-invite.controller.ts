import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth-guard';
import { PartyGroupInviteService } from './party-group-invite.service';
import { CreatePartyGroupInviteDto } from './dto/create-party-group-invite.dto';

@ApiTags('PartyGroupInvites')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class PartyGroupInviteController {
  constructor(
    private readonly partyGroupInviteService: PartyGroupInviteService,
  ) {}

  @Post('party-groups/:groupId/invites')
  @ApiOperation({ summary: '그룹 초대 생성' })
  createInvite(
    @Req() req: any,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Body() dto: CreatePartyGroupInviteDto,
  ) {
    return this.partyGroupInviteService.createInvite(
      groupId,
      req.user.userId,
      dto.nickname,
      dto.message,
    );
  }

  @Get('party-group-invites/received')
  @ApiOperation({ summary: '내가 받은 그룹 초대 목록 조회' })
  findReceivedInvites(@Req() req: any) {
    return this.partyGroupInviteService.findReceivedInvites(req.user.userId);
  }

  @Get('party-group-invites/sent')
  @ApiOperation({ summary: '내가 보낸 그룹 초대 목록 조회' })
  findSentInvites(@Req() req: any) {
    return this.partyGroupInviteService.findSentInvites(req.user.userId);
  }

  @Post('party-group-invites/:inviteId/accept')
  @ApiOperation({ summary: '그룹 초대 수락' })
  acceptInvite(
    @Req() req: any,
    @Param('inviteId', ParseIntPipe) inviteId: number,
  ) {
    return this.partyGroupInviteService.acceptInvite(inviteId, req.user.userId);
  }

  @Post('party-group-invites/:inviteId/reject')
  @ApiOperation({ summary: '그룹 초대 거절' })
  rejectInvite(
    @Req() req: any,
    @Param('inviteId', ParseIntPipe) inviteId: number,
  ) {
    return this.partyGroupInviteService.rejectInvite(inviteId, req.user.userId);
  }

  @Post('party-group-invites/:inviteId/cancel')
  @ApiOperation({ summary: '그룹 초대 취소' })
  cancelInvite(
    @Req() req: any,
    @Param('inviteId', ParseIntPipe) inviteId: number,
  ) {
    return this.partyGroupInviteService.cancelInvite(inviteId, req.user.userId);
  }
}
