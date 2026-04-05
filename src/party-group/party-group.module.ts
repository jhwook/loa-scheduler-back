import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartyGroup } from './entities/party-group.entity';
import { PartyGroupMember } from './entities/party-group-member.entity';
import { CharacterWeeklyRaidGate } from 'src/character-weekly-raid/entities/character-weekly-raid-gate.entity';
import { Character } from 'src/characters/entities/character.entity';
import { User } from 'src/users/entities/user.entity';
import { PartyGroupController } from './party-group.controller';
import { PartyGroupService } from './party-group.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PartyGroup,
      PartyGroupMember,
      User,
      Character,
      CharacterWeeklyRaidGate,
    ]),
  ],
  controllers: [PartyGroupController],
  providers: [PartyGroupService],
  exports: [PartyGroupService],
})
export class PartyGroupModule {}
