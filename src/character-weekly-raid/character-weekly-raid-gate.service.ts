import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CharacterWeeklyRaidGate } from './entities/character-weekly-raid-gate.entity';
import { RaidGateInfo } from 'src/raid-info/entities/raid-gate-info.entity';

@Injectable()
export class CharacterWeeklyRaidGateService {
  constructor(
    @InjectRepository(CharacterWeeklyRaidGate)
    private readonly characterWeeklyRaidGateRepository: Repository<CharacterWeeklyRaidGate>,
    @InjectRepository(RaidGateInfo)
    private readonly raidGateInfoRepository: Repository<RaidGateInfo>,
  ) {}

  async findAll() {
    return this.characterWeeklyRaidGateRepository.find({
      relations: {
        character: true,
        raidGateInfo: {
          raidInfo: true,
        },
      },
      order: {
        createdAt: 'ASC',
      },
    });
  }

  async findOneById(id: number) {
    return this.characterWeeklyRaidGateRepository.findOne({
      where: { id },
      relations: {
        character: true,
        raidGateInfo: {
          raidInfo: true,
        },
      },
    });
  }

  async findByCharacterIdAndWeekStartDate(
    characterId: number,
    weekStartDate: string,
  ) {
    return this.characterWeeklyRaidGateRepository.find({
      where: {
        characterId,
        weekStartDate,
      },
      relations: {
        raidGateInfo: {
          raidInfo: true,
        },
      },
      order: {
        createdAt: 'ASC',
      },
    });
  }

  async findByCharacterIdsAndWeekStartDate(
    characterIds: number[],
    weekStartDate: string,
  ) {
    if (characterIds.length === 0) {
      return [];
    }

    return this.characterWeeklyRaidGateRepository.find({
      where: {
        characterId: In(characterIds),
        weekStartDate,
      },
      relations: {
        raidGateInfo: {
          raidInfo: true,
        },
      },
      order: {
        createdAt: 'ASC',
      },
    });
  }

  async findOneByCharacterIdRaidGateInfoIdAndWeekStartDate(
    characterId: number,
    raidGateInfoId: number,
    weekStartDate: string,
  ) {
    return this.characterWeeklyRaidGateRepository.findOne({
      where: {
        characterId,
        raidGateInfoId,
        weekStartDate,
      },
      relations: {
        raidGateInfo: {
          raidInfo: true,
        },
      },
    });
  }

  create(data: Partial<CharacterWeeklyRaidGate>) {
    return this.characterWeeklyRaidGateRepository.create(data);
  }

  async save(entity: CharacterWeeklyRaidGate) {
    return this.characterWeeklyRaidGateRepository.save(entity);
  }

  async saveMany(entities: CharacterWeeklyRaidGate[]) {
    return this.characterWeeklyRaidGateRepository.save(entities);
  }

  async remove(entity: CharacterWeeklyRaidGate) {
    return this.characterWeeklyRaidGateRepository.remove(entity);
  }

  async removeMany(entities: CharacterWeeklyRaidGate[]) {
    return this.characterWeeklyRaidGateRepository.remove(entities);
  }

  async deleteById(id: number) {
    return this.characterWeeklyRaidGateRepository.delete({ id });
  }

  async deleteByCharacterIdAndWeekStartDate(
    characterId: number,
    weekStartDate: string,
  ) {
    return this.characterWeeklyRaidGateRepository.delete({
      characterId,
      weekStartDate,
    });
  }

