import { DataSource } from 'typeorm';
import {
  DEFAULT_POSTGRES_DB,
  DEFAULT_POSTGRES_PASSWORD,
  DEFAULT_POSTGRES_PORT,
  DEFAULT_POSTGRES_USER,
  DATA_SOURCE,
} from './constants';

export const databaseProviders = [
  {
    provide: DATA_SOURCE,
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'postgres',
        host: process.env.POSTGRES_HOST || 'localhost',
        port: parseInt(
          (process.env.POSTGRES_PORT || DEFAULT_POSTGRES_PORT).toString(),
          10,
        ),
        username: process.env.POSTGRES_USER || DEFAULT_POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD || DEFAULT_POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB || DEFAULT_POSTGRES_DB,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        // TODO: For development only; use migrations in production
        synchronize: true,
      });

      return dataSource.initialize();
    },
  },
];

// To inject the provider in a service or controller, use the @Inject decorator with DATA_SOURCE token
// Example:
// import { Inject } from '@nestjs/common';
// import { DATA_SOURCE } from './constants';
// import { DataSource } from 'typeorm';

// export class SomeService {
//   constructor(
//     @Inject(DATA_SOURCE) private readonly dataSource: DataSource,
//   ) {}
// }

// To reference DATA_SOURCE in app.module.ts, include it in the providers array
// Example:
// import { Module } from '@nestjs/common';
// import { databaseProviders } from './database.providers';

// @Module({
//   providers: [...databaseProviders],
//   exports: [...databaseProviders],
// })
// export class AppModule {}
