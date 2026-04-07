import {
  Body,
  Controller,
  Post,
  Req,
  Get,
  UseGuards,
  ValidationPipe,
  Delete,
  Param,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth-guard';
import { RegisterLostarkApiKeyDto } from './dto/register-lostark-api-key.dto';
import { GetExpeditionPreviewDto } from './dto/get-expedition-preview.dto';
import { SyncCharactersDto } from './dto/sync-characters.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { CheckNicknameDto } from './dto/check-nickname.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() req: any) {
    return this.usersService.findById(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMe(@Req() req: any, @Body() dto: UpdateUserProfileDto) {
    const user = await this.usersService.updateProfile(req.user.userId, dto);

    return {
      message: '유저 정보가 수정되었습니다.',
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        role: user.role,
        hasApiToken: user.hasApiToken,
        mainCharacterName: user.mainCharacterName,
        updatedAt: user.updatedAt,
      },
    };
  }

  @Get('me/check-nickname')
  async checkNickname(@Query() dto: CheckNicknameDto) {
    return this.usersService.checkNicknameAvailable(dto.nickname);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/lostark-api-key')
  registerLostarkApiKey(
    @Req() req: any,
    @Body() registerLostarkApiKeyDto: RegisterLostarkApiKeyDto,
  ) {
    return this.usersService.registerLostarkApiKey(
      req.user.userId,
      registerLostarkApiKeyDto.apiKey,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/expedition-preview')
  getExpeditionPreview(@Req() req: any, @Body() dto: GetExpeditionPreviewDto) {
    return this.usersService.getExpeditionPreview(
      req.user.userId,
      dto.representativeCharacterName,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/characters/sync')
  syncCharacters(
    @Req() req: any,
    @Body(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    )
    syncCharactersDto: SyncCharactersDto,
  ) {
    return this.usersService.syncCharacters(
      req.user.userId,
      syncCharactersDto.characterNames,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/characters')
  getMyCharacters(@Req() req: any) {
    return this.usersService.getMyCharacters(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me/characters/:characterId')
  deleteMyCharacter(
    @Req() req: any,
    @Param('characterId', ParseIntPipe) characterId: number,
  ) {
    return this.usersService.deleteMyCharacter(req.user.userId, characterId);
  }
}
