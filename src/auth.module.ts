import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { LocalAuthStrategy } from './auth/local.strategy';
import { DatabaseModule } from './database.module';
import { AuthService } from './auth.service';
import { DATA_SOURCE, jwtConstants, USERS_REPOSITORY } from './constants';
import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthStrategy } from './auth/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    DatabaseModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '90d' },
    }),
  ],
  providers: [
    {
      provide: USERS_REPOSITORY,
      useFactory: (dataSource: DataSource) => dataSource.getRepository(User),
      inject: [DATA_SOURCE],
    },
    LocalAuthStrategy,
    JwtAuthStrategy,
    AuthService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
