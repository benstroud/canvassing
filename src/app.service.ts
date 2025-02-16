import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  ADDRESSES_REPOSITORY,
  ADDRESSLISTS_REPOSITORY,
  ORGANIZATIONS_REPOSITORY,
  QUESTIONNAIRE_REPOSITORY,
  QUESTIONS_REPOSITORY,
  ANSWERS_REPOSITORY,
  USERS_REPOSITORY,
} from './constants';
import { Repository } from 'typeorm';

import { Address } from './entities/address.entity';
import {
  AddressList,
  CreateAddressListDto,
} from './entities/addresslist.entity';
import {
  CreateOrganizationDto,
  Organization,
} from './entities/organization.entity';
import {
  Questionnaire,
  CreateQuestionnaireDto,
} from './entities/questionnaire.entity';
import { CreateQuestionDto, Question } from './entities/question.entity';
import { Answer } from './entities/answer.entity';
import { User } from './entities/user.entity';
import { UserRole } from './constants';

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
    @Inject(ANSWERS_REPOSITORY)
    private answersRepository: Repository<Answer>,
    @Inject(USERS_REPOSITORY)
    private usersRepository: Repository<User>,
  ) {}

  //#region Users CRUD and auth

  async createUser(
    username: string,
    password: string,
    role: UserRole = UserRole.PARTNER,
  ): Promise<User> {
    if (![UserRole.ADMIN, UserRole.PARTNER].includes(role)) {
      throw new Error('Invalid role');
    }

    const user = this.usersRepository.create({ username, password, role });
    return this.usersRepository.save(user);
  }

  async findUserById(id: number): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id: id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findUserValidatingPassword(
    username: string,
    password: string,
  ): Promise<User> {
    const user = await this.usersRepository.findOneBy({
      username: username,
    });
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    if (!(await user.validatePassword(password))) {
      throw new NotFoundException(`Incorrect password`);
    }
    return user;
  }

  //#region Organizations CRUD

  createOrganization(
    createOrganizationDto: CreateOrganizationDto,
  ): Promise<Organization> {
    const organization = new Organization();
    organization.name = createOrganizationDto.name;
    return this.organizationsRepository.save(organization);
  }

  async deleteOrganization(id: number): Promise<void> {
    await this.organizationsRepository.delete(id);
  }

  // TODO: Paging. Guard access here or in controller?
  async findOrganizations(): Promise<Organization[]> {
    return this.organizationsRepository.find();
  }

  async findOrganization(id: number): Promise<Organization> {
    const organization = await this.organizationsRepository.findOneBy({
      id: id,
    });
    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }
    return organization;
  }

  // TODO - fully switch to User+JWT
  /* async findOrganizationByApiKey(apiKey: string): Promise<Organization> {
    const organization = await this.organizationsRepository.findOneBy({
      apiKey: apiKey,
    });
    if (!organization) {
      throw new NotFoundException(
        `Organization with API key ${apiKey} not found`,
      );
    }
    return organization;
  }
 */
  // #endregion Organizations CRUD

  //#refion Address Lists CRUD

  async createAddressList(
    createAddressListDto: CreateAddressListDto,
  ): Promise<AddressList> {
    const addressList = new AddressList();
    addressList.title = createAddressListDto.title;
    addressList.organizationId = createAddressListDto.organizationId;
    return this.addressListsRepository.save(addressList);
  }

  async deleteAddressList(id: number): Promise<void> {
    await this.addressListsRepository.delete(id);
  }

  // TODO: Paging
  async findAddressLists(): Promise<AddressList[]> {
    return this.addressListsRepository.find();
  }

  async findAddressList(id: number): Promise<AddressList> {
    const addressList = await this.addressListsRepository.findOneBy({
      id: id,
    });
    if (!addressList) {
      throw new NotFoundException(`AddressList with ID ${id} not found`);
    }
    return addressList;
  }

  // #endregion Address Lists CRUD

  // #region Questionnaires CRUD

  async createQuestionnaire(
    createQuestionnaireDto: CreateQuestionnaireDto,
  ): Promise<Questionnaire> {
    const questionnaire = new Questionnaire();
    questionnaire.title = createQuestionnaireDto.title;
    questionnaire.organization.id = createQuestionnaireDto.organizationId;
    questionnaire.questions = [];
    return this.questionnairesRepository.save(questionnaire);
  }

  async deleteQuestionnaire(id: number): Promise<void> {
    await this.questionnairesRepository.delete(id);
  }

  // TODO: Paging.
  async findQuestionnaires(): Promise<Questionnaire[]> {
    return this.questionnairesRepository.find();
  }

  async findQuestionnaire(id: number): Promise<Questionnaire> {
    const questionnaire = await this.questionnairesRepository.findOneBy({
      id: id,
    });
    if (!questionnaire) {
      throw new NotFoundException(`Questionnaire with ID ${id} not found`);
    }
    return questionnaire;
  }

  // #endregion Questionnaires CRUD

  // #region Questions CRUD

  async createQuestion(
    createQuestionDto: CreateQuestionDto,
  ): Promise<Question> {
    const questionnaire = await this.questionnairesRepository.findOneBy({
      id: createQuestionDto.questionnaireId,
    });
    if (!questionnaire) {
      throw new NotFoundException(
        `Questionnaire with ID ${createQuestionDto.questionnaireId} not found`,
      );
    }

    const question = new Question();
    question.text = createQuestionDto.text;
    question.questionnaire = questionnaire;
    return this.questionsRepository.save(question);
  }

  async deleteQuestion(id: number): Promise<void> {
    await this.questionsRepository.delete(id);
  }

  async findQuestions(): Promise<Question[]> {
    return this.questionsRepository.find();
  }

  async findQuestion(id: number): Promise<Question> {
    const question = await this.questionsRepository.findOneBy({ id: id });
    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }
    return question;
  }

  // #endregion Questions CRUD

  // #region Questions submit answers

  async submitAnswers(
    organizationId: number,
    questionnaireId: number,
    addressListId: number,
    addressId: number,
    answers: { questionId: number; answerText: string }[],
  ) {
    // Validate questionnaire belongs to the organization
    const questionnaire = await this.questionnairesRepository.findOne({
      where: { id: questionnaireId },
      relations: ['organization'],
    });
    if (!questionnaire || questionnaire.organization.id !== organizationId) {
      throw new NotFoundException(
        `Questionnaire ${questionnaireId} is not valid for organization ${organizationId}`,
      );
    }

    // Validate address list belongs to the organization
    const addressList = await this.addressListsRepository.findOne({
      where: { id: addressListId, organizationId: organizationId },
    });
    if (!addressList) {
      throw new NotFoundException(
        `AddressList ${addressListId} is not valid for organization ${organizationId}`,
      );
    }

    // Validate address belongs to the address list
    const address = await this.addressesRepository.findOne({
      where: { id: addressId },
      relations: ['addressLists'],
    });
    if (
      !address ||
      !address.addressLists.some((al) => al.id === addressListId)
    ) {
      throw new NotFoundException(
        `Address ${addressId} is not a member of address list ${addressListId}`,
      );
    }

    // Validate each question belongs to the questionnaire
    for (const { questionId } of answers) {
      const question = await this.questionsRepository.findOne({
        where: { id: questionId },
        relations: ['questionnaire'],
      });
      if (!question || question.questionnaire.id !== questionnaireId) {
        throw new NotFoundException(
          `Question ${questionId} is not valid for questionnaire ${questionnaireId}`,
        );
      }
    }

    // Final step: create and insert answers
    // Map over provided answers, create Answer entities, and save them
    const answerEntities = answers.map(async (ans) => {
      const question = await this.questionsRepository.findOne({
        where: { id: ans.questionId },
        relations: ['questionnaire'],
      });
      if (!question || question.questionnaire.id !== questionnaireId) {
        throw new NotFoundException(
          `Question ${ans.questionId} is not valid for question ${questionnaireId}`,
        );
      }
      const answerToStore = new Answer();
      answerToStore.text = ans.answerText;
      answerToStore.question = question;
      this.answersRepository.save(answerToStore).catch((err) => {
        console.error('Error saving answer:', err);
        throw err;
      });
    });
    await Promise.all(answerEntities);
    console.log('Submitted answers:', answerEntities);
  }
  //#endregion Questions submit answers
}
