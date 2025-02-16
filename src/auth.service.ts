import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
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

  // Obtain JWT token for user with password check
  async signIn(
    username: string,
    pass: string,
  ): Promise<{ access_token: string }> {
    const user = await this.usersRepository.findOneBy({ username: username });
    if (!user) {
      throw new UnauthorizedException();
    }
    const isValid = await user.validatePassword(pass);
    if (!isValid) {
      throw new UnauthorizedException();
    }
    // Strip password from user object.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;

    // Payload for JWT signing.
    const payload = { sub: user.id, username: user.username, role: user.role };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  // Obtain JWT token for user witout password check. Should only be used for
  // management command
  async jwtFromUsernameOnly(username: string): Promise<string> {
    const user = await this.usersRepository.findOneBy({ username: username });
    if (!user) {
      throw new UnauthorizedException();
    }
    const payload = { sub: user.id, username: user.username, role: user.role };
    return this.jwtService.signAsync(payload);
  }
}
