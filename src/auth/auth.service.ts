import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto) {
    const { username, password } = signupDto;

    const existingUser = await this.usersService.findByUsername(username);

    if (existingUser) {
      throw new BadRequestException('이미 존재하는 아이디입니다.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.usersService.create(username, hashedPassword);

    return {
      message: '회원가입 성공',
      user: {
        id: user.id,
        username: user.username,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

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

    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      message: '로그인 성공',
      accessToken,
      user: {
        id: user.id,
        username: user.username,
      },
    };
  }
}
