// DI Service providers

import { DataSource } from 'typeorm';
import {
  ADDRESSES_REPOSITORY,
  ADDRESSLISTS_REPOSITORY,
  ANSWERS_REPOSITORY,
  DATA_SOURCE,
  ORGANIZATIONS_REPOSITORY,
  PUB_SUB,
  QUESTIONNAIRE_REPOSITORY,
  QUESTIONS_REPOSITORY,
  USERS_REPOSITORY,
} from './constants';
import { Address } from './entities/address.entity';
import { AddressList } from './entities/addresslist.entity';
import { Answer } from './entities/answer.entity';
import { Organization } from './entities/organization.entity';
import { Questionnaire } from './entities/questionnaire.entity';
import { Question } from './entities/question.entity';
import { User } from './entities/user.entity';
import { PubSub } from 'graphql-subscriptions';

export const entityRepositoriesProviders = [
  {
    provide: ADDRESSES_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Address),
    inject: [DATA_SOURCE],
  },
  {
    provide: ADDRESSLISTS_REPOSITORY,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(AddressList),
    inject: [DATA_SOURCE],
  },
  {
    provide: ANSWERS_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Answer),
    inject: [DATA_SOURCE],
  },
  {
    provide: ORGANIZATIONS_REPOSITORY,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(Organization),
    inject: [DATA_SOURCE],
  },
  {
    provide: QUESTIONNAIRE_REPOSITORY,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(Questionnaire),
    inject: [DATA_SOURCE],
  },
  {
    provide: QUESTIONS_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Question),
    inject: [DATA_SOURCE],
  },
  {
    provide: USERS_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(User),
    inject: [DATA_SOURCE],
  },
];
// PubSub provider for GraphQL subscriptions
export const graphQLPubSubProvider = {
  provide: PUB_SUB,
  useValue: new PubSub(),
};
