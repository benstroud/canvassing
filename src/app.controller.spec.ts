import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  CreateOrganizationDto,
  Organization,
} from './entities/organization.entity';
import {
  AddressList,
  CreateAddressListDto,
} from './entities/addresslist.entity';
import { Address } from './entities/address.entity';
import {
  CreateQuestionnaireDto,
  Questionnaire,
} from './entities/questionnaire.entity';
import { Question } from './entities/question.entity';

//#region Test fixtures

const fixtureOrganization1 = new Organization();
fixtureOrganization1.id = 1;
fixtureOrganization1.name = 'Org1';
fixtureOrganization1.questionnaires = [];

const fixtureOrganization2 = new Organization();
fixtureOrganization2.id = 2;
fixtureOrganization2.name = 'Org1';
fixtureOrganization2.questionnaires = [];

const fixtureQuestionnaire1 = new Questionnaire();
fixtureQuestionnaire1.id = 1;
fixtureQuestionnaire1.title = 'Questionnaire 1';
fixtureQuestionnaire1.organization = fixtureOrganization1;
fixtureQuestionnaire1.questions = [];

fixtureOrganization1.questionnaires.push(fixtureQuestionnaire1);

const fixtureQuestion1 = new Question();
fixtureQuestion1.id = 1;
fixtureQuestion1.text = 'What is your favorite color?';
fixtureQuestion1.questionnaire = fixtureQuestionnaire1;

const fixtureQuestion2 = new Question();
fixtureQuestion2.id = 1;
fixtureQuestion2.text = 'What do you like to do for fun?';
fixtureQuestion2.questionnaire = fixtureQuestionnaire1;

fixtureQuestionnaire1.questions.push(fixtureQuestion1);
fixtureQuestionnaire1.questions.push(fixtureQuestion2);

const fixtureAddress1 = new Address();
fixtureAddress1.id = 1;
fixtureAddress1.address1 = '123 Main St';
fixtureAddress1.address2 = '';
fixtureAddress1.city = 'Springfield';
fixtureAddress1.state = 'IL';
fixtureAddress1.zipcode = '62701';
fixtureAddress1.addressLists = [];

const fixtureAddress2 = new Address();
fixtureAddress2.id = 2;
fixtureAddress2.address1 = '456 Elm St';
fixtureAddress2.address2 = 'Apt 2';
fixtureAddress2.city = 'Springfield';
fixtureAddress2.state = 'IL';
fixtureAddress2.zipcode = '62702';
fixtureAddress2.addressLists = [];

const fixtureAddressList1 = new AddressList();
fixtureAddressList1.id = 1;
fixtureAddressList1.title = 'Test List';
fixtureAddressList1.organizationId = 1;
fixtureAddressList1.addresses = [fixtureAddress1, fixtureAddress2];

fixtureAddress1.addressLists.push(fixtureAddressList1);
fixtureAddress2.addressLists.push(fixtureAddressList1);

