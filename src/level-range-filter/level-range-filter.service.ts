import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LevelRangeFilter } from './entities/level-range-filter.entity';
import { CreateLevelRangeFilterDto } from './dto/create-level-range-filter.dto';
import { UpdateLevelRangeFilterDto } from './dto/update-level-range-filter.dto';

@Injectable()
export class LevelRangeFilterService {
  constructor(
    @InjectRepository(LevelRangeFilter)
    private readonly levelRangeFilterRepository: Repository<LevelRangeFilter>,
  ) {}

  async findAllAdmin() {
    return this.levelRangeFilterRepository.find({
      order: {
        orderNo: 'ASC',
        id: 'ASC',
      },
    });
  }

  async findAllActive() {
    return this.levelRangeFilterRepository.find({
      where: {
        isActive: true,
      },
      order: {
        orderNo: 'ASC',
        id: 'ASC',
      },
    });
  }

  async findOneById(id: number) {
    const entity = await this.levelRangeFilterRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new NotFoundException('레벨 범위 필터를 찾을 수 없습니다.');
    }

    return entity;
  }

  private validateRange(minLevel: number, maxLevel?: number | null) {
    if (maxLevel != null && minLevel > maxLevel) {
      throw new BadRequestException('minLevel은 maxLevel보다 클 수 없습니다.');
    }
  }

  async create(data: CreateLevelRangeFilterDto) {
    this.validateRange(data.minLevel, data.maxLevel ?? null);

    const entity = this.levelRangeFilterRepository.create({
      label: data.label,
      minLevel: data.minLevel.toFixed(2),
      maxLevel: data.maxLevel != null ? data.maxLevel.toFixed(2) : null,
      orderNo: data.orderNo,
      isActive: data.isActive ?? true,
    });

    return this.levelRangeFilterRepository.save(entity);
  }

  async update(id: number, data: UpdateLevelRangeFilterDto) {
    const entity = await this.findOneById(id);

    const nextMinLevel =
      data.minLevel != null ? data.minLevel : Number(entity.minLevel);
    const nextMaxLevel =
      data.maxLevel !== undefined
        ? data.maxLevel ?? null
        : entity.maxLevel != null
        ? Number(entity.maxLevel)
        : null;

    this.validateRange(nextMinLevel, nextMaxLevel);

    if (data.label !== undefined) {
      entity.label = data.label;
    }

    if (data.minLevel !== undefined) {
      entity.minLevel = data.minLevel.toFixed(2);
    }

    if (data.maxLevel !== undefined) {
      entity.maxLevel = data.maxLevel != null ? data.maxLevel.toFixed(2) : null;
    }

    if (data.orderNo !== undefined) {
      entity.orderNo = data.orderNo;
    }

    if (data.isActive !== undefined) {
      entity.isActive = data.isActive;
    }

    return this.levelRangeFilterRepository.save(entity);
  }

  async remove(id: number) {
    const entity = await this.findOneById(id);
    await this.levelRangeFilterRepository.remove(entity);

    return {
      message: '레벨 범위 필터가 삭제되었습니다.',
      deletedLevelRangeFilter: {
        id: entity.id,
        label: entity.label,
      },
    };
  }
}
