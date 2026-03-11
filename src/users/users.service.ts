import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

export interface User {
  id: number;
  email: string;
  passwordHash: string;
}

@Injectable()
export class UsersService {
  private users: User[] = [];
  private nextId = 1;

  async create(email: string, password: string): Promise<User> {
    const existing = await this.findByEmail(email);
    if (existing) {
      throw new Error('User already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user: User = {
      id: this.nextId++,
      email,
      passwordHash,
    };

    this.users.push(user);
    return user;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.users.find((user) => user.email === email);
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (!user) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return null;
    }

    return user;
  }
}

