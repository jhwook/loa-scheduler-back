import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartyGroup } from './entities/party-group.entity';
import { PartyGroupMember } from './entities/party-group-member.entity';
import { PartyGroupInvite } from './entities/party-group-invite.entity';
import { PartyGroupService } from './party-group.service';
import { PartyGroupInviteService } from './party-group-invite.service';
import { PartyGroupController } from './party-group.controller';
import { PartyGroupInviteController } from './party-group-invite.controller';
import { User } from '../users/entities/user.entity';
import { Character } from '../characters/entities/character.entity';
import { CharacterWeeklyRaidGate } from 'src/character-weekly-raid/entities/character-weekly-raid-gate.entity';
import { PartyGroupMemberCharacter } from './entities/party-group-member-character.entity';
import { PartyGroupMemberCharacterController } from './party-group-member-character.controller';
import { PartyGroupMemberCharacterService } from './party-group-member-character.service';
import { PartyGroupMemberFavorite } from './entities/party-group-member-favorite.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PartyGroup,
      PartyGroupMember,
      PartyGroupInvite,
      User,
      Character,
      CharacterWeeklyRaidGate,
      PartyGroupMemberCharacter,
      PartyGroupMemberFavorite,
    ]),
  ],
  controllers: [
    PartyGroupController,
    PartyGroupInviteController,
    PartyGroupMemberCharacterController,
  ],
  providers: [
    PartyGroupService,
    PartyGroupInviteService,
    PartyGroupMemberCharacterService,
  ],
  exports: [
    PartyGroupService,
    PartyGroupInviteService,
    PartyGroupMemberCharacterService,
  ],
})
export class PartyGroupModule {}
