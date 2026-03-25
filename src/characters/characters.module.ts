import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Character } from './entities/character.entity';
import { CharactersService } from './characters.service';
import { CharactersController } from './characters.controller';
import { CharacterWeeklyRaidGateModule } from '../character-weekly-raid/character-weekly-raid-gate.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Character]),
    CharacterWeeklyRaidGateModule,
  ],
  controllers: [CharactersController],
  providers: [CharactersService],
  exports: [CharactersService],
})
export class CharactersModule {}
