// Controllers for REST API endpoints.

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
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

import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RESTCurrentUserId, AuthGuard } from './auth/jwt-auth.guard';
import { SignInDto, User } from './entities/user.entity';
import { CreateQuestionDto, Question } from './entities/question.entity';
import { BEARER_AUTH_NAME, PUB_SUB, UserRole } from './constants';
import { Roles } from './auth/roles.decorator';
import { RolesGuard } from './auth/roles.guard';
import { SubmitAnswerDto } from './entities/answer.entity';
import { PubSub } from 'graphql-subscriptions';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly authService: AuthService,
    @Inject(PUB_SUB) private pubSub: PubSub,
  ) {}

  // Public landing page for the API with links to the REST and GraphQL UIs.
  @Get('')
  getHello(): string {
    return "Welcome to the Canvassing backend.<br><a href='/api'>REST OpenAPI Swagger UI</a><br><a href='/graphql'>GraphQL API Playground</a>";
  }

  // Login with username/password to obtain JWT token.
  @HttpCode(HttpStatus.OK)
  @Post('auth/login')
  @ApiOperation({
    summary: 'Login with username/password to obtain JWT token.',
  })
  async login(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto.username, signInDto.password);
  }

  // Logout and invalidate JWT token.
  @UseGuards(AuthGuard)
  @ApiBearerAuth(BEARER_AUTH_NAME)
  @ApiOperation({ summary: 'Logout and invalidate JWT token.' })
  @Post('auth/logout')
  // eslint-disable-next-line @typescript-eslint/require-await
  async logout(@Request() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return req.logout();
  }

  // Get user account info for logged in user.
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.PARTNER)
  @Get('user/myaccount')
  @ApiBearerAuth(BEARER_AUTH_NAME)
  @ApiOperation({
    summary: 'Partner: Get user account info for logged in user.',
  })
  async myOrganization(@RESTCurrentUserId() user: User): Promise<User> {
    return this.appService.findUserById(user.id);
  }

  // Submit one answer to a questionnaire/addresslist. Fires a GraphQL
  // subscription event to the newAnswer pub-sub topic to notify clients of the
  // new answer object which includes inline reference data.
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.PARTNER)
  @Post('user/answers/submit')
  @ApiBearerAuth(BEARER_AUTH_NAME)
  @ApiOperation({
    summary: 'Partner: Submit one answer to a questionnaire/addresslist.',
  })
  async submitAnswer(
    @RESTCurrentUserId()
    userId: number,
    @Body() submitAnswerDto: SubmitAnswerDto,
  ) {
    await this.appService.submitAnswer(
      userId,
      submitAnswerDto.questionId,
      submitAnswerDto.questionnaireId,
      submitAnswerDto.addressListId,
      submitAnswerDto.addressId,
      submitAnswerDto.answerText,
    );
    return { message: 'Answer submitted successfully' };
  }

  //#region Organizations admin CRUD controllers

  // Create a new organization.
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('admin/organizations')
  @ApiOperation({ summary: 'Admin: Create a new organization.' })
  @ApiBearerAuth(BEARER_AUTH_NAME)
  createOrganization(
    @Body() createOrganizationDto: CreateOrganizationDto,
  ): Promise<Organization> {
    return this.appService.createOrganization(createOrganizationDto);
  }

  // Delete an organization.
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('admin/organizations/:id')
  @ApiBearerAuth(BEARER_AUTH_NAME)
  @ApiOperation({ summary: 'Admin: Delete an organization.' })
  deleteOrganization(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.appService.deleteOrganization(id);
  }

  // Get all organizations.
  // TODO paging
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/organizations')
  @ApiBearerAuth(BEARER_AUTH_NAME)
  @ApiOperation({ summary: 'Admin: Get all organizations.' })
  async findOrganizations(): Promise<Organization[]> {
    return this.appService.findOrganizations();
  }

  // Get an organization by ID.
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/organizations/:id')
  @ApiBearerAuth(BEARER_AUTH_NAME)
  @ApiOperation({ summary: 'Admin: Get an organization by ID.' })
  async findOrganization(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Organization> {
    return this.appService.findOrganization(id);
  }

  //#endregion Organizations admin CRUD controllers

  //#region AddressList admin CRUD controllers

  // Create a new address list.
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('admin/addresslists')
  @ApiBearerAuth(BEARER_AUTH_NAME)
  @ApiOperation({ summary: 'Admin: Create a new address list.' })
  createAddressList(
    @Body() createAddressListDto: CreateAddressListDto,
  ): Promise<AddressList> {
    return this.appService.createAddressList(createAddressListDto);
  }

  // Delete an address list.
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('admin/addresslists/:id')
  @ApiBearerAuth(BEARER_AUTH_NAME)
  @ApiOperation({ summary: 'Admin: Delete an address list.' })
  deleteAddressList(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.appService.deleteAddressList(id);
  }

  // Get all address lists.
  // TODO paging
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/addresslists')
  @ApiBearerAuth(BEARER_AUTH_NAME)
  @ApiOperation({ summary: 'Admin: Get all address lists.' })
  async findAddressLists(): Promise<AddressList[]> {
    return this.appService.findAddressLists();
  }

  // Get an address list by ID.
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/addresslists/:id')
  @ApiBearerAuth(BEARER_AUTH_NAME)
  @ApiOperation({ summary: 'Admin: Get an address list by ID.' })
  async findAddressList(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<AddressList> {
    return this.appService.findAddressList(id);
  }

  //#endregion AddressList admin CRUD controllers

  //#region Questionnaire admin CRUD controllers

  // Create a new questionnaire.
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('admin/questionnaires')
  @ApiBearerAuth(BEARER_AUTH_NAME)
  @ApiOperation({ summary: 'Admin: Create a new questionnaire.' })
  createQuestionnaire(
    @Body() createQuestionnaireDto: CreateQuestionnaireDto,
  ): Promise<Questionnaire> {
    return this.appService.createQuestionnaire(createQuestionnaireDto);
  }

  // Delete a questionnaire.
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('admin/questionnaires/:id')
  @ApiBearerAuth(BEARER_AUTH_NAME)
  @ApiOperation({ summary: 'Admin: Delete a questionnaire.' })
  deleteQuestionnaire(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.appService.deleteQuestionnaire(id);
  }

  // Get all questionnaires.
  // TODO paging
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/questionnaires')
  @ApiBearerAuth(BEARER_AUTH_NAME)
  @ApiOperation({ summary: 'Admin: Get all questionnaires.' })
  async findQuestionnaires(): Promise<Questionnaire[]> {
    return this.appService.findQuestionnaires();
  }

  // Get a questionnaire by ID.
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/questionnaires/:id')
  @ApiBearerAuth(BEARER_AUTH_NAME)
  @ApiOperation({ summary: 'Admin: Get a questionnaire by ID.' })
  async findQuestionnaire(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Questionnaire> {
    return this.appService.findQuestionnaire(id);
  }

  //#endregion Questionnaire admin CRUD controllers

  //#region Questions admin CRUD controllers

  // Create a new question.
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('admin/questions')
  @ApiBearerAuth(BEARER_AUTH_NAME)
  @ApiOperation({ summary: 'Admin: Create a new question.' })
  createQuestion(
    @Body() createQuestionDto: CreateQuestionDto,
  ): Promise<Question> {
    return this.appService.createQuestion(createQuestionDto);
  }

  // Delete a question.
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('admin/question/:id')
  @ApiBearerAuth(BEARER_AUTH_NAME)
  @ApiOperation({ summary: 'Admin: Delete a question.' })
  deleteQuestion(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.appService.deleteQuestion(id);
  }

  // Get all questions.
  // TODO paging
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/questions')
  @ApiBearerAuth(BEARER_AUTH_NAME)
  @ApiOperation({ summary: 'Admin: Get all questions.' })
  async findQuestions(): Promise<Question[]> {
    return this.appService.findQuestions();
  }

  // Get a question by ID.
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth(BEARER_AUTH_NAME)
  @Get('admin/question/:id')
  @ApiOperation({ summary: 'Admin: Get a question by ID.' })
  async findQuestion(@Param('id', ParseIntPipe) id: number): Promise<Question> {
    return this.appService.findQuestion(id);
  }

  //#endregion Questions admin CRUD controllers
}
