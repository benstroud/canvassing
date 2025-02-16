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
  async jwtTokenFromUserAttributes(userAttributes: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const username = userAttributes.username;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const userid = userAttributes.userId;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const role = userAttributes.role;

    if (!username || !userid || !role) {
      throw new Error('Invalid user attributes');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const payload = {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      username: username,

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      sub: userid,

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      role: role,
    };
    console.info('jwtTokenFromUserAttributes payload:', payload);
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
