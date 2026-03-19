import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Character } from './entities/character.entity';

@Injectable()
export class CharactersService {
  constructor(
    @InjectRepository(Character)
    private readonly charactersRepository: Repository<Character>,
  ) {}

  async findByUserIdAndNames(userId: number, characterNames: string[]) {
    return this.charactersRepository.find({
      where: {
        userId,
        characterName: In(characterNames),
      },
    });
  }

  async saveCharacters(characters: Character[]) {
    return this.charactersRepository.save(characters);
  }
}
