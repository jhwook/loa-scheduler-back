import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth-guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RaidInfoService } from './raid-info.service';
import { RaidGateInfoService } from './raid-gate-info.service';
import { CreateRaidInfoDto } from './dto/create-raid-info.dto';
import { CreateRaidGateInfoDto } from './dto/create-raid-gate-info.dto';
import { UpdateRaidGateInfoDto } from './dto/update-raid-gate-info.dto';
import { UpdateRaidInfoDto } from './dto/update-raid-info.dto';
import { UpdateRaidInfoOrderDto } from './dto/update-raid-info-order.dto';

@ApiTags('RaidInfo')
@ApiBearerAuth()
@Controller('raid-info')
export class RaidInfoController {
  constructor(
    private readonly raidInfoService: RaidInfoService,
    private readonly raidGateInfoService: RaidGateInfoService,
  ) {}

  @Get()
  @ApiOperation({ summary: '레이드 전체 목록 조회' })
  findAll() {
    return this.raidInfoService.findAllWithGates();
  }

  @Get('admin/raids')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: '관리자용 레이드 목록 조회' })
  findAllForAdmin() {
    return this.raidInfoService.findAllWithGates();
  }

  @Post('admin/raids')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: '레이드 추가 (관리자 전용)' })
  createRaid(@Body() dto: CreateRaidInfoDto) {
    return this.raidInfoService.createRaidInfo(dto);
  }

  @Get('admin/raids/:raidId/gates')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: '특정 레이드의 관문 목록 조회 (관리자 전용)' })
  findRaidGates(@Param('raidId', ParseIntPipe) raidId: number) {
    return this.raidGateInfoService.findByRaidInfoId(raidId);
  }

  @Post('admin/raids/:raidId/gates')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: '레이드 관문 추가 (관리자 전용)' })
  createRaidGate(
    @Param('raidId', ParseIntPipe) raidId: number,
    @Body() dto: CreateRaidGateInfoDto,
  ) {
    return this.raidGateInfoService.createRaidGateInfo({
      ...dto,
      raidInfoId: raidId,
    });
  }

  @Patch('admin/gates/:gateId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: '레이드 관문 수정 (관리자 전용)' })
  updateRaidGate(
    @Param('gateId', ParseIntPipe) gateId: number,
    @Body() dto: UpdateRaidGateInfoDto,
  ) {
    return this.raidGateInfoService.updateRaidGateInfo(gateId, dto);
  }

  @Delete('admin/gates/:gateId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: '레이드 관문 삭제 (관리자 전용)' })
  deleteRaidGate(@Param('gateId', ParseIntPipe) gateId: number) {
    return this.raidGateInfoService.deleteRaidGateInfo(gateId);
  }

  @Patch('admin/raids/:raidId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: '레이드 수정 (관리자 전용)' })
  updateRaid(
    @Param('raidId', ParseIntPipe) raidId: number,
    @Body() dto: UpdateRaidInfoDto,
  ) {
    return this.raidInfoService.updateRaidInfo(raidId, dto);
  }

  @Delete('admin/raids/:raidId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: '레이드 삭제 (관리자 전용)' })
  deleteRaid(@Param('raidId', ParseIntPipe) raidId: number) {
    return this.raidInfoService.deleteRaidInfo(raidId);
  }

  @Get(':raidId')
  @ApiOperation({ summary: '특정 레이드 상세 조회' })
  findOne(@Param('raidId', ParseIntPipe) raidId: number) {
    return this.raidInfoService.getRaidDetailForSelection(raidId);
  }

  @Patch('admin/order')
  @ApiOperation({ summary: '관리자 레이드 순서 변경' })
  updateRaidInfoOrders(@Body() dto: UpdateRaidInfoOrderDto) {
    return this.raidInfoService.updateRaidInfoOrders(dto.raidOrders);
  }
}