  async addWeeklyRaidGate(
    characterId: number,
    raidGateInfoId: number,
    weekStartDate: string,
    isExtraRewardSelected: boolean,
  ) {
    const existing =
      await this.findOneByCharacterIdRaidGateInfoIdAndWeekStartDate(
        characterId,
        raidGateInfoId,
        weekStartDate,
      );

    if (existing) {
      return existing;
    }

    const gateInfo = await this.raidGateInfoRepository.findOne({
      where: { id: raidGateInfoId },
    });

    if (!gateInfo) {
      throw new NotFoundException('관문 정보를 찾을 수 없습니다.');
    }

    if (isExtraRewardSelected && !gateInfo.canExtraReward) {
      throw new BadRequestException('더보기가 불가능한 관문입니다.');
    }

    const entity = this.characterWeeklyRaidGateRepository.create({
      characterId,
      raidGateInfoId,
      weekStartDate,
      isCleared: false,
      isGoldEarned: false,
      isExtraRewardSelected,
      extraRewardCostSnapshot: isExtraRewardSelected
        ? gateInfo.extraRewardCost
        : null,
      clearedAt: null,
    });

    return this.characterWeeklyRaidGateRepository.save(entity);
  }

  async markCleared(id: number) {
    const entity = await this.characterWeeklyRaidGateRepository.findOne({
      where: { id },
    });

    if (!entity) {
      return null;
    }

    entity.isCleared = true;
    entity.clearedAt = new Date();

    return this.characterWeeklyRaidGateRepository.save(entity);
  }

  async markUncleared(id: number) {
    const entity = await this.characterWeeklyRaidGateRepository.findOne({
      where: { id },
    });

    if (!entity) {
      return null;
    }

    entity.isCleared = false;
    entity.clearedAt = null;

    return this.characterWeeklyRaidGateRepository.save(entity);
  }

  async updateGoldEarned(id: number, isGoldEarned: boolean) {
    const entity = await this.characterWeeklyRaidGateRepository.findOne({
      where: { id },
    });

    if (!entity) {
      return null;
    }

    entity.isGoldEarned = isGoldEarned;

    return this.characterWeeklyRaidGateRepository.save(entity);
  }

  async toggleExtraReward(id: number, value: boolean) {
    const entity = await this.characterWeeklyRaidGateRepository.findOne({
      where: { id },
      relations: {
        raidGateInfo: true,
      },
    });

    if (!entity) {
      return null;
    }

    if (value && !entity.raidGateInfo.canExtraReward) {
      throw new BadRequestException('더보기가 불가능한 관문입니다.');
    }

    entity.isExtraRewardSelected = value;
    entity.extraRewardCostSnapshot = value
      ? entity.raidGateInfo.extraRewardCost
      : null;

    return this.characterWeeklyRaidGateRepository.save(entity);
  }

  async addWeeklyRaidGates(
    characterId: number,
    weekStartDate: string,
    selections: Array<{
      raidGateInfoId: number;
      isExtraRewardSelected: boolean;
    }>,
  ) {
    const savedEntities: CharacterWeeklyRaidGate[] = [];

    for (const selection of selections) {
      const existing =
        await this.findOneByCharacterIdRaidGateInfoIdAndWeekStartDate(
          characterId,
          selection.raidGateInfoId,
          weekStartDate,
        );

      if (existing) {
        savedEntities.push(existing);
        continue;
      }

      const gateInfo = await this.raidGateInfoRepository.findOne({
        where: { id: selection.raidGateInfoId },
        relations: {
          raidInfo: true,
        },
      });

      if (!gateInfo) {
        throw new NotFoundException('관문 정보를 찾을 수 없습니다.');
      }

      if (selection.isExtraRewardSelected && !gateInfo.canExtraReward) {
        throw new BadRequestException('더보기가 불가능한 관문입니다.');
      }

      const entity = this.characterWeeklyRaidGateRepository.create({
        characterId,
        raidGateInfoId: selection.raidGateInfoId,
        weekStartDate,
        isCleared: false,
        isGoldEarned: false,
        isExtraRewardSelected: selection.isExtraRewardSelected,
        extraRewardCostSnapshot: selection.isExtraRewardSelected
          ? gateInfo.extraRewardCost
          : null,
        clearedAt: null,
      });

      const saved = await this.characterWeeklyRaidGateRepository.save(entity);
      savedEntities.push(saved);
    }

    return this.findByCharacterIdAndWeekStartDate(characterId, weekStartDate);
  }
}
