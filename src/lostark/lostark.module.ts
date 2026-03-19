import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LostarkService } from './lostark.service';

@Module({
  imports: [
    ConfigModule,
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        baseURL: configService.get<string>('LOSTARK_API_BASE_URL'),
        timeout: 5000,
        headers: {
          accept: 'application/json',
        },
      }),
    }),
  ],
  providers: [LostarkService],
  exports: [LostarkService],
})
export class LostarkModule {}
