import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth-guard';
import { CharactersService } from './characters.service';
import { CharacterWeeklyRaidGateService } from '../character-weekly-raid/character-weekly-raid-gate.service';
import { CreateWeeklyRaidDto } from './dto/create-weekly-raid.dto';

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
}
