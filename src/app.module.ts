import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
/* import { AppController } from './app.controller';
import { AppService } from './app.service'; */
// import { DATA_SOURCE } from './constants';
import { DatabaseModule } from './database.module';

import { entityRepositoriesProviders } from './app.providers';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { CanvassingResolver } from './app.resolvers';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { AuthModule } from './auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import {
  CreateSuperUserCommand,
  DevTokenCommand,
  SeedCommand,
} from './commands/management.command';

@Module({
  imports: [
    // Wire up TypeOrm database access
    DatabaseModule,

    // Configure GraphQL
    GraphQLModule.forRoot<ApolloDriverConfig>({
      // Using Apollo Server
      driver: ApolloDriver,
      // GraphQL schema file will be generated here
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      // Debugging enabled for stack traces. Disable for production.
      debug: true,
      // Using Apollo Sandbox instead of graphql-playground
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
    }),
    // Wire up authentication
    AuthModule,
  ],
  // The REST API controllers
  controllers: [AppController],
  providers: [
    // TypeOrm entity repositories
    ...entityRepositoriesProviders,
    // The service routines supporting the REST API and GraphQL resolvers
    AppService,
    // The GraphQL resolvers
    CanvassingResolver,
    // Management commands
    //   - To create an admin user.
    ...CreateSuperUserCommand.registerWithSubCommands(),
    //   - To populate the database with initial data.
    ...SeedCommand.registerWithSubCommands(),
    //   - To generate a JWT token for a user.
    ...DevTokenCommand.registerWithSubCommands(),
    // Enable JWT authentication globally.
    // APP_GUARD is a special token that tells Nest to use JwtAuthGuard globally.
    // The @Public() decorator can be used to allow public access to specific routes.
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
