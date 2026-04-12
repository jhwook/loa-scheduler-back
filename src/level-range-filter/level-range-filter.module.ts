import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LevelRangeFilter } from './entities/level-range-filter.entity';
import { LevelRangeFilterService } from './level-range-filter.service';
import { LevelRangeFilterController } from './level-range-filter.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LevelRangeFilter])],
  controllers: [LevelRangeFilterController],
  providers: [LevelRangeFilterService],
  exports: [LevelRangeFilterService],
})
export class LevelRangeFilterModule {}
