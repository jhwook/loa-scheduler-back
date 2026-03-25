import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RaidGateInfo } from './entities/raid-gate-info.entity';

@Injectable()
export class RaidGateInfoService {
  constructor(
    @InjectRepository(RaidGateInfo)
    private readonly raidGateInfoRepository: Repository<RaidGateInfo>,
  ) {}

  async findAll() {
    return this.raidGateInfoRepository.find({
      relations: {
        raidInfo: true,
      },
      order: {
        minItemLevel: 'DESC',
        orderNo: 'ASC',
        gateNumber: 'ASC',
      },
    });
  }

  async findByRaidInfoId(raidInfoId: number) {
    return this.raidGateInfoRepository.find({
      where: {
        raidInfoId,
      },
      relations: {
        raidInfo: true,
      },
      order: {
        orderNo: 'ASC',
        gateNumber: 'ASC',
      },
    });
  }

  async findOneById(id: number) {
    const gate = await this.raidGateInfoRepository.findOne({
      where: { id },
      relations: {
        raidInfo: true,
      },
    });

    if (!gate) {
      throw new NotFoundException('레이드 관문 정보를 찾을 수 없습니다.');
    }

    return gate;
  }

  async createRaidGateInfo(data: Partial<RaidGateInfo>) {
    const existing = await this.raidGateInfoRepository.findOne({
      where: {
        raidInfoId: data.raidInfoId,
        difficulty: data.difficulty,
        gateNumber: data.gateNumber,
      },
    });

    if (existing) {
      throw new ConflictException('이미 존재하는 레이드 관문 정보입니다.');
    }

    const gate = this.raidGateInfoRepository.create({
      raidInfoId: data.raidInfoId,
      difficulty: data.difficulty,
      gateNumber: data.gateNumber,
      gateName: data.gateName ?? null,
      minItemLevel: data.minItemLevel,
      rewardGold: data.rewardGold ?? 0,
      boundGold: data.boundGold ?? 0,
      isSingleMode: data.isSingleMode ?? false,
      canExtraReward: data.canExtraReward ?? false,
      extraRewardCost: data.extraRewardCost ?? 0,
      orderNo: data.orderNo ?? 0,
      isActive: data.isActive ?? true,
    });

    return this.raidGateInfoRepository.save(gate);
  }

  async updateRaidGateInfo(id: number, data: Partial<RaidGateInfo>) {
    const gate = await this.findOneById(id);

    if (data.difficulty || data.gateNumber) {
      const existing = await this.raidGateInfoRepository.findOne({
        where: {
          raidInfoId: gate.raidInfoId,
          difficulty: data.difficulty ?? gate.difficulty,
          gateNumber: data.gateNumber ?? gate.gateNumber,
        },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException('이미 존재하는 관문입니다.');
      }
    }

    Object.assign(gate, data);

    return this.raidGateInfoRepository.save(gate);
  }

  async deleteRaidGateInfo(id: number) {
    const gate = await this.findOneById(id);

    await this.raidGateInfoRepository.remove(gate);

    return {
      message: '삭제되었습니다.',
    };
  }
}
