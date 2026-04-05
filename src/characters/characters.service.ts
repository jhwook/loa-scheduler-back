import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Character } from './entities/character.entity';
import { LostarkService } from 'src/lostark/lostark.service';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class CharactersService {
  private readonly CHARACTER_REFRESH_COOLDOWN_MS = 60 * 1000;
  private readonly FULL_REFRESH_COOLDOWN_MS = 60 * 1000;

  constructor(
    @InjectRepository(Character)
    private readonly charactersRepository: Repository<Character>,
    private readonly lostarkService: LostarkService,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
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

  private ensureCooldown(lastSyncedAt: Date | null, cooldownMs: number) {
    if (!lastSyncedAt) {
      return;
    }

    const diff = Date.now() - new Date(lastSyncedAt).getTime();

    if (diff < cooldownMs) {
      const remainSeconds = Math.ceil((cooldownMs - diff) / 1000);
      throw new BadRequestException(`${remainSeconds}초 후 다시 시도해주세요.`);
    }
  }

  private applyProfileToCharacter(character: Character, profile: any) {
    character.serverName = profile.ServerName ?? null;
    character.characterClassName = profile.CharacterClassName ?? null;
    character.characterLevel = profile.CharacterLevel ?? null;
    character.itemAvgLevel = profile.ItemAvgLevel ?? null;
    character.itemMaxLevel = profile.ItemMaxLevel ?? null;
    character.expeditionLevel = profile.ExpeditionLevel ?? null;
    character.title = profile.Title ?? null;
    character.guildName = profile.GuildName ?? null;
    character.townName = profile.TownName ?? null;
    character.pvpGradeName = profile.PvpGradeName ?? null;
    character.combatPower = profile.CombatPower ?? null;
    character.lastSyncedAt = new Date();

    return character;
  }

  async refreshCharacter(userId: number, characterId: number) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('유저를 찾을 수 없습니다.');
    }

    if (!user.lostarkApiToken) {
      throw new BadRequestException('로스트아크 API 키가 등록되지 않았습니다.');
    }

    const character = await this.findOneByIdAndUserId(characterId, userId);

    if (!character) {
      throw new NotFoundException('캐릭터를 찾을 수 없습니다.');
    }

    this.ensureCooldown(
      character.lastSyncedAt,
      this.CHARACTER_REFRESH_COOLDOWN_MS,
    );

    const profile = await this.lostarkService.getCharacterProfile(
      character.characterName,
      user.lostarkApiToken,
    );

    this.applyProfileToCharacter(character, profile);
    await this.charactersRepository.save(character);

    return {
      message: '캐릭터 새로고침이 완료되었습니다.',
      character: {
        id: character.id,
        characterName: character.characterName,
        itemAvgLevel: character.itemAvgLevel,
        combatPower: character.combatPower,
        lastSyncedAt: character.lastSyncedAt,
      },
    };
  }

  async refreshAllCharacters(userId: number) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('유저를 찾을 수 없습니다.');
    }

    if (!user.lostarkApiToken) {
      throw new BadRequestException('로스트아크 API 키가 등록되지 않았습니다.');
    }

    this.ensureCooldown(user.lastFullSyncAt, this.FULL_REFRESH_COOLDOWN_MS);

    const characters = await this.findByUserId(userId);

    if (characters.length === 0) {
      throw new BadRequestException('등록된 캐릭터가 없습니다.');
    }

    const results: Array<{
      characterId: number;
      characterName: string;
      status: 'success' | 'failed';
      reason?: string;
    }> = [];

    for (const character of characters) {
      try {
        const profile = await this.lostarkService.getCharacterProfile(
          character.characterName,
          user.lostarkApiToken,
        );

        this.applyProfileToCharacter(character, profile);
        await this.charactersRepository.save(character);

        results.push({
          characterId: character.id,
          characterName: character.characterName,
          status: 'success',
        });
      } catch (error: any) {
        results.push({
          characterId: character.id,
          characterName: character.characterName,
          status: 'failed',
          reason: error?.message ?? '새로고침 실패',
        });
      }
    }

    user.lastFullSyncAt = new Date();
    await this.usersRepository.save(user);

    const successCount = results.filter((r) => r.status === 'success').length;
    const failedCount = results.filter((r) => r.status === 'failed').length;

    return {
      message: '전체 캐릭터 새로고침이 완료되었습니다.',
      total: results.length,
      successCount,
      failedCount,
      results,
    };
  }
}
