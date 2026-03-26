import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth-guard';
import { CharactersService } from './characters.service';
import { CharacterWeeklyRaidGateService } from '../character-weekly-raid/character-weekly-raid-gate.service';
import { CreateWeeklyRaidDto } from './dto/create-weekly-raid.dto';
import { UpdateClearStatusDto } from 'src/character-weekly-raid/dto/update-clear-status.dto';
import { UpdateWeeklyRaidGateDto } from 'src/character-weekly-raid/dto/update-weekly-raid-gate.dto';

@ApiTags('Characters')
@ApiBearerAuth()
@Controller('characters')
export class CharactersController {
  constructor(
    private readonly charactersService: CharactersService,
    private readonly characterWeeklyRaidGateService: CharacterWeeklyRaidGateService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post(':characterId/weekly-raids')
  @ApiOperation({ summary: '캐릭터 레이드 숙제 저장' })
  async createWeeklyRaids(
    @Req() req: any,
    @Param('characterId', ParseIntPipe) characterId: number,
    @Body() dto: CreateWeeklyRaidDto,
  ) {
    const character = await this.charactersService.findOneByIdAndUserId(
      characterId,
      req.user.userId,
    );

    if (!character) {
      throw new NotFoundException('캐릭터를 찾을 수 없습니다.');
    }

    return this.characterWeeklyRaidGateService.addWeeklyRaidGates(
      characterId,
      dto.raidGateSelections,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':characterId/weekly-raids')
  @ApiOperation({ summary: '캐릭터 레이드 숙제 목록 조회' })
  async getWeeklyRaids(
    @Req() req: any,
    @Param('characterId', ParseIntPipe) characterId: number,
  ) {
    const character = await this.charactersService.findOneByIdAndUserId(
      characterId,
      req.user.userId,
    );

    if (!character) {
      throw new NotFoundException('캐릭터를 찾을 수 없습니다.');
    }

    return this.characterWeeklyRaidGateService.findByCharacterId(characterId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('weekly-raids/:id/clear')
  @ApiOperation({ summary: '레이드 숙제 클리어 체크/해제' })
  async updateClearStatus(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateClearStatusDto,
  ) {
    return this.characterWeeklyRaidGateService.updateClearStatus(
      id,
      dto.isCleared,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('weekly-raids/:id')
  @ApiOperation({ summary: '레이드 숙제 수정' })
  async updateWeeklyRaid(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWeeklyRaidGateDto,
  ) {
    const weeklyRaid = await this.characterWeeklyRaidGateService.findOneById(
      id,
    );

    if (!weeklyRaid) {
      throw new NotFoundException('숙제를 찾을 수 없습니다.');
    }

    const character = await this.charactersService.findOneByIdAndUserId(
      weeklyRaid.characterId,
      req.user.userId,
    );

    if (!character) {
      throw new NotFoundException('캐릭터를 찾을 수 없습니다.');
    }

    return this.characterWeeklyRaidGateService.upsertWeeklyRaidGate(id, dto);
  }
}
