// Purpose: Service layer for the application. Contains all business logic and
// data access logic.

import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  ADDRESSES_REPOSITORY,
  ADDRESSLISTS_REPOSITORY,
  ORGANIZATIONS_REPOSITORY,
  QUESTIONNAIRE_REPOSITORY,
  QUESTIONS_REPOSITORY,
  ANSWERS_REPOSITORY,
  USERS_REPOSITORY,
  PUB_SUB,
} from './constants';
import { Repository } from 'typeorm';

import { Address, CreateAddressDto } from './entities/address.entity';
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
import { Answer, CreateAnswerDto } from './entities/answer.entity';
import { User } from './entities/user.entity';
import { UserRole } from './constants';
import { PubSub } from 'graphql-subscriptions';

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
    @Inject(PUB_SUB)
    private pubSub: PubSub,
  ) {}

  //#region Users CRUD and auth

  // Create user
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

  // Find user by id
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

  // Find user by username, checking password.
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

  // Create organization
  async createOrganization(
    createOrganizationDto: CreateOrganizationDto,
  ): Promise<Organization> {
    const organization = new Organization();
    organization.name = createOrganizationDto.name;
    return this.organizationsRepository.save(organization);
  }

  // Delete organization
  async deleteOrganization(id: number): Promise<void> {
    await this.organizationsRepository.delete(id);
  }

  // Find all organizations
  // TODO: paging.
  async findOrganizations(): Promise<Organization[]> {
    return this.organizationsRepository.find();
  }

  // Find organization by id
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
  // #endregion Organizations CRUD

  //#refion Address Lists CRUD

  // Create address list
  async createAddressList(
    createAddressListDto: CreateAddressListDto,
  ): Promise<AddressList> {
    const addressList = new AddressList();
    addressList.title = createAddressListDto.title;
    addressList.organizationId = createAddressListDto.organizationId;
    return this.addressListsRepository.save(addressList);
  }

  // Delete address list.
  async deleteAddressList(id: number): Promise<void> {
    await this.addressListsRepository.delete(id);
  }

  // Find all address lists.
  // TODO: paging
  async findAddressLists(): Promise<AddressList[]> {
    return this.addressListsRepository.find();
  }

  // Find address list by id.
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

  // Create questionnaire.
  async createQuestionnaire(
    createQuestionnaireDto: CreateQuestionnaireDto,
  ): Promise<Questionnaire> {
    const questionnaire = new Questionnaire();
    questionnaire.title = createQuestionnaireDto.title;
    questionnaire.organization.id = createQuestionnaireDto.organizationId;
    questionnaire.questions = [];
    return this.questionnairesRepository.save(questionnaire);
  }

  // Delete questionnaire.
  async deleteQuestionnaire(id: number): Promise<void> {
    await this.questionnairesRepository.delete(id);
  }

  // Find questionnaires.
  async findQuestionnaires(): Promise<Questionnaire[]> {
    return this.questionnairesRepository.find();
  }

  // find questionnaire by id.
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

  // Create question.
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

  // Delete question.
  async deleteQuestion(id: number): Promise<void> {
    await this.questionsRepository.delete(id);
  }

  // Find all questions.
  // TODO paging
  async findQuestions(): Promise<Question[]> {
    return this.questionsRepository.find();
  }

  // Find question by id.
  async findQuestion(id: number): Promise<Question> {
    const question = await this.questionsRepository.findOneBy({ id: id });
    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }
    return question;
  }

  // #endregion Questions CRUD

  // #region Answers CRUD
  // Create answer
  async createAnswer(createAnswerDto: CreateAnswerDto): Promise<Answer> {
    const answer = new Answer();
    answer.text = createAnswerDto.text;
    const question = await this.questionsRepository.findOneBy({
      id: createAnswerDto.questionId,
    });
    if (!question) {
      throw new NotFoundException(
        `Question with ID ${createAnswerDto.questionId} not found`,
      );
    }
    answer.question = question;
    const user = await this.usersRepository.findOneBy({
      id: createAnswerDto.userId,
    });
    if (!user) {
      throw new NotFoundException(
        `User with ID ${createAnswerDto.userId} not found`,
      );
    }
    answer.user = user;

    const addressList = await this.addressListsRepository.findOneBy({
      id: createAnswerDto.addressListId,
    });
    if (!addressList) {
      throw new NotFoundException(
        `AddressList with ID ${createAnswerDto.addressListId} not found`,
      );
    }

    answer.addressList = addressList;

    const address = await this.addressesRepository.findOneBy({
      id: createAnswerDto.addressId,
    });

    if (!address) {
      throw new NotFoundException(
        `Address with ID ${createAnswerDto.addressId} not found`,
      );
    }
    answer.address = address;
    // Leave this empty for admin created answers.
    answer.inlineReferenceData = JSON.stringify({});

    return this.answersRepository.save(answer);
  }

  // Delete answer
  async deleteAnswer(id: number): Promise<void> {
    await this.answersRepository.delete(id);
  }

  // Find all answers
  // TODO paging
  async findAnswers(): Promise<Answer[]> {
    return this.answersRepository.find();
  }

  // Find answer by id
  async findAnswer(id: number): Promise<Answer> {
    const answer = await this.answersRepository.findOne({
      where: { id: id },
      relations: ['question', 'user', 'addressList', 'address'],
    });
    if (!answer) {
      throw new NotFoundException(`Answer with ID ${id} not found`);
    }
    return answer;
  }

  //#endregion Answers CRUD

  //#region Address CRUD
  // Create address
  async createAddress(createAddressDto: CreateAddressDto): Promise<Address> {
    const address = new Address();
    address.address1 = createAddressDto.address1;
    address.address2 = createAddressDto.address2;
    address.city = createAddressDto.city;
    address.state = createAddressDto.state;
    address.zipcode = createAddressDto.zipcode;

    return this.addressesRepository.save(address);
  }

  // Delete address
  async deleteAddress(id: number): Promise<void> {
    await this.addressesRepository.delete(id);
  }

  // Find all addresses
  // TODO: paging
  async findAddresses(): Promise<Address[]> {
    return this.addressesRepository.find();
  }

  // Find address by id
  async findAddress(id: number): Promise<Address> {
    const address = await this.addressesRepository.findOne({
      where: { id: id },
      relations: ['addressLists', 'addressLists.answers'],
    });
    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }
    return address;
  }

  //#endregion Address CRUD

  // #region Questions submit answers

  // Submit answer to a question.
  // Publishes the Answer to the newAnswer GraphQL subscription topic notify
  // subscribers of new answer.
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
    const answer = await this.answersRepository.save(answerToStore);
    console.info(
      'Signalling to subscribers that an answer was added. answer:',
      answer,
    );
    await this.pubSub.publish('newAnswer', {
      newAnswer: answer,
    });

    return answerToStore;
  }
  //#endregion Questions submit answers
}
