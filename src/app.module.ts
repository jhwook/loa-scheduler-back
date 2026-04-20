import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CharactersModule } from './characters/characters.module';
import { LostarkModule } from './lostark/lostark.module';
import { RaidInfoModule } from './raid-info/raid-info.module';
import { CharacterWeeklyRaidGateModule } from './character-weekly-raid/character-weekly-raid-gate.module';
import { PartyGroupModule } from './party-group/party-group.module';
import { RaidPartyModule } from './raid-party/raid-party.module';
import { LevelRangeFilterModule } from './level-range-filter/level-range-filter.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        const isProduction =
          configService.get<string>('NODE_ENV') === 'production';

        if (databaseUrl) {
          return {
            type: 'postgres' as const,
            url: databaseUrl,
            autoLoadEntities: true,
            synchronize: true,
            ssl: isProduction ? { rejectUnauthorized: false } : false,
          };
        }

        return {
          type: 'postgres' as const,
          host: configService.get<string>('DB_HOST'),
          port: Number(configService.get<string>('DB_PORT')),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_DATABASE'),
          autoLoadEntities: true,
          synchronize: true,
          ssl: isProduction ? { rejectUnauthorized: false } : false,
        };
      },
    }),
    UsersModule,
    AuthModule,
    CharactersModule,
    LostarkModule,
    RaidInfoModule,
    CharacterWeeklyRaidGateModule,
    PartyGroupModule,
    RaidPartyModule,
    LevelRangeFilterModule,
    ScheduleModule,
  ],
})
export class AppModule {}
