import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { LostarkService } from '../lostark/lostark.service';
import { CharactersService } from 'src/characters/characters.service';
import { Character } from '../characters/entities/character.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly lostarkService: LostarkService,
    private readonly charactersService: CharactersService,
  ) {}

  async findById(id: number) {
    return this.usersRepository.findOne({
      where: { id },
    });
  }

  findByUsername(username: string) {
    return this.usersRepository.findOne({
      where: { username },
    });
  }

  create(username: string, hashedPassword: string) {
    const user = this.usersRepository.create({
      username,
      password: hashedPassword,
    });

    return this.usersRepository.save(user);
  }

  async registerLostarkApiKey(userId: number, apiKey: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('유저를 찾을 수 없습니다.');
    }

    await this.lostarkService.validateApiKey(apiKey);

    user.lostarkApiToken = apiKey;
    user.hasApiToken = true;
    await this.usersRepository.save(user);

    return {
      message: '로스트아크 API 키가 등록되었습니다.',
    };
  }

  async getExpeditionPreview(
    userId: number,
    representativeCharacterName: string,
  ) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('유저를 찾을 수 없습니다.');
    }

    if (!user.lostarkApiToken) {
      throw new BadRequestException('로스트아크 API 키가 등록되지 않았습니다.');
    }

    const siblings = await this.lostarkService.getSiblings(
      representativeCharacterName,
      user.lostarkApiToken,
    );

    return siblings.map((character: any) => ({
      serverName: character.ServerName,
      characterName: character.CharacterName,
      characterLevel: character.CharacterLevel,
      characterClassName: character.CharacterClassName,
      itemAvgLevel: character.ItemAvgLevel,
    }));
  }

  async syncCharacters(userId: number, characterNames: string[]) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('유저를 찾을 수 없습니다.');
    }

    if (!user.lostarkApiToken) {
      throw new BadRequestException('로스트아크 API 키가 등록되지 않았습니다.');
    }

    const normalizedNames = [
      ...new Set(characterNames.map((name) => name.trim())),
    ].filter((name) => name.length > 0);

    if (normalizedNames.length === 0) {
      throw new BadRequestException('저장할 캐릭터명이 없습니다.');
    }

    const profiles = await Promise.all(
      normalizedNames.map((characterName) =>
        this.lostarkService.getCharacterProfile(
          characterName,
          user.lostarkApiToken as string,
        ),
      ),
    );

    const existingCharacters =
      await this.charactersService.findByUserIdAndNames(
        userId,
        normalizedNames,
      );

    const existingCharacterMap = new Map(
      existingCharacters.map((character) => [
        character.characterName,
        character,
      ]),
    );

    const charactersToSave = profiles.map((profile) => {
      const existingCharacter = existingCharacterMap.get(profile.CharacterName);

      const character = existingCharacter ?? new Character();

      character.userId = userId;
      character.characterName = profile.CharacterName;
      character.serverName = profile.ServerName;
      character.characterClassName = profile.CharacterClassName;
      character.characterLevel = profile.CharacterLevel;
      character.itemAvgLevel = profile.ItemAvgLevel;
      character.itemMaxLevel = profile.ItemMaxLevel;
      character.expeditionLevel = profile.ExpeditionLevel;
      character.title = profile.Title;
      character.guildName = profile.GuildName;
      character.townName = profile.TownName;
      character.pvpGradeName = profile.PvpGradeName;
      character.combatPower = profile.CombatPower ?? null;
      character.characterImage = profile.CharacterImage;

      return character;
    });

    const savedCharacters = await this.charactersService.saveCharacters(
      charactersToSave,
    );

    return {
      message: '캐릭터 동기화가 완료되었습니다.',
      count: savedCharacters.length,
      characters: savedCharacters.map((character) => ({
        id: character.id,
        characterName: character.characterName,
        serverName: character.serverName,
        characterClassName: character.characterClassName,
        characterLevel: character.characterLevel,
        itemAvgLevel: character.itemAvgLevel,
        combatPower: character.combatPower,
        characterImage: character.characterImage,
      })),
    };
  }

  async getMyCharacters(userId: number) {
    const user = await this.findById(userId);

    if (!user) {
      throw new NotFoundException('유저를 찾을 수 없습니다.');
    }

    const characters = await this.charactersService.findByUserId(userId);

    const sortedCharacters = [...characters].sort((a, b) => {
      const aLevel = Number((a.itemAvgLevel ?? '0').replace(/,/g, ''));
      const bLevel = Number((b.itemAvgLevel ?? '0').replace(/,/g, ''));
      return bLevel - aLevel;
    });

    return {
      count: sortedCharacters.length,
      characters: sortedCharacters.map((character) => ({
        id: character.id,
        characterName: character.characterName,
        serverName: character.serverName,
        characterClassName: character.characterClassName,
        characterLevel: character.characterLevel,
        itemAvgLevel: character.itemAvgLevel,
        itemMaxLevel: character.itemMaxLevel,
        expeditionLevel: character.expeditionLevel,
        title: character.title,
        guildName: character.guildName,
        townName: character.townName,
        pvpGradeName: character.pvpGradeName,
        combatPower: character.combatPower,
        characterImage: character.characterImage,
        createdAt: character.createdAt,
        updatedAt: character.updatedAt,
      })),
    };
  }

  async deleteMyCharacter(userId: number, characterId: number) {
    const user = await this.findById(userId);

    if (!user) {
      throw new NotFoundException('유저를 찾을 수 없습니다.');
    }

    const character = await this.charactersService.findOneByIdAndUserId(
      characterId,
      userId,
    );

    if (!character) {
      throw new NotFoundException('해당 캐릭터를 찾을 수 없습니다.');
    }

    await this.charactersService.remove(character);

    return {
      message: '캐릭터가 삭제되었습니다.',
      deletedCharacter: {
        id: character.id,
        characterName: character.characterName,
      },
    };
  }
}
