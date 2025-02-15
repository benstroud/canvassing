import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UseGuards,
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
import { LocalAuthGuard } from './auth/local.strategy';
import { AuthService } from './auth.service';
import { Public } from './auth/public.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly authService: AuthService,
  ) {}

  @Public()
  @Get('')
  getHello(): string {
    return "Welcome to the Canvassing backend.<br><a href='/api'>REST OpenAPI Swagger UI</a><br><a href='/graphql'>GraphQL API Playground</a>";
  }

  @ApiBearerAuth()
  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.authService.login(req.user);
  }

  @ApiBearerAuth()
  @UseGuards(LocalAuthGuard)
  @Post('auth/logout')
  // eslint-disable-next-line @typescript-eslint/require-await
  async logout(@Request() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return req.logout();
  }

  @ApiBearerAuth()
  @Get('partner/organization')
  async myOrganization(): Promise<Organization> {
    // TODO instead obtain organization id from API key
    const id = 1;
    return this.appService.findOrganization(id);
  }

  //#region Organizations controllers

  // TODO: Only allow for admin users
  @ApiBearerAuth()
  @Post('admin/organizations')
  createOrganization(
    @Body() createOrganizationDto: CreateOrganizationDto,
  ): Promise<Organization> {
    return this.appService.createOrganization(createOrganizationDto);
  }

  // TODO: Only allow for admin users
  @ApiBearerAuth()
  @Delete('admin/organizations/:id')
  deleteOrganization(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.appService.deleteOrganization(id);
  }

  // TODO: Only allow for admin users
  @ApiBearerAuth()
  @Get('admin/organizations')
  async findOrganizations(): Promise<Organization[]> {
    return this.appService.findOrganizations();
  }

  // TODO: Only allow for admin users
  @ApiBearerAuth()
  @Get('admin/organizations/:id')
  async findOrganization(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Organization> {
    return this.appService.findOrganization(id);
  }

  //#endregion Organizations controllers

  //#region AddressList controllers

  // TODO: Only allow for admin users
  @ApiBearerAuth()
  @Post('admin/addresslists')
  createAddressList(
    @Body() createAddressListDto: CreateAddressListDto,
  ): Promise<AddressList> {
    return this.appService.createAddressList(createAddressListDto);
  }

  @ApiBearerAuth()
  @Delete('admin/addresslists/:id')
  deleteAddressList(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.appService.deleteAddressList(id);
  }

  @ApiBearerAuth()
  @Get('admin/addresslists')
  async findAddressLists(): Promise<AddressList[]> {
    return this.appService.findAddressLists();
  }

  @ApiBearerAuth()
  @Get('admin/addresslists/:id')
  async findAddressList(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<AddressList> {
    return this.appService.findAddressList(id);
  }

  //#endregion AddressList controllers

  //#region Questionnaire controllers

  @ApiBearerAuth()
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

  @ApiBearerAuth()
  @Post('admin/questionnaires')
  createQuestionnaire(
    @Body() createQuestionnaireDto: CreateQuestionnaireDto,
  ): Promise<Questionnaire> {
    return this.appService.createQuestionnaire(createQuestionnaireDto);
  }

  @ApiBearerAuth()
  @Delete('admin/questionnaires/:id')
  deleteQuestionnaire(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.appService.deleteQuestionnaire(id);
  }

  @ApiBearerAuth()
  @Get('admin/questionnaires')
  async findQuestionnaires(): Promise<Questionnaire[]> {
    return this.appService.findQuestionnaires();
  }

  @ApiBearerAuth()
  @Get('admin/questionnaires/:id')
  async findQuestionnaire(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Questionnaire> {
    return this.appService.findQuestionnaire(id);
  }

  //#endregion Questionnaire controllers
}
