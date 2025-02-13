/**
 * Provides the repository for each db model entity.
 */

import { DataSource } from 'typeorm';
import {
  ADDRESSES_REPOSITORY,
  ADDRESSLISTS_REPOSITORY,
  ANSWERS_REPOSITORY,
  DATA_SOURCE,
  ORGANIZATIONS_REPOSITORY,
  QUESTIONNAIRE_REPOSITORY,
  QUESTIONS_REPOSITORY,
} from './constants';
import { Address } from './entities/address.entity';
import { AddressList } from './entities/addresslist.entity';
import { Answer } from './entities/answer.entity';
import { Organization } from './entities/organization.entity';
import { Questionnaire } from './entities/questionnaire.entity';
import { Question } from './entities/question.entity';

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
];
