# Canvassing API prototype

Objective: Develop a backend API to support a civic canvassing service. This API
will be used by both a mobile application and a website to facilitate the
delivery of questionnaires and the capture of responses on a per household
basis.

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
the patterns supported by NestJS. The [src/schema.gql](./src/schema.gql) GraphQL schema
is auto-generated on project build.

I decided to use a relational database model, which NestJS supports through
[TypeORM](https://typeorm.io/). This library along with NestJS rely heavily on
TypeScript decorators to add metadata and behavior in a declarative way. The
database modeling of table relationships is expressed code-first.

The instructions call for role based authentication, so that admins can
manipulate data while non-admin users are collecting answers to questionnaires.
The implementation stores a User entity supporting password authentication to
obtain a JWT token to be included in REST/GraphQL requests.

### Other considerations

I also considered Python ecosystem options, where I have more experience, but
decided to go with TypeScript/NestJS to gain more experience. With more time, I
would have likely further prototyped with other languages to compare/contrast.
The Go programming language could provide a nice solution.

I also considered a solution utilizing AWS infrastructure components such as API
Gateway and/or AppSync, but decided it was best to provide a more
straightforward code repository that could be demonstrated more easily and run
locally.

## Architecture Diagram

![Architecture Diagram](./architecture_diagram.png)

To generate the diagram from [diagram.mermaid](./diagram.mermaid):

```shell
npm install -g @mermaid-js/mermaid-cli
mmdc -i diagram.mermaid -o architecture_diagram.png -t dark -b transparent
```

## Database Model

![Database Model](./readme_assets/database_model_diagram.png)

## Demo

I have developed the application using Node.js version v20.18.2. After [downloading](https://nodejs.org/en/download) and installing the latest v20.18 LTS version, next install the project dependencies:

```bash
$ node --version 
v20.18.x
$ npm i
...
$ npx @nestjs/cli@11.0.2 --version
11.0.2
$ alias nest='npx @nestjs/cli@11.0.2'
```

For demo purposes, we'll use a local SQLite database instead of a database
server, but the application can also be configured to use PostgreSQL or other
RDBMS.

The following command will build the application and generate demo data stored
to a canvassing-development.sqlite file in the project directory.

```bash
npm run build && rm ./canvassing-development.sqlite; npm run manage:dev seed
```

After the database has been seeded, two users exist. 1) `admin` which has
administrative rights and 2) `demo` which is a normal user. For both, the
initial password is the same as the username. Additional fake entity data has
been generated and stored to the database to make it easier to test features.

You can then start the development server:

```bash
npm run start:dev
```

Then, you can visit the following in your browser to explore the services, which
include a REST API and a GraphQL API:

* OpenAPI/Swagger UI: <http://localhost:3000/api>
* GraphQL Sandbox UI: <Http://localhost:3000/graphql>

### Authentication

REST and GraphQL requests must be authenticated with a JWT token. The token should be included in HTTP requests with header name `Authorization` and value formatted as `Bearer <JWT_TOKEN>`.

For demo and development, we can generate auth tokens using a command line
utility.

(Note: The `auth/login` REST endpoint would typically be used to obtain a JWT
token by logging in with username and password.)

### Admin user token generation

To generate a JWT token for the `admin` user that was generated when seeing the development database:

```bash
$ npm run manage:dev devtoken admin
Bearer <JWT_TOKEN>
```

### Non-admin user token generation

To generate a JWT token for the non-admin `demo` user that was generated when seeding the development database:

```bash
$ npm run manage:dev devtoken demo
Bearer <JWT_TOKEN>
```

Next, copy/save the generated tokens to then use with the Swagger and GraphQL
playgrounds. The copied value will look something like the following but with a
different token value:

```text
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwic3ViIjoxLCJpYXQiOjE3Mzk2NzI2NDgsImV4cCI6MTc0NzQ0ODY0OH0.iO89OCf-1avukhGULLtU6sP9brfA6zyhNpuLb_ptKdQ
```

### Setting the auth token for the GraphQL explorer

After starting the development server, visit <http://localhost:3000/graphql>. In
the upper left hand corner you will see a gear icon to open connection settings.
Once opened, paste in the generated token, using the pattern `Bearer <JWT_TOKEN>`,
into the Shared Headers section, and set the header name to `Authorization`.
Once saved, the GraphQL Playground will begin including the auth token in
requests for the associated user account that has been seeded in the database
for the demo.

![GraphQL Playground Connection Settings](./readme_assets/gql_playground_connection_settings.png)
![GraphQL Playground Bearer Auth](./readme_assets/gql_playground_bearer_auth.png)

### Setting the auth token for the Swagger REST/OpenAPI explorer

