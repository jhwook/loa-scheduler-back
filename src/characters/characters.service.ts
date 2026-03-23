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

  async findByUserId(userId: number) {
    return this.charactersRepository.find({
      where: { userId },
      order: {
        itemAvgLevel: 'DESC',
        createdAt: 'ASC',
      },
    });
  }

  async findByUserIdAndNames(userId: number, characterNames: string[]) {
    return this.charactersRepository.find({
      where: {
        userId,
        characterName: In(characterNames),
      },
    });
  }

  async findOneByIdAndUserId(characterId: number, userId: number) {
    return this.charactersRepository.findOne({
      where: {
        id: characterId,
        userId,
      },
    });
  }

  async saveCharacters(characters: Character[]) {
    return this.charactersRepository.save(characters);
  }

  async remove(character: Character) {
    return this.charactersRepository.remove(character);
  }
}
