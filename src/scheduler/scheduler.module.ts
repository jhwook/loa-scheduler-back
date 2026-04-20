import { Module } from '@nestjs/common';
import { CharacterWeeklyRaidGateModule } from '../character-weekly-raid/character-weekly-raid-gate.module';
import { WeeklyResetService } from './weekly-reset.service';

@Module({
  imports: [CharacterWeeklyRaidGateModule],
  providers: [WeeklyResetService],
})
export class SchedulerModule {}
