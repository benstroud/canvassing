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
    /* @Inject(PUB_SUB)
    private pubSub: PubSub, */
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
    const user = await this.usersRepository.findOne({
      where: { id: id },
      relations: [
        'organizations',
        'organizations.questionnaires',
        'organizations.questionnaires.questions',
        'organizations.questionnaires.questions.answers',
        'organizations.addressLists',
        'organizations.addressLists.addresses',
      ],
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findUserValidatingPassword(
    username: string,
    password: string,
  ): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { username: username },
      relations: ['organizations'],
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

  async createOrganization(
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
    const organization = await this.organizationsRepository.findOne({
      where: { id: id },
      relations: ['questionnaires'],
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
    const addressList = await this.addressListsRepository.findOne({
      where: { id: id },
      relations: ['addresses'],
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
    const questionnaire = await this.questionnairesRepository.findOne({
      where: { id: id },
      relations: ['questions'],
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

  async submitAnswer(
    userId: number,
    questionId: number,
    questionnaireId: number,
    addressListId: number,
    addressId: number,
    answerText: string,
  ): Promise<Answer> {
    // Validate user exists
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    if (user.role !== UserRole.PARTNER) {
      throw new NotFoundException(`User ${userId} is not a partner role user`);
    }

    // Validate question exists and belongs to a questionnaire
    const question = await this.questionsRepository.findOne({
      where: { id: questionId },
      relations: [
        'questionnaire',
        'questionnaire.organization',
        'questionnaire.organization.questionnaires',
      ],
    });

    if (!question) {
      throw new NotFoundException(`Question ${questionId} is not valid.`);
    }
    if (!question.questionnaire) {
      throw new NotFoundException(
        `Question ${questionId} does not belong to a questionnaire.`,
      );
    }
    if (!question.questionnaire.organization) {
      throw new NotFoundException(
        `Questionnaire ${question.questionnaire.id} does not belong to an organization.`,
      );
    }

    // Validate user is a member of the organization associated with the questionnaire.
    const organizationId = question.questionnaire.organization.id;
    const userOrganizations = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['organizations'],
    });
    if (!userOrganizations) {
      throw new NotFoundException(`No organizations found for ${userId}`);
    }
    if (
      !userOrganizations.organizations.some((org) => org.id === organizationId)
    ) {
      throw new NotFoundException(
        `User ${userId} is not a member of organization ${organizationId} associated with questionnaire ${questionnaireId}`,
      );
    }

    // Validate address list belongs to the organization
    const addressList = await this.addressListsRepository.findOne({
      where: { id: addressListId, organizationId: organizationId },
      relations: ['organization', 'organization.questionnaires'],
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

    const answerToStore = new Answer();
    answerToStore.text = answerText;
    answerToStore.question = question;
    answerToStore.addressList = addressList;
    answerToStore.user = user;
    answerToStore.address = address;

    answerToStore.inlineReferenceData = JSON.stringify({
      question: { id: question.id, text: question.text },
      questionnaire: {
        id: question.questionnaire.id,
        title: question.questionnaire.title,
      },
      address: {
        id: address.id,
        address1: address.address1,
        address2: address.address2,
        city: address.city,
        state: address.state,
        zipcode: address.zipcode,
      },
      addressList: { id: addressList.id, title: addressList.title },
      user: {
        id: user.id,
        username: user.username,
      },
      organization: {
        id: question.questionnaire.organization.id,
        name: question.questionnaire.organization.name,
      },
    });
    await this.answersRepository.save(answerToStore);
    return answerToStore;
  }
  //#endregion Questions submit answers
}
