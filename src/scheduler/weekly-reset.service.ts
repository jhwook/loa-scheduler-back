import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CharacterWeeklyRaidGateService } from '../character-weekly-raid/character-weekly-raid-gate.service';

@Injectable()
export class WeeklyResetService {
  private readonly logger = new Logger(WeeklyResetService.name);

  constructor(
    private readonly characterWeeklyRaidGateService: CharacterWeeklyRaidGateService,
  ) {}

  // 매주 수요일 오전 6시 (한국시간)
  @Cron('0 6 * * 3', {
    timeZone: 'Asia/Seoul',
  })
  async handleWeeklyReset() {
    this.logger.log('주간 레이드 숙제 초기화 작업 시작');

    try {
      const result =
        await this.characterWeeklyRaidGateService.resetAllWeeklyRaidGates();

      this.logger.log(
        `주간 레이드 숙제 초기화 완료 - 초기화된 row 수: ${
          result.affected ?? 0
        }`,
      );
    } catch (error) {
      this.logger.error('주간 레이드 숙제 초기화 실패', error.stack);
    }
  }
}
