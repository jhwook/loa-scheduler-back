import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { LostarkModule } from 'src/lostark/lostark.module';
import { CharactersModule } from 'src/characters/characters.module';

import { PartyGroup } from 'src/party-group/entities/party-group.entity';
import { PartyGroupMember } from 'src/party-group/entities/party-group-member.entity';
import { RaidParty } from 'src/raid-party/entites/raid-party.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, PartyGroup, PartyGroupMember, RaidParty]),
    LostarkModule,
    CharactersModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
