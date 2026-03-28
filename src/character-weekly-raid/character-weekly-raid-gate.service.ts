import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CharacterWeeklyRaidGate } from './entities/character-weekly-raid-gate.entity';
import { RaidGateInfo } from '../raid-info/entities/raid-gate-info.entity';

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

  async findByCharacterId(characterId: number) {
    return this.characterWeeklyRaidGateRepository.find({
      where: {
        characterId,
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

  async findByCharacterIds(characterIds: number[]) {
    if (characterIds.length === 0) {
      return [];
    }

    return this.characterWeeklyRaidGateRepository.find({
      where: {
        characterId: In(characterIds),
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

  async findOneByCharacterIdAndRaidGateInfoId(
    characterId: number,
    raidGateInfoId: number,
  ) {
    return this.characterWeeklyRaidGateRepository.findOne({
      where: {
        characterId,
        raidGateInfoId,
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

  async deleteById(id: number) {
    return this.characterWeeklyRaidGateRepository.delete({ id });
  }

  async deleteByCharacterId(characterId: number) {
    return this.characterWeeklyRaidGateRepository.delete({ characterId });
  }

  async addWeeklyRaidGate(
    characterId: number,
    raidGateInfoId: number,
    isExtraRewardSelected: boolean,
  ) {
    const existing = await this.findOneByCharacterIdAndRaidGateInfoId(
      characterId,
      raidGateInfoId,
    );

    if (existing) {
      return existing;
    }

    const gateInfo = await this.raidGateInfoRepository.findOne({
      where: { id: raidGateInfoId },
      relations: {
        raidInfo: true,
      },
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

  async addWeeklyRaidGates(
    characterId: number,
    selections: Array<{
      raidGateInfoId: number;
      isExtraRewardSelected: boolean;
    }>,
  ) {
    for (const selection of selections) {
      await this.addWeeklyRaidGate(
        characterId,
        selection.raidGateInfoId,
        selection.isExtraRewardSelected,
      );
    }

    return this.findByCharacterId(characterId);
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

  async resetWeeklyStates() {
    const entities = await this.characterWeeklyRaidGateRepository.find();

    for (const entity of entities) {
      entity.isCleared = false;
      entity.isGoldEarned = false;
      entity.isExtraRewardSelected = false;
      entity.extraRewardCostSnapshot = null;
      entity.clearedAt = null;
    }

    return this.characterWeeklyRaidGateRepository.save(entities);
  }

  async updateClearStatus(id: number, isCleared: boolean) {
    const entity = await this.characterWeeklyRaidGateRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new NotFoundException('숙제를 찾을 수 없습니다.');
    }

    entity.isCleared = isCleared;
    entity.clearedAt = isCleared ? new Date() : null;

    return this.characterWeeklyRaidGateRepository.save(entity);
  }

  async upsertWeeklyRaidGate(
    characterId: number,
    data: {
      raidGateInfoId: number;
      isExtraRewardSelected: boolean;
    },
  ) {
    console.log(
      'upsertWeeklyRaidGate called with characterId:',
      characterId,
      'and data:',
      data,
    );
    let entity = await this.characterWeeklyRaidGateRepository.findOne({
      where: {
        characterId,
        raidGateInfoId: data.raidGateInfoId,
      },
    });
    console.log('Existing entity:', entity);
    const gateInfo = await this.raidGateInfoRepository.findOne({
      where: { id: data.raidGateInfoId },
    });
    console.log('Gate info:', gateInfo);
    if (!gateInfo) {
      throw new NotFoundException('관문 정보를 찾을 수 없습니다.');
    }

    if (data.isExtraRewardSelected && !gateInfo.canExtraReward) {
      throw new BadRequestException('더보기가 불가능한 관문입니다.');
    }

    // 있으면 update
    if (entity) {
      entity.isExtraRewardSelected = data.isExtraRewardSelected;
      entity.extraRewardCostSnapshot = data.isExtraRewardSelected
        ? gateInfo.extraRewardCost
        : null;

      return this.characterWeeklyRaidGateRepository.save(entity);
    }

    // 없으면 create
    entity = this.characterWeeklyRaidGateRepository.create({
      characterId,
      raidGateInfoId: data.raidGateInfoId,
      isCleared: false,
      isGoldEarned: false,
      isExtraRewardSelected: data.isExtraRewardSelected,
      extraRewardCostSnapshot: data.isExtraRewardSelected
        ? gateInfo.extraRewardCost
        : null,
      clearedAt: null,
    });

    return this.characterWeeklyRaidGateRepository.save(entity);
  }

  async replaceWeeklyRaidGates(
    characterId: number,
    selections: Array<{
      raidGateInfoId: number;
      isExtraRewardSelected: boolean;
    }>,
  ) {
    const existing = await this.characterWeeklyRaidGateRepository.find({
      where: { characterId },
    });

    const existingMap = new Map(
      existing.map((item) => [item.raidGateInfoId, item]),
    );

    const incomingIds = selections.map((item) => item.raidGateInfoId);

    const entitiesToSave: CharacterWeeklyRaidGate[] = [];

    for (const selection of selections) {
      const gateInfo = await this.raidGateInfoRepository.findOne({
        where: { id: selection.raidGateInfoId },
        relations: {
          raidInfo: true,
        },
      });

      if (!gateInfo) {
        throw new NotFoundException(
          `관문 정보를 찾을 수 없습니다. id=${selection.raidGateInfoId}`,
        );
      }

      if (selection.isExtraRewardSelected && !gateInfo.canExtraReward) {
        throw new BadRequestException('더보기가 불가능한 관문입니다.');
      }

      const existingEntity = existingMap.get(selection.raidGateInfoId);

      if (existingEntity) {
        existingEntity.isExtraRewardSelected = selection.isExtraRewardSelected;
        existingEntity.extraRewardCostSnapshot = selection.isExtraRewardSelected
          ? gateInfo.extraRewardCost
          : null;

        entitiesToSave.push(existingEntity);
      } else {
        const newEntity = this.characterWeeklyRaidGateRepository.create({
          characterId,
          raidGateInfoId: selection.raidGateInfoId,
          isCleared: false,
          isGoldEarned: false,
          isExtraRewardSelected: selection.isExtraRewardSelected,
          extraRewardCostSnapshot: selection.isExtraRewardSelected
            ? gateInfo.extraRewardCost
            : null,
          clearedAt: null,
        });

        entitiesToSave.push(newEntity);
      }
    }

    const entitiesToDelete = existing.filter(
      (item) => !incomingIds.includes(item.raidGateInfoId),
    );

    if (entitiesToDelete.length > 0) {
      await this.characterWeeklyRaidGateRepository.remove(entitiesToDelete);
    }

    await this.characterWeeklyRaidGateRepository.save(entitiesToSave);

    return this.findByCharacterId(characterId);
  }

  async deleteWeeklyRaidGatesByRaidInfo(
    characterId: number,
    raidInfoId: number,
  ) {
    const targets = await this.characterWeeklyRaidGateRepository.find({
      where: {
        characterId,
      },
      relations: {
        raidGateInfo: {
          raidInfo: true,
        },
      },
    });

    const toDelete = targets.filter(
      (item) => item.raidGateInfo?.raidInfoId === raidInfoId,
    );

    if (toDelete.length === 0) {
      return {
        message: '삭제할 레이드 숙제가 없습니다.',
        deletedCount: 0,
      };
    }

    await this.characterWeeklyRaidGateRepository.remove(toDelete);

    return {
      message: '레이드 숙제가 삭제되었습니다.',
      deletedCount: toDelete.length,
      deletedRaidInfoId: raidInfoId,
    };
  }
}
