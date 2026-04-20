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
    let entity = await this.characterWeeklyRaidGateRepository.findOne({
      where: {
        characterId,
        raidGateInfoId: data.raidGateInfoId,
      },
    });

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
    console.log(selections);
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

  async replaceWeeklyRaidGatesByRaid(
    characterId: number,
    raidInfoId: number,
    raidGateSelections: {
      raidGateInfoId: number;
      isExtraRewardSelected: boolean;
    }[],
  ) {
    const gateInfos = await this.raidGateInfoRepository.find({
      where: {
        raidInfoId,
      },
    });

    const gateInfoIds = gateInfos.map((gate) => gate.id);

    if (gateInfoIds.length === 0) {
      throw new NotFoundException(
        '해당 레이드의 관문 정보를 찾을 수 없습니다.',
      );
    }

    // 이 레이드에 속한 기존 숙제만 삭제
    await this.characterWeeklyRaidGateRepository.delete({
      characterId,
      raidGateInfoId: In(gateInfoIds),
    });

    if (!raidGateSelections.length) {
      return this.findByCharacterId(characterId);
    }

    const newEntities = [];

    for (const selection of raidGateSelections) {
      const gateInfo = await this.raidGateInfoRepository.findOne({
        where: { id: selection.raidGateInfoId },
      });

      if (!gateInfo) {
        continue;
      }

      if (gateInfo.raidInfoId !== raidInfoId) {
        throw new BadRequestException(
          '다른 레이드의 관문 정보가 포함되어 있습니다.',
        );
      }

      newEntities.push(
        this.characterWeeklyRaidGateRepository.create({
          characterId,
          raidGateInfoId: selection.raidGateInfoId,
          isCleared: false,
          isGoldEarned: false,
          isExtraRewardSelected: selection.isExtraRewardSelected,
          extraRewardCostSnapshot: selection.isExtraRewardSelected
            ? gateInfo.extraRewardCost
            : null,
          clearedAt: null,
        }),
      );
    }

    if (newEntities.length > 0) {
      await this.characterWeeklyRaidGateRepository.save(newEntities);
    }

    return this.findByCharacterId(characterId);
  }

  async updateWeeklyRaidOrders(
    characterId: number,
    raidOrders: {
      raidInfoId: number;
      orderNo: number;
    }[],
  ) {
    if (!raidOrders.length) {
      throw new BadRequestException('raidOrders는 비어 있을 수 없습니다.');
    }

    const existingWeeklyRaids =
      await this.characterWeeklyRaidGateRepository.find({
        where: { characterId },
        relations: {
          raidGateInfo: true,
        },
      });

    if (!existingWeeklyRaids.length) {
      throw new NotFoundException(
        '해당 캐릭터의 레이드 숙제를 찾을 수 없습니다.',
      );
    }

    // 중복 raidInfoId 방지
    const raidInfoIdSet = new Set<number>();
    for (const item of raidOrders) {
      if (raidInfoIdSet.has(item.raidInfoId)) {
        throw new BadRequestException(
          `중복된 raidInfoId가 있습니다. raidInfoId=${item.raidInfoId}`,
        );
      }
      raidInfoIdSet.add(item.raidInfoId);
    }

    // 기존 캐릭터 숙제에 실제로 존재하는 raidInfoId만 허용
    const existingRaidInfoIds = new Set(
      existingWeeklyRaids.map((item) => item.raidGateInfo.raidInfoId),
    );

    for (const item of raidOrders) {
      if (!existingRaidInfoIds.has(item.raidInfoId)) {
        throw new BadRequestException(
          `해당 캐릭터에 존재하지 않는 레이드입니다. raidInfoId=${item.raidInfoId}`,
        );
      }
    }

    // 같은 raidInfoId에 속한 관문들 전부 같은 orderNo로 변경
    const updateMap = new Map<number, number>();
    for (const item of raidOrders) {
      updateMap.set(item.raidInfoId, item.orderNo);
    }

    for (const weeklyRaid of existingWeeklyRaids) {
      const nextOrderNo = updateMap.get(weeklyRaid.raidGateInfo.raidInfoId);
      if (nextOrderNo !== undefined) {
        weeklyRaid.orderNo = nextOrderNo;
      }
    }

    await this.characterWeeklyRaidGateRepository.save(existingWeeklyRaids);

    return this.findByCharacterId(characterId);
  }
}
