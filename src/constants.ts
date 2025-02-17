// This file contains constants used throughout the application.

export const DEFAULT_POSTGRES_USER = 'canvassing_dev';
export const DEFAULT_POSTGRES_PASSWORD = 'canvassing_dev';
export const DEFAULT_POSTGRES_DB = 'canvassing_dev';
export const DEFAULT_POSTGRES_PORT = 5432;
export const DEV_SQLITE_DB = 'canvassing-development.sqlite';

// Key name for database dependency injection.
export const DATA_SOURCE = 'DATA_SOURCE';
// Key name for GraphQL pub/sub dependency injection.
export const PUB_SUB = 'PUB_SUB';

// Key names for TypeORM entity repository dependency injection.
export const ORGANIZATIONS_REPOSITORY = 'ORGANIZATIONS_REPOSITORY';
export const ADDRESSES_REPOSITORY = 'ADDRESSES_REPOSITORY';
export const ADDRESSLISTS_REPOSITORY = 'ADDRESSLISTS_REPOSITORY';
export const ANSWERS_REPOSITORY = 'ANSWERS_REPOSITORY';
export const QUESTIONS_REPOSITORY = 'QUESTIONS_REPOSITORY';
export const QUESTIONNAIRE_REPOSITORY = 'QUESTIONNAIRE_REPOSITORY';
export const USERS_REPOSITORY = 'USERS_REPOSITORY';

export const jwtConstants = {
  secret:
    'DO NOT USE THIS VALUE. INSTEAD, CREATE A COMPLEX SECRET AND KEEP IT SAFE OUTSIDE OF THE SOURCE CODE.',
};
// Used in main.ts .addBearerAuth() to set the name of the bearer token. Also
// must match in @ApiBearerAuth(BEARER_AUTH_NAME) for Swagger UI auth to work.
export const BEARER_AUTH_NAME = 'access-token';

// Used by auth/roles.decorator.ts
export const ROLES_KEY = 'roles';
// Users can have one of two roles: ADMIN or PARTNER.
export enum UserRole {
  ADMIN = 'admin',
  PARTNER = 'partner',
}
