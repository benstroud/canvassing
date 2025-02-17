// DI Service providers for database access

import { DataSource, DataSourceOptions } from 'typeorm';
import {
  DEFAULT_POSTGRES_DB,
  DEFAULT_POSTGRES_PASSWORD,
  DEFAULT_POSTGRES_PORT,
  DEFAULT_POSTGRES_USER,
  DATA_SOURCE,
  DEV_SQLITE_DB,
} from './constants';

const entityPattern = [__dirname + '/**/*.entity{.ts,.js}'];

// Example PostgreSQL configuration for production deployment.
const postgresDataSourceConfig = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(
    (process.env.POSTGRES_PORT || DEFAULT_POSTGRES_PORT).toString(),
    10,
  ),
  username: process.env.POSTGRES_USER || DEFAULT_POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD || DEFAULT_POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB || DEFAULT_POSTGRES_DB,
  entities: entityPattern,
  // TODO: For development only; use migrations in production
  synchronize: true,
} as DataSourceOptions;

const devSqliteDataSourceConfig = {
  type: 'sqlite',
  database: __dirname + '/../' + DEV_SQLITE_DB,
  entities: entityPattern,
  synchronize: true,
} as DataSourceOptions;

const testSqliteDataSourceConfig = {
  type: 'sqlite',
  database: ':memory:',
  entities: entityPattern,
  synchronize: true,
} as DataSourceOptions;

export const databaseProviders = [
  {
    provide: DATA_SOURCE,
    useFactory: async () => {
      if (process.env.NODE_ENV === 'test') {
        return new DataSource(testSqliteDataSourceConfig).initialize();
      } else if (process.env.NODE_ENV === 'dev') {
        return new DataSource(devSqliteDataSourceConfig).initialize();
      } else {
        return new DataSource(postgresDataSourceConfig).initialize();
      }
    },
  },
];