//#endregion

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            findOrganization: jest.fn(),
            createOrganization: jest.fn(),
            deleteOrganization: jest.fn(),
            findOrganizations: jest.fn(),

            createAddressList: jest.fn(),
            deleteAddressList: jest.fn(),
            findAddressLists: jest.fn(),
            findAddressList: jest.fn(),

            createQuestionnaire: jest.fn(),
            deleteQuestionnaire: jest.fn(),
            findQuestionnaires: jest.fn(),
            findQuestionnaire: jest.fn(),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('root', () => {
    it('should return welcome with links"', () => {
      expect(appController.getHello()).toBe(
        "Welcome to the Canvassing backend.<br><a href='/api'>REST OpenAPI Swagger UI</a><br><a href='/graphql'>GraphQL API Playground</a>",
      );
    });
  });

  //#region Organization tests

  describe('myOrganization', () => {
    it('should return an organization', async () => {
      jest
        .spyOn(appService, 'findOrganization')
        .mockResolvedValue(fixtureOrganization1);

      expect(await appController.myOrganization()).toBe(fixtureOrganization1);
    });
  });

  describe('createOrganization', () => {
    it('should create and return an organization', async () => {
      const createOrganizationDto: CreateOrganizationDto = {
        name: fixtureOrganization1.name,
      };

      jest
        .spyOn(appService, 'createOrganization')
        .mockResolvedValue(fixtureOrganization1);

      expect(
        await appController.createOrganization(createOrganizationDto),
      ).toBe(fixtureOrganization1);
    });
  });

  describe('deleteOrganization', () => {
    it('should delete an organization', async () => {
      jest.spyOn(appService, 'deleteOrganization').mockResolvedValue();

      expect(
        await appController.deleteOrganization(fixtureOrganization1.id),
      ).toBeUndefined();
    });
  });

  describe('findOrganizations', () => {
    it('should return an array of organizations', async () => {
      const result = [fixtureOrganization1, fixtureOrganization2];
      jest.spyOn(appService, 'findOrganizations').mockResolvedValue(result);

      expect(await appController.findOrganizations()).toBe(result);
    });
  });

  //#endregion Organization tests

  //#region Address Lists tests

  describe('createAddressList', () => {
    it('should create and return an address list', async () => {
      const createAddressListDto: CreateAddressListDto = {
        title: fixtureAddressList1.title,
        organizationId: fixtureOrganization1.id,
      };

      const expectedAddressList = { ...fixtureAddressList1, addresses: [] };

      jest
        .spyOn(appService, 'createAddressList')
        .mockResolvedValue(expectedAddressList);

      expect(await appController.createAddressList(createAddressListDto)).toBe(
        expectedAddressList,
      );
    });
  });

  describe('deleteAddressList', () => {
    it('should delete an address list', async () => {
      jest.spyOn(appService, 'deleteAddressList').mockResolvedValue();

      expect(
        await appController.deleteAddressList(fixtureAddressList1.id),
      ).toBeUndefined();
    });
  });

  describe('findAddressLists', () => {
    it('should return an array of address lists', async () => {
      const result = [fixtureAddressList1];
      jest.spyOn(appService, 'findAddressLists').mockResolvedValue(result);

      expect(await appController.findAddressLists()).toBe(result);
    });
  });

  describe('findAddressList', () => {
    it('should return an address list', async () => {
      jest
        .spyOn(appService, 'findAddressList')
        .mockResolvedValue(fixtureAddressList1);

      expect(await appController.findAddressList(1)).toBe(fixtureAddressList1);
    });
  });

  //#endregion Address Lists tests

  //#region Questionnaires tests

  describe('createQuestionnaire', () => {
    it('should create and return a questionnaire', async () => {
      const createQuestionnaireDto: CreateQuestionnaireDto = {
        title: fixtureQuestionnaire1.title,
        organizationId: fixtureOrganization1.id,
      };

      const expectedQuestionnaire = { ...fixtureQuestionnaire1, questions: [] };

      jest
        .spyOn(appService, 'createQuestionnaire')
        .mockResolvedValue(expectedQuestionnaire);

      expect(
        await appController.createQuestionnaire(createQuestionnaireDto),
      ).toBe(expectedQuestionnaire);
    });
  });

  describe('deleteQuestionnaire', () => {
    it('should delete questionnaire', async () => {
      jest.spyOn(appService, 'deleteQuestionnaire').mockResolvedValue();

      expect(
        await appController.deleteQuestionnaire(fixtureQuestionnaire1.id),
      ).toBeUndefined();
    });
  });

  describe('findQuestionnaires', () => {
    it('should return an array of questionnaires', async () => {
      const result = [fixtureQuestionnaire1];
      jest.spyOn(appService, 'findQuestionnaires').mockResolvedValue(result);

      expect(await appController.findQuestionnaires()).toBe(result);
    });
  });

  describe('findQuestionnaire', () => {
    it('should return a questionnaire', async () => {
      jest
        .spyOn(appService, 'findQuestionnaire')
        .mockResolvedValue(fixtureQuestionnaire1);

      expect(await appController.findQuestionnaire(1)).toBe(
        fixtureQuestionnaire1,
      );
    });
  });

  //#endregion Questionnaires tests
});
