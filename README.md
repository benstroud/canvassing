## Description

### Diagram

```mermaid
flowchart TD
    A[Mobile App]
    B[Website]
    C[NestJS REST Endpoints]
    D[NestJS GraphQL Endpoints]
    E[PostgreSQL Database]

    A -->|HTTP Requests / WS| C
    B -->|HTTP Requests / WS| C
    C -->|Database queries| E
    C -->|Publishes events| D
    D -->|Pushes updates| A
    D -->|Pushes updates| B
```

## Overview

## Demo

For demo purposes, we'll use a local SQLite database instead of a database server. The following command will build the application and generate demo data stored to the canvassing-development.sqlite file.

```bash
npm run build && rm ./canvassing-development.sqlite; npm run manage:dev seed
```

You can then start the development server:

```bash
npm run start:dev
```

Then, you can visit the following in your browser to explore the API.

- OpenAPI/Swagger Playground UI: <http://localhost:3000/api>
- GraphQL Playground UI: <Http://Localhost:3000/Graphql>

### Authentication

REST and GRAPHQL requests must be authenticated with a JWT token. The token should be included in HTTP requests with header name `Authentication` and value formatted as `Bearer <JWT_TOKEN>`.

For the demo, generate an auth tokens for use with the development server:

### Admin user token

To generate a JWT token for the `admin` user that was generated when seeing the development database:

```bash
$ npm run manage:dev devtoken admin
Bearer ...
```

### Non-admin user token

To generate a JWT token for the non-admin `demo` user that was generated when seeding the development database:

```bash
$ npm run manage:dev devtoken demo
Bearer ...
```

Next, copy/save the generated tokens to then use with the REST and GraphQL
playgrounds. The copied value will look something like the following but with a
different token value:

```text
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwic3ViIjoxLCJpYXQiOjE3Mzk2NzI2NDgsImV4cCI6MTc0NzQ0ODY0OH0.iO89OCf-1avukhGULLtU6sP9brfA6zyhNpuLb_ptKdQ
```

The following is a a curl example, utilizing the JWT token in the HTTP request
header:

```bash
$ curl -X 'GET' \
  'http://localhost:3000/partner/organization' \
  -H 'accept: */*' -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwic3ViIjoxLCJpYXQiOjE3Mzk2NzI2NDgsImV4cCI6MTc0NzQ0ODY0OH0.iO89OCf-1avukhGULLtU6sP9brfA6zyhNpuLb_ptKdQ'
{"id":1,"name":"Gutkowski, Flatley and Douglas"}
```

#### Setting the auth token for the GraphQL explorer

After starting the development server, visit <http://localhost:3000/graphql>. In
the upper left hand corner you will see a gear icon to open connection settings.
Once opened, paste in the generated token, using the pattern `Bearer <JWT_TOKEN>`,
into the Shared Headers section, and set the header name to `Authorization`.
Once saved, the GraphQL Playground will begin including the auth token in
requests for the associated user account that has been seeded in the database
for the demo.

![GraphQL Playground Connection Settings](./readme_assets/gql_playground_connection_settings.png)
![GraphQL Playground Bearer Auth](./readme_assets/gql_playground_bearer_auth.png)

#### Setting the auth token for the Swagger REST/OpenAPI explorer

After starting the development server, visit <http://localhost:3000/api>. In the upper right hand side you will find a button labeled "Authorize". Click that button and then enter the generated token using the pattern `Bearer <JWT_TOKEN>`.

![Swagger Playground Auth Settings](./readme_assets/openai_playground_auth_settings.png)
![GraphQL Playground Bearer Auth](./readme_assets/openai_playground_bearer_entry.png)

#### Example GraphQL query

```graphql
query MyAccount {
  myAccount {
    id
    role
    username
    organizations {
      id
      name
      questionnaires {
        id
        questions {
          id
          text
          answers {
            id
            text
          }
        }  
      }
      addressLists {
        title
        addresses {
          id
          address1
          address2
          city
          state
          zipcode
        }
      }
    }
    
  }
}
```

## Steps I took setting up the project

```bash
node --version # v20.18.2
npm --version # v10.8.2
alias nest='npx @nestjs/cli@11.0.2'
nest --version # 11.0.2

nest new canvassing
npm i
npm install typeorm --save
npm install reflect-metadata --save
npm install @types/node --save-dev
npm install pg --save
npm install --save @nestjs/typeorm typeorm pg
npm install -g @mermaid-js/mermaid-cli
npm install --save @nestjs/swagger
npm i @nestjs/graphql @nestjs/apollo @apollo/server graphql --save
npm i --save bcrypt
# npm install --save @nestjs/passport passport passport-local
# npm install --save-dev @types/passport-local
#npm install --save @nestjs/jwt passport-jwt
#npm install --save-dev @types/passport-jwt
npm install --save sqlite3
npm install nest-commander --save
# npm i graphql-ws --save
npm i graphql-subscriptions --save
```

## Development Environment

### Sqlite3 development database

For convenience, setting the `NODE_ENV` environment variable to `dev` will
configure the app to use a SQLite database file
(./canvassing-development.sqlite) instead of PostgreSQL which would be
recommended for production. See <./src/database.providers.ts> for the configuration of
each.

### PostgreSQL locally for development

[Docker compose](https://docs.docker.com/compose/) is utilized for local development to provide a development PostgreSQL database. The <./docker-compose.yml> file sets the database and user name, and password default. You can override the password by setting the `POSTGRES_PASSWORD` environment variable.

```bash
# Start PostgreSQL locally, in the background.
$ docker-compose up -d
```

## Commands

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# watch mode + debugging
$ npm run start:debug

## Nest.js - Run tests

```bash
# unit tests
$ npm run test

## Nest.js -- Deployment

[Nest deployment documentation](https://docs.nestjs.com/deployment)



## Nest.js -- Resources

Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
