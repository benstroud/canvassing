import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { User } from './entities/user.entity';
import { USERS_REPOSITORY } from './constants';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USERS_REPOSITORY)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersRepository.findOneBy({
      username: username,
    });
    if (!user) {
      return null;
    }
    if (!(await user.validatePassword(pass))) {
      return null;
    }
    // Remove password from object.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async login(user: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const payload = { username: user.username, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
