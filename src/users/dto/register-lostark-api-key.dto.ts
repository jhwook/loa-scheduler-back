import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterLostarkApiKeyDto {
  @IsString()
  @IsNotEmpty()
  apiKey: string;
}
