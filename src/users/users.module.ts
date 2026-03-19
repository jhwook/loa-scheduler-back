import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { LostarkModule } from 'src/lostark/lostark.module';
import { CharactersModule } from 'src/characters/characters.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), LostarkModule, CharactersModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
