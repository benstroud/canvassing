import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { AppService } from './app.service';
import {
  CreateOrganizationDto,
  Organization,
} from './entities/organization.entity';
import {
  AddressList,
  CreateAddressListDto,
} from './entities/addresslist.entity';
import {
  CreateQuestionnaireDto,
  Questionnaire,
} from './entities/questionnaire.entity';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('')
  getHello(): string {
    return "Canvassing <a href='/api'>API</a>";
  }

  @Get('partner/organization')
  async myOrganization(): Promise<Organization> {
    // TODO instead obtain organization id from API key
    const id = 1;
    return this.appService.findOrganization(id);
  }

  //#region Organizations controllers

  // TODO: Only allow for admin users
  @Post('admin/organizations')
  createOrganization(
    @Body() createOrganizationDto: CreateOrganizationDto,
  ): Promise<Organization> {
    return this.appService.createOrganization(createOrganizationDto);
  }

  // TODO: Only allow for admin users
  @Delete('admin/organizations/:id')
  deleteOrganization(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.appService.deleteOrganization(id);
  }

  // TODO: Only allow for admin users
  @Get('admin/organizations')
  async findOrganizations(): Promise<Organization[]> {
    return this.appService.findOrganizations();
  }

  // TODO: Only allow for admin users
  @Get('admin/organizations/:id')
  async findOrganization(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Organization> {
    return this.appService.findOrganization(id);
  }

  //#endregion Organizations controllers

  //#region AddressList controllers

  // TODO: Only allow for admin users
  @Post('admin/addresslists')
  createAddressList(
    @Body() createAddressListDto: CreateAddressListDto,
  ): Promise<AddressList> {
    return this.appService.createAddressList(createAddressListDto);
  }

  @Delete('admin/addresslists/:id')
  deleteAddressList(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.appService.deleteAddressList(id);
  }

  @Get('admin/addresslists')
  async findAddressLists(): Promise<AddressList[]> {
    return this.appService.findAddressLists();
  }

  @Get('admin/addresslists/:id')
  async findAddressList(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<AddressList> {
    return this.appService.findAddressList(id);
  }

  //#endregion AddressList controllers

  //#region Questionnaire controllers

  @Post('partner/questionnaires/:questionnaireId/submit')
  async submitAnswers(
    @Param('questionnaireId') questionnaireId: number,
    @Body()
    body: {
      addressId: number;
      addressListId: number;
      answers: { questionId: number; answerText: string }[];
    },
  ) {
    // TODO: Get organization id from API key instead
    const organanizationId = 1;

    await this.appService.submitAnswers(
      organanizationId,
      questionnaireId,
      body.addressListId,
      body.addressId,
      body.answers,
    );
    return { message: 'Answers submitted successfully' };
  }

  @Post('admin/questionnaires')
  createQuestionnaire(
    @Body() createQuestionnaireDto: CreateQuestionnaireDto,
  ): Promise<Questionnaire> {
    return this.appService.createQuestionnaire(createQuestionnaireDto);
  }

  @Delete('admin/questionnaires/:id')
  deleteQuestionnaire(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.appService.deleteQuestionnaire(id);
  }

  @Get('admin/questionnaires')
  async findQuestionnaires(): Promise<Questionnaire[]> {
    return this.appService.findQuestionnaires();
  }

  @Get('admin/questionnaires/:id')
  async findQuestionnaire(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Questionnaire> {
    return this.appService.findQuestionnaire(id);
  }

  //#endregion Questionnaire controllers
}
