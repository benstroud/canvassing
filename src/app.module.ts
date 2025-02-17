// Purpose: The main application module for the NestJS application.

import { Module } from '@nestjs/common';
import { DatabaseModule } from './database.module';

import {
  entityRepositoriesProviders,
  graphQLPubSubProvider,
} from './app.providers';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { CanvassingResolver } from './app.resolvers';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { AuthModule } from './auth.module';
import {
  CreateSuperUserCommand,
  DevTokenCommand,
  SeedCommand,
} from './commands/management.command';
import { Context } from 'graphql-ws';

@Module({
  imports: [
    // Wire up TypeOrm database access
    DatabaseModule,

    // Configure GraphQL
    GraphQLModule.forRoot<ApolloDriverConfig>({
      // Using Apollo Server
      driver: ApolloDriver,
      // Enable GraphQL Subscriptions support
      subscriptions: {
        'graphql-ws': {
          onConnect: (context: Context<any>) => {
            const { connectionParams, extra } = context;
            console.log(
              'onConnect connectionParams:',
              connectionParams,
              ' extra:',
              extra,
            );
            // TODO: Authenticate GraphQL WebSocket connection:
            // https://docs.nestjs.com/graphql/subscriptions#authentication-over-websockets
          },
        },
      },

      // GraphQL schema file will be generated here
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      // Debugging enabled for stack traces. Disable for production.
      debug: true,
      // Using Apollo Sandbox instead of graphql-playground
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      context: ({ req }) => ({ req }),
    }),
    // Wire up authentication
    AuthModule,
  ],
  // The REST API controllers
  controllers: [AppController],
  providers: [
    // TypeOrm entity repositories
    ...entityRepositoriesProviders,
    // Provides PUB_SUB for publishing updates for GraphQL subscriptions
    graphQLPubSubProvider,
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
  ],
  //exports: [graphQLPubSubProvider],
})
export class AppModule {}
