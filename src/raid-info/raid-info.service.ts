import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RaidInfo } from './entities/raid-info.entity';

@Injectable()
export class RaidInfoService {
  constructor(
    @InjectRepository(RaidInfo)
    private readonly raidInfoRepository: Repository<RaidInfo>,
  ) {}

  async findAll() {
    return this.raidInfoRepository.find({
      where: {
        isActive: true,
      },
      order: {
        orderNo: 'ASC',
        id: 'ASC',
      },
    });
  }

  async findAllWithGates() {
    return this.raidInfoRepository.find({
      relations: {
        raidGates: true,
      },
      order: {
        orderNo: 'ASC',
        id: 'ASC',
      },
    });
  }

  async findOneById(id: number) {
    const raidInfo = await this.raidInfoRepository.findOne({
      where: { id },
      relations: {
        raidGates: true,
      },
    });

    if (!raidInfo) {
      throw new NotFoundException('레이드를 찾을 수 없습니다.');
    }

    return raidInfo;
  }

  async createRaidInfo(data: Partial<RaidInfo>) {
    const existing = await this.raidInfoRepository.findOne({
      where: { raidName: data.raidName },
    });

    if (existing) {
      throw new ConflictException('이미 존재하는 레이드입니다.');
    }

    const raidInfo = this.raidInfoRepository.create({
      raidName: data.raidName,
      description: data.description ?? null,
      partySize: data.partySize ?? 4,
      orderNo: data.orderNo ?? 0,
      isActive: data.isActive ?? true,
    });

    return this.raidInfoRepository.save(raidInfo);
  }

  async updateRaidInfo(id: number, data: Partial<RaidInfo>) {
    const raidInfo = await this.findOneById(id);

    if (data.raidName && data.raidName !== raidInfo.raidName) {
      const existing = await this.raidInfoRepository.findOne({
        where: { raidName: data.raidName },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException('이미 존재하는 레이드 이름입니다.');
      }
    }

    Object.assign(raidInfo, data);

    return this.raidInfoRepository.save(raidInfo);
  }

  async deleteRaidInfo(id: number) {
    const raidInfo = await this.findOneById(id);

    await this.raidInfoRepository.remove(raidInfo);

    return {
      message: '레이드가 삭제되었습니다.',
      deletedRaid: {
        id: raidInfo.id,
        raidName: raidInfo.raidName,
      },
    };
  }

  async getRaidDetailForSelection(raidId: number) {
    const raidInfo = await this.findOneById(raidId);

    const activeGates = [...(raidInfo.raidGates ?? [])]
      .filter((gate) => gate.isActive)
      .sort((a, b) => {
        const levelDiff = Number(b.minItemLevel) - Number(a.minItemLevel);
        if (levelDiff !== 0) return levelDiff;

        const orderDiff = a.orderNo - b.orderNo;
        if (orderDiff !== 0) return orderDiff;

        return a.gateNumber - b.gateNumber;
      });

    const difficultyMap = new Map<
      string,
      {
        difficulty: string;
        gates: Array<{
          raidGateInfoId: number;
          gateNumber: number;
          gateName: string | null;
          minItemLevel: number;
          rewardGold: number;
          boundGold: number;
          canExtraReward: boolean;
          extraRewardCost: number;
          isSingleMode: boolean;
        }>;
      }
    >();

    for (const gate of activeGates) {
      if (!difficultyMap.has(gate.difficulty)) {
        difficultyMap.set(gate.difficulty, {
          difficulty: gate.difficulty,
          gates: [],
        });
      }

      difficultyMap.get(gate.difficulty)!.gates.push({
        raidGateInfoId: gate.id,
        gateNumber: gate.gateNumber,
        gateName: gate.gateName,
        minItemLevel: Number(gate.minItemLevel),
        rewardGold: gate.rewardGold,
        boundGold: gate.boundGold,
        canExtraReward: gate.canExtraReward,
        extraRewardCost: gate.extraRewardCost,
        isSingleMode: gate.isSingleMode,
      });
    }

    return {
      id: raidInfo.id,
      raidName: raidInfo.raidName,
      description: raidInfo.description,
      difficulties: Array.from(difficultyMap.values()),
    };
  }

  async updateRaidInfoOrders(
    raidOrders: {
      raidInfoId: number;
      orderNo: number;
    }[],
  ) {
    if (!raidOrders.length) {
      throw new BadRequestException('raidOrders는 비어 있을 수 없습니다.');
    }

    const raidInfos = await this.raidInfoRepository.find();

    if (!raidInfos.length) {
      throw new NotFoundException('레이드 정보를 찾을 수 없습니다.');
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

    const existingRaidInfoIds = new Set(raidInfos.map((raid) => raid.id));

    for (const item of raidOrders) {
      if (!existingRaidInfoIds.has(item.raidInfoId)) {
        throw new BadRequestException(
          `존재하지 않는 레이드입니다. raidInfoId=${item.raidInfoId}`,
        );
      }
    }

    const updateMap = new Map<number, number>();
    for (const item of raidOrders) {
      updateMap.set(item.raidInfoId, item.orderNo);
    }

    for (const raidInfo of raidInfos) {
      const nextOrderNo = updateMap.get(raidInfo.id);
      if (nextOrderNo !== undefined) {
        raidInfo.orderNo = nextOrderNo;
      }
    }

    await this.raidInfoRepository.save(raidInfos);

    return this.raidInfoRepository.find({
      order: {
        orderNo: 'ASC',
        id: 'ASC',
      },
    });
  }
}
