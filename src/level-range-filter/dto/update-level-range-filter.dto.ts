import { PartialType } from '@nestjs/swagger';
import { CreateLevelRangeFilterDto } from './create-level-range-filter.dto';

export class UpdateLevelRangeFilterDto extends PartialType(
  CreateLevelRangeFilterDto,
) {}
