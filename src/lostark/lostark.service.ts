import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class LostarkService {
  constructor(private readonly httpService: HttpService) {}

  async getSiblings(characterName: string, apiToken: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `/characters/${encodeURIComponent(characterName)}/siblings`,
          {
            headers: {
              authorization: `bearer ${apiToken}`,
            },
          },
        ),
      );

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;

      if (axiosError.response) {
        throw new HttpException(
          axiosError.response.data || '로아 API 요청 실패',
          axiosError.response.status,
        );
      }

      throw new InternalServerErrorException(
        '로아 API 통신 중 오류가 발생했습니다.',
      );
    }
  }

  async getCharacterProfile(characterName: string, apiToken: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `/armories/characters/${encodeURIComponent(characterName)}/profiles`,
          {
            headers: {
              authorization: `bearer ${apiToken.trim()}`,
            },
          },
        ),
      );

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;

      if (axiosError.response) {
        throw new HttpException(
          axiosError.response.data || '로스트아크 프로필 조회 실패',
          axiosError.response.status,
        );
      }

      throw new InternalServerErrorException(
        '로스트아크 API 통신 중 오류가 발생했습니다.',
      );
    }
  }

  async validateApiKey(apiToken: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get('/news/notices', {
          headers: {
            authorization: `bearer ${apiToken}`,
          },
        }),
      );

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;

      if (axiosError.response) {
        throw new HttpException(
          '유효하지 않은 로스트아크 API 토큰입니다.',
          axiosError.response.status,
        );
      }

      throw new InternalServerErrorException(
        '토큰 검증 중 오류가 발생했습니다.',
      );
    }
  }
}
