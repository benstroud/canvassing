# Canvassing API

Objective: Develop a backend API to support a civic canvassing service. This API will be used by both a mobile application and a website to facilitate the delivery of questionnaires and the capture of responses on a per household basis.

Scenario: A typical user of this service is a volunteer performing door-to-door
canvassing efforts for an organization. The volunteer selects a postal address
(known as a household) from a shared list of addresses and visits that location
to record answers from a member of the household, reading from an assigned
questionnaire. Multiple volunteers from the same organization may use the
service concurrently.

Key functionality includes:

* Shared Household List: Volunteers have access to a shared list of households to canvas.
* Real-Time Updates: Once a household's questionnaire is completed, its address should be
removed from the list for all users.
* Administrative Updates: Organization administrators can add or remove households from
the shared list, and updates must propagate in real-time to all logged-in users.
* Single Record: Only one set of answers per household is needed.

## Architecture Diagram

TODO

## Design Decisions

The instructions included a preference for using JavaScript, TypeScript, Python,
or Java. Of these, I chose to use [TypeScript](https://www.typescriptlang.org/)
with the [NestJS](https://nestjs.com/) server-side framework. TypeScript
combines the widely used Node.js ecosystem with the benefits of static typing
which is beneficial in API development, where data contracts must be precice
across endpoints, data layers, and source files. NestJS provides an opinionated
and structured framework for utilizing TypeScript to author server-side
applications.

The instructions call for a real-time updating aspect. In addition to [REST/HTTP
controllers](https://docs.nestjs.com/controllers), NestJS includes first-class
support for [REST/HTTP controllers](https://docs.nestjs.com/controllers),
[GraphQL](https://docs.nestjs.com/graphql/quick-start),
[WebSockets](https://docs.nestjs.com/websockets/gateways), and [Server-Sent
Events (SSE)](https://docs.nestjs.com/techniques/server-sent-events), allowing
for multiple real-time interaction options with clients. To highlight the
capability, I have incuded a GraphQL Subscription that receives real-time
updates when canvassing answers are submitted. If the use of GraphQL was
determined to not be ideal, it should be straightforward to instead work
directly with WebSockets or SSE.

The applications GraphQL and REST schemas were implemented code-first through
the patterns supported by NestJS. The <./schema.gql> GraphQL schema is
auto-generated on project build.

I decided to use a relational database model, which NestJS supports through
[TypeORM](https://typeorm.io/). This library along with NestJS rely heavily on
TypeScript decorators to add metadata and behavior in a declarative way. The
database modeling of table relationships is expressed code-first.

The instructions call for role based authentication, so that admins can
manipulate data while non-admin users are collecting answers to questionnaires.
The implementation stores a User entity supporting password authentication to
obtain a JWT token to be included in REST/GraphQL requests.

## Database Model

![Database Model](./readme_assets/database_model_diagram.png)


## Description

### Diagram

```mermaid
flowchart TD
    A[Mobile App]
    B[Website]
    C[NestJS REST Endpoints]
    D[NestJS GraphQL Endpoints]
    E[Database]

    A -->|Requests| C
    B -->|Requests| C
    A -->|Requests| D
    B -->|Requests| D
    C -->|Database queries| E
    C -->|Publishes events| D
    D -->|Pushes GraphQL/WS Subscription updates| A
    D -->|Pushes GraphQL/WS Subscription updates| B
```

## Overview

## Demo

For demo purposes, we'll use a local SQLite database instead of a database
server, but the application can also be configured to use PostgreSQL as the
database server. The following command will build the application and generate
demo data stored to a canvassing-development.sqlite file in the project
directory.

```bash
npm run build && rm ./canvassing-development.sqlite; npm run manage:dev seed
```

After the database has been seeded, two users exist. 1) `admin` which has
administrative rights and 2) `demo` which is a normal user. Additional fake
entity data has been generated and stored to the database to make it easier to
test features.

You can then start the development server:

```bash
npm run start:dev
```

Then, you can visit the following in your browser to explore the services, which
include a REST API and a GraphQL API:

- OpenAPI/Swagger UI: <http://localhost:3000/api>
- GraphQL Sandbox UI: <Http://Localhost:3000/Graphql>

### Authentication

REST and GRAPHQL requests must be authenticated with a JWT token. The token should be included in HTTP requests with header name `Authorization` and value formatted as `Bearer <JWT_TOKEN>`.

The `auth/login` REST endpoint can be used to obtain a JWT token by logging in
with username and password. For the demo and development, we can generate auth
tokens using a command line utility...

### Admin user token generation

To generate a JWT token for the `admin` user that was generated when seeing the development database:

```bash
$ npm run manage:dev devtoken admin
Bearer ...
```

### Non-admin user token generation

To generate a JWT token for the non-admin `demo` user that was generated when seeding the development database:

```bash
$ npm run manage:dev devtoken demo
Bearer ...
```

Next, copy/save the generated tokens to then use with the Swagger and GraphQL
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

After starting the development server, visit <http://localhost:3000/api>. In the upper right hand side you will find a button labeled "Authorize". Click that button and then enter the generated token using the pattern `<JWT_TOKEN>`.

![Swagger Playground Auth Settings](./readme_assets/openai_playground_auth_settings.png)
![GraphQL Playground Bearer Auth](./readme_assets/openai_playground_bearer_entry.png)

#### Example GraphQL queries

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

##### Submitting a new answer

```graphql
mutation Mutation($submitAnswerDto: SubmitAnswerDto!) {
  submitAnswer(submitAnswerDto: $submitAnswerDto)
}

{
  "submitAnswerDto": {
    "questionnaireId": 0,
    "addressListId": 1,
    "addressId": 174,
    "questionId": 1,
    "answerText": "test answer"
  }
}
```

##### Subscription to answer creation events

```graphql
subscription Subscription {
  newAnswer {
    id
    inlineReferenceData
    question {
      text
    }
    text
    user {
      id
      username
      role
    }
    addressList {
      id
      title
      organization {
        name
        id
        questionnaires {
          id
        }
      }
    }
    address {
      address1
      address2
      city
      id
      state
      zipcode
    }
  }
}
```

![GraphQL Subscription event through WebSocket](./readme_assets/graphql_sandbox_subscriptions.png)

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
