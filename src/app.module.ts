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

@Module({
  imports: [
    //TypeOrmModule.forRoot({ name: DATA_SOURCE })
    DatabaseModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      // Using Apollo Server
      driver: ApolloDriver,
      // GraphQL schema file will be generated here
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      // Debugging and playground
      debug: true,
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
    }),
  ],
  controllers: [AppController],
  providers: [...entityRepositoriesProviders, AppService, CanvassingResolver],
})
export class AppModule {}
