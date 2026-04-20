import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private async generateTokens(user: any) {
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '30d',
    });

    return { accessToken, refreshToken };
  }

  async signup(dto: SignupDto) {
    const { username, nickname, password } = dto;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.usersService.create(
      username,
      nickname,
      hashedPassword,
    );

    const { accessToken, refreshToken } = await this.generateTokens(user);

    await this.usersService.save({
      ...user,
      refreshToken,
    });

    return {
      message: '회원가입이 완료되었습니다.',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        role: user.role,
      },
    };
  }

  async login(dto: LoginDto) {
    const { username, password } = dto;
    const user = await this.usersService.findByUsername(username);

    if (!user) {
      throw new UnauthorizedException(
        '아이디 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException(
        '아이디 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    const { accessToken, refreshToken } = await this.generateTokens(user);

    user.refreshToken = refreshToken;
    await this.usersService.save(user);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        role: user.role,
        hasApiToken: user.hasApiToken,
      },
    };
  }

  async refresh(refreshToken: string) {
    try {
      const decoded = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_SECRET,
      });

      const user = await this.usersService.findById(decoded.sub);

      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('유효하지 않은 refresh token입니다.');
      }

      if (user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('refresh token이 일치하지 않습니다.');
      }

      const tokens = await this.generateTokens(user);

      user.refreshToken = tokens.refreshToken;
      await this.usersService.save(user);

      return tokens;
    } catch (error) {
      throw new UnauthorizedException(
        'refresh token이 만료되었거나 유효하지 않습니다.',
      );
    }
  }

  async logout(userId: number) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('유저를 찾을 수 없습니다.');
    }

    user.refreshToken = null;
    await this.usersService.save(user);

    return {
      message: '로그아웃되었습니다.',
    };
  }
}
