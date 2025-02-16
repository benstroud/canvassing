import { Command, CommandRunner } from 'nest-commander';
import { Repository } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { UserRole } from 'src/constants';
import {
  ADDRESSES_REPOSITORY,
  ADDRESSLISTS_REPOSITORY,
  ANSWERS_REPOSITORY,
  ORGANIZATIONS_REPOSITORY,
  QUESTIONNAIRE_REPOSITORY,
  QUESTIONS_REPOSITORY,
  USERS_REPOSITORY,
} from 'src/constants';
import { Address } from 'src/entities/address.entity';
import { AddressList } from 'src/entities/addresslist.entity';
import { Questionnaire } from 'src/entities/questionnaire.entity';
import { Question } from 'src/entities/question.entity';
import { Organization } from 'src/entities/organization.entity';
import { Answer } from 'src/entities/answer.entity';
import * as readline from 'readline'; // Added import for interactive prompt
import { faker } from '@faker-js/faker';
import { AuthService } from 'src/auth.service';

@Injectable()
@Command({
  name: 'seed',
  description: 'Seeds the database with initial data',
})
export class SeedCommand extends CommandRunner {
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
  ) {
    super();
    this.usersRepository = usersRepository;
  }

  async run(): Promise<void> {
    console.log('Seeding the database...');

    const adminUser = new User();
    adminUser.username = 'admin';
    adminUser.password = 'admin';
    adminUser.role = UserRole.ADMIN;

    await this.usersRepository.insert(adminUser);

    const demoUser = new User();
    demoUser.username = 'demo';
    demoUser.password = 'demo';
    demoUser.role = UserRole.PARTNER;

    await this.usersRepository.insert(demoUser);

    const addresses: Address[] = [];
    for (let i = 0; i < 1000; i++) {
      const address = new Address();
      address.address1 = faker.location.streetAddress();
      address.city = faker.location.city();
      address.state = faker.location.state();
      address.zipcode = faker.location.zipCode();
      addresses.push(address);
    }
    await this.addressesRepository.insert(addresses);

    const organization = new Organization();
    organization.name = faker.company.name();
    organization.users = [demoUser];

    await this.organizationsRepository.insert(organization);

    demoUser.organizations = [organization];
    await this.usersRepository.save(demoUser);

    const questionnaire = new Questionnaire();
    questionnaire.title = `Questions about ${faker.word.noun()}`;
    questionnaire.organization = organization;

    const questions: Question[] = [];
    for (let i = 0; i < 10; i++) {
      const question = new Question();
      question.text = `Do you like ${faker.music.album()} by ${faker.music.artist()}?`;
      question.questionnaire = questionnaire;
      questions.push(question);
    }

    questionnaire.questions = questions;

    await this.questionnairesRepository.insert(questionnaire);
    await this.questionsRepository.insert(questions);

    const addressLists: AddressList[] = [];
    for (let i = 0; i < 3; i++) {
      const addressList = new AddressList();
      addressList.title = `Address List ${i + 1}`;
      addressList.addresses = faker.helpers.arrayElements(addresses, 10); // Randomly pick 10 addresses
      addressList.organization = organization;
      addressLists.push(addressList);
    }

    // Use save to handle many-to-many relationships
    await this.addressListsRepository.save(addressLists);

    console.log('Database seeding complete.');
  }
}

@Injectable()
@Command({
  name: 'createsuperuser',
  description: 'Creates a new superuser interactively',
})
export class CreateSuperUserCommand extends CommandRunner {
  constructor(
    @Inject(USERS_REPOSITORY)
    private usersRepository: Repository<User>,
  ) {
    super();
  }

  async run(args: string[]): Promise<void> {
    if (args.length < 1) {
      console.error('Username parameter is required.');
      return;
    }
    const username = args[0];
    const password = await this.prompt('Enter password: ');

    const user = new User();
    user.username = username;
    user.password = password;
    user.role = UserRole.ADMIN;

    await this.usersRepository.insert(user);
    console.log(`Superuser created with username: ${username}`);
  }

  private prompt(query: string): Promise<string> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    });
    return new Promise((resolve) => {
      rl.question(query, (answer) => {
        rl.close();
        resolve(answer);
      });
    });
  }
}

@Injectable()
@Command({
  name: 'devtoken',
  description: 'Login as development user after seeding the database',
})
export class DevTokenCommand extends CommandRunner {
  constructor(
    @Inject(USERS_REPOSITORY)
    private usersRepository: Repository<User>,
    private authService: AuthService,
  ) {
    super();
  }

  async run(args: string[]): Promise<void> {
    if (args.length < 1) {
      console.error('Username parameter is required.');
      return;
    }
    const username = args[0];

    const accessToken = await this.authService.jwtFromUsernameOnly(username);
    console.log(`Bearer ${accessToken}`);
  }
}
