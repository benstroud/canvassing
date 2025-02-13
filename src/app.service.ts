import { Inject, Injectable } from '@nestjs/common';
import {
  ADDRESSES_REPOSITORY,
  ADDRESSLISTS_REPOSITORY,
  ORGANIZATIONS_REPOSITORY,
  QUESTIONNAIRE_REPOSITORY,
  QUESTIONS_REPOSITORY,
} from './constants';
import { Repository } from 'typeorm';

import { Address } from './entities/address.entity';
import { AddressList } from './entities/addresslist.entity';
import { Organization } from './entities/organization.entity';
import { Questionnaire } from './entities/questionnaire.entity';
import { Question } from './entities/question.entity';

@Injectable()
export class AppService {
  constructor(
    @Inject(ADDRESSES_REPOSITORY)
    private addressesRepository: Repository<Address>,
    @Inject(ADDRESSLISTS_REPOSITORY)
    private addressListsRepository: Repository<AddressList>,
    @Inject(QUESTIONNAIRE_REPOSITORY)
    private questionnairesRepository: Repository<Questionnaire>,
    @Inject(QUESTIONS_REPOSITORY)
    private questionsRepository: Repository<Question>,
    @Inject(ORGANIZATIONS_REPOSITORY)
    private organizationsRepository: Repository<Organization>,
  ) {}

  getHello(): string {
    return 'Canvassing API';
  }

  /* async findAddresses(): Promise<Address[]> {
    return this.addressesRepository.find();
  }

  async findOrganizations(): Promise<Organization[]> {
    return this.organizationsRepository.find();
  } */
}
