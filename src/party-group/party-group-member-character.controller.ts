import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth-guard';
import { PartyGroupMemberCharacterService } from './party-group-member-character.service';
import { UpdateMyPartyGroupCharactersDto } from './dto/update-my-party-group-characters.dto';

@ApiTags('PartyGroupMemberCharacters')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('party-groups')
export class PartyGroupMemberCharacterController {
  constructor(
    private readonly partyGroupMemberCharacterService: PartyGroupMemberCharacterService,
  ) {}

  @Get(':groupId/my-characters')
  @ApiOperation({ summary: '내 공격대 공개 캐릭터 설정용 목록 조회' })
  getMyCharactersForGroup(
    @Req() req: any,
    @Param('groupId', ParseIntPipe) groupId: number,
  ) {
    return this.partyGroupMemberCharacterService.getMyCharactersForGroup(
      groupId,
      req.user.userId,
    );
  }

  @Put(':groupId/my-characters')
  @ApiOperation({ summary: '내 공격대 공개 캐릭터 전체 저장' })
  updateMyCharactersForGroup(
    @Req() req: any,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Body() dto: UpdateMyPartyGroupCharactersDto,
  ) {
    return this.partyGroupMemberCharacterService.updateMyCharactersForGroup(
      groupId,
      req.user.userId,
      dto.characterIds,
    );
  }

  @Get(':groupId/characters')
  @ApiOperation({ summary: '공격대 공개 캐릭터 목록 조회' })
  getVisibleCharactersForGroup(
    @Req() req: any,
    @Param('groupId', ParseIntPipe) groupId: number,
  ) {
    return this.partyGroupMemberCharacterService.getVisibleCharactersForGroup(
      groupId,
      req.user.userId,
    );
  }

  @Get(':groupId/party-builder-characters')
  @ApiOperation({ summary: '파티 편성용 공격대 공개 캐릭터 목록 조회' })
  getPartyBuilderCharacters(
    @Req() req: any,
    @Param('groupId', ParseIntPipe) groupId: number,
  ) {
    return this.partyGroupMemberCharacterService.getPartyBuilderCharacters(
      groupId,
      req.user.userId,
    );
  }
}
