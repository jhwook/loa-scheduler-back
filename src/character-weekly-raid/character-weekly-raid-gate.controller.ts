import { Controller, Post, UseGuards } from '@nestjs/common';
import { CharacterWeeklyRaidGateService } from './character-weekly-raid-gate.service';
import { ApiOperation } from '@nestjs/swagger';
import { Roles } from 'src/auth/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth-guard';
import { RolesGuard } from 'src/auth/roles.guard';

@Controller('character-weekly-raid-gates')
export class CharacterWeeklyRaidGateController {
  constructor(
    private readonly characterWeeklyRaidGateService: CharacterWeeklyRaidGateService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('admin/reset-weekly-raids')
  @ApiOperation({ summary: '관리자용 주간 레이드 숙제 전체 초기화' })
  async resetWeeklyRaidsNow() {
    return this.characterWeeklyRaidGateService.resetAllWeeklyRaidGates();
  }
}
