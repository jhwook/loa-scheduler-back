import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RaidPartyService } from './raid-party.service';
import { RaidPartyController } from './raid-party.controller';
import { PartyGroup } from '../party-group/entities/party-group.entity';
import { PartyGroupMember } from '../party-group/entities/party-group-member.entity';
import { PartyGroupMemberCharacter } from '../party-group/entities/party-group-member-character.entity';
import { RaidInfo } from '../raid-info/entities/raid-info.entity';
import { Character } from '../characters/entities/character.entity';
import { RaidPartyMember } from './entites/raid-party-member.entity';
import { RaidParty } from './entites/raid-party.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RaidParty,
      RaidPartyMember,
      PartyGroup,
      PartyGroupMember,
      PartyGroupMemberCharacter,
      RaidInfo,
      Character,
    ]),
  ],
  controllers: [RaidPartyController],
  providers: [RaidPartyService],
  exports: [RaidPartyService],
})
export class RaidPartyModule {}
