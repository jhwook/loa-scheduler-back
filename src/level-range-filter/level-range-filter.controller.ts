import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth-guard';
import { LevelRangeFilterService } from './level-range-filter.service';
import { CreateLevelRangeFilterDto } from './dto/create-level-range-filter.dto';
import { UpdateLevelRangeFilterDto } from './dto/update-level-range-filter.dto';

@ApiTags('LevelRangeFilters')
@Controller('level-range-filters')
export class LevelRangeFilterController {
  constructor(
    private readonly levelRangeFilterService: LevelRangeFilterService,
  ) {}

  @Get()
  @ApiOperation({ summary: '활성 레벨 범위 필터 목록 조회' })
  findAllActive() {
    return this.levelRangeFilterService.findAllActive();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('admin')
  @ApiOperation({ summary: '관리자용 레벨 범위 필터 목록 조회' })
  findAllAdmin() {
    return this.levelRangeFilterService.findAllAdmin();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('admin')
  @ApiOperation({ summary: '관리자용 레벨 범위 필터 생성' })
  create(@Body() dto: CreateLevelRangeFilterDto) {
    return this.levelRangeFilterService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('admin/:id')
  @ApiOperation({ summary: '관리자용 레벨 범위 필터 수정' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLevelRangeFilterDto,
  ) {
    return this.levelRangeFilterService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete('admin/:id')
  @ApiOperation({ summary: '관리자용 레벨 범위 필터 삭제' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.levelRangeFilterService.remove(id);
  }
}
