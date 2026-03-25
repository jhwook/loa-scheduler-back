import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CharacterWeeklyRaidGate } from './entities/character-weekly-raid-gate.entity';
import { CharacterWeeklyRaidGateService } from './character-weekly-raid-gate.service';
import { RaidGateInfo } from 'src/raid-info/entities/raid-gate-info.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CharacterWeeklyRaidGate, RaidGateInfo])],
  providers: [CharacterWeeklyRaidGateService],
  exports: [CharacterWeeklyRaidGateService],
})
export class CharacterWeeklyRaidGateModule {}
