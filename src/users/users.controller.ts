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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth-guard';
import { RegisterLostarkApiKeyDto } from './dto/register-lostark-api-key.dto';
import { GetExpeditionPreviewDto } from './dto/get-expedition-preview.dto';
import { SyncCharactersDto } from './dto/sync-characters.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