After starting the development server, visit <http://localhost:3000/api>. In the upper right hand side you will find a button labeled "Authorize". Click that button and then enter the generated token using the pattern `<JWT_TOKEN>`.

![Swagger Playground Auth Settings](./readme_assets/openapi_playground_auth_settings.png)
![GraphQL Playground Bearer Auth](./readme_assets/openapi_playground_bearer_entry.png)

### Example GraphQL queries

#### The MyAccount Query

After setting the `demo` user token in the GraphQL sandbox auth, the following
GraphQL Query will return the user's account information and associated entities
which include their organizations, questionnaires, and address lists. You can
use the GraphQL sandbox to further explore the model attributes for this `demo`
user.

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

#### The submitAnswer Mutation

Also using the `demo` user, you can submit a new answer. You will need to obtain
valid associated record ids from the demo database.

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

#### The newAnswer Subscription

Using GraphQL's WebSocket Subscription capability, the front end can receive
real time notifications when an answer has been submitted. Again, using the
`demo` user:

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

### Example REST requests

Using the Swagger UI, you can set the authorization token and then interact with
the local development server.

In addition to the Swagger UI, you may find it convenient to use `curl`. Here
are some examples:

```bash
# Seed demo database

# Generate admin user JWT token
$ npm run manage:dev devtoken admin

> canvassing@0.0.1 manage:dev
> NODE_ENV=dev node dist/management devtoken admin

Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3Mzk4MjI4NjEsImV4cCI6MTc0NzU5ODg2MX0.Dpf-OGBD0rKZo4onC_qdmKXVplD24jInU7INne2LImo

## Set token in environment variable
$ export JWT_TOKEN='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3Mzk4MjI4NjEsImV4cCI6MTc0NzU5ODg2MX0.Dpf-OGBD0rKZo4onC_qdmKXVplD24jInU7INne2LImo'

$ curl -X 'GET' \
  'http://localhost:3000/admin/organizations' \
  -H 'accept: */*' -H "Authorization: Bearer $JWT_TOKEN"
[{"id":1,"name":"Armstrong Group"}]

$ curl -X 'GET' \
  'http://localhost:3000/admin/questions' \
  -H 'accept: */*' -H "Authorization: Bearer $JWT_TOKEN"
[{"id":1,"text":"Do you like Generationwhy by Sean Kingston?"},{"id":2,"text":"Do you like Rise Of An Empire by Johnny Horton?"},{"id":3,"text":"Do you like What A Time To Be Alive by Gzuz?"},{"id":4,"text":"Do you like Homerun by Bradley Cooper?"},{"id":5,"text":"Do you like The Sufferer & The Witness by The Go Gos?"},{"id":6,"text":"Do you like Blood Sugar Sex Magik by Dermot Kennedy?"},{"id":7,"text":"Do you like Guerra by The Emotions?"},{"id":8,"text":"Do you like ENR by Ray Parker Jr?"},{"id":9,"text":"Do you like Realer by Bryan Adams?"},{"id":10,"text":"Do you like The Stranger by Juanes?"}]

$ curl -X 'GET' \
  'http://localhost:3000/admin/addresslists' \
  -H 'accept: */*' -H "Authorization: Bearer $JWT_TOKEN"
[{"id":1,"title":"Address List 1","organizationId":1},{"id":2,"title":"Address List 2","organizationId":1},{"id":3,"title":"Address List 3","organizationId":1}]

```

## Ben's notes

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
# I initially tried to utilize the passport.js library but defaulted to the Nest authentication doc steps...
# npm install --save @nestjs/passport passport passport-local
# npm install --save-dev @types/passport-local
#npm install --save @nestjs/jwt passport-jwt
#npm install --save-dev @types/passport-jwt
npm install --save sqlite3
npm install nest-commander --save
npm i graphql-ws --save
npm i graphql-subscriptions --save
```

### Development Environment

#### Sqlite3 development database

For convenience, setting the `NODE_ENV` environment variable to `dev` will
configure the app to use a SQLite database file
(./canvassing-development.sqlite) instead of PostgreSQL which would be
recommended for production. See <./src/database.providers.ts> for the configuration of
each.

#### PostgreSQL locally for development

[Docker compose](https://docs.docker.com/compose/) is utilized for local development to provide a development PostgreSQL database. The <./docker-compose.yml> file sets the database and user name, and password default. You can override the password by setting the `POSTGRES_PASSWORD` environment variable.

```bash
# Start PostgreSQL locally, in the background.
$ docker-compose up -d
```

### Commands

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# watch mode + debugging
$ npm run start:debug

## Nest.js - Run tests

# unit tests
$ npm run test
```

### Nest.js -- Deployment

[Nest deployment documentation](https://docs.nestjs.com/deployment)

### Nest.js -- Resources

Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
