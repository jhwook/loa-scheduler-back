import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Character } from './entities/character.entity';
import { CharactersService } from './characters.service';
import { CharactersController } from './characters.controller';
import { CharacterWeeklyRaidGateModule } from '../character-weekly-raid/character-weekly-raid-gate.module';
import { LostarkModule } from 'src/lostark/lostark.module';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Character, User]),
    CharacterWeeklyRaidGateModule,
    LostarkModule,
  ],
  controllers: [CharactersController],
  providers: [CharactersService],
  exports: [CharactersService],
})
export class CharactersModule {}
