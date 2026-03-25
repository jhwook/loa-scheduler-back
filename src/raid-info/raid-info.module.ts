import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RaidInfo } from './entities/raid-info.entity';
import { RaidGateInfo } from './entities/raid-gate-info.entity';
import { RaidInfoService } from './raid-info.service';
import { RaidGateInfoService } from './raid-gate-info.service';
import { RaidInfoController } from './raid-info.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RaidInfo, RaidGateInfo])],
  controllers: [RaidInfoController],
  providers: [RaidInfoService, RaidGateInfoService],
  exports: [RaidInfoService, RaidGateInfoService],
})
export class RaidInfoModule {}
