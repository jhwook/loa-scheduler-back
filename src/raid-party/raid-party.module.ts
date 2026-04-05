import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RaidParty } from './entites/raid-party.entity';
import { RaidPartyMember } from './entites/raid-party-member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RaidParty, RaidPartyMember])],
  exports: [TypeOrmModule],
})
export class RaidPartyModule {}
