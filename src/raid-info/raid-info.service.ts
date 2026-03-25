import {
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
}
