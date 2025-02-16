import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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
import { HTTPCurrentUserId, AuthGuard } from './auth/jwt-auth.guard';
import { SignInDto, User } from './entities/user.entity';
import { CreateQuestionDto, Question } from './entities/question.entity';
import { BEARER_AUTH_NAME, UserRole } from './constants';
import { Roles } from './auth/roles.decorator';
import { RolesGuard } from './auth/roles.guard';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly authService: AuthService,
  ) {}

  @Get('')
  getHello(): string {
    return "Welcome to the Canvassing backend.<br><a href='/api'>REST OpenAPI Swagger UI</a><br><a href='/graphql'>GraphQL API Playground</a>";
  }

  @HttpCode(HttpStatus.OK)
  @Post('auth/login')
  @ApiOperation({
    summary: 'Login with username/password to obtain JWT token.',
  })
  async login(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto.username, signInDto.password);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth(BEARER_AUTH_NAME)
  @ApiOperation({ summary: 'Logout and invalidate JWT token.' })
  @Post('auth/logout')
  // eslint-disable-next-line @typescript-eslint/require-await
  async logout(@Request() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return req.logout();
  }

  //#region Organizations controllers

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.PARTNER)
  @Get('partner/organization')
  @ApiBearerAuth(BEARER_AUTH_NAME)
  @ApiOperation({ summary: 'Get the organization of the current user.' })
  async myOrganization(@HTTPCurrentUserId() user: User): Promise<Organization> {
    return this.appService.findOrganization(user.id);
  }

  // TODO: Only allow for admin users

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

  // TODO: Only allow for admin users

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('admin/organizations/:id')
  @ApiBearerAuth(BEARER_AUTH_NAME)
  @ApiOperation({ summary: 'Admin: Delete an organization.' })
  deleteOrganization(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.appService.deleteOrganization(id);
  }

  // TODO: Only allow for admin users

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/organizations')
  @ApiBearerAuth(BEARER_AUTH_NAME)
  @ApiOperation({ summary: 'Admin: Get all organizations.' })
  async findOrganizations(): Promise<Organization[]> {
    return this.appService.findOrganizations();
  }

  // TODO: Only allow for admin users
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

  //#endregion Organizations controllers

  //#region AddressList controllers

  // TODO: Only allow for admin users
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

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('admin/addresslists/:id')
  @ApiBearerAuth(BEARER_AUTH_NAME)
  @ApiOperation({ summary: 'Admin: Delete an address list.' })
  deleteAddressList(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.appService.deleteAddressList(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/addresslists')
  @ApiBearerAuth(BEARER_AUTH_NAME)
  @ApiOperation({ summary: 'Admin: Get all address lists.' })
  async findAddressLists(): Promise<AddressList[]> {
    return this.appService.findAddressLists();
  }

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

  //#endregion AddressList controllers

  //#region Questionnaire controllers
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.PARTNER)
  @Post('partner/questionnaires/:questionnaireId/submit')
  @ApiBearerAuth(BEARER_AUTH_NAME)
  @ApiOperation({ summary: 'Partner: Submit answers to a questionnaire.' })
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

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('admin/questionnaires/:id')
  @ApiBearerAuth(BEARER_AUTH_NAME)
  @ApiOperation({ summary: 'Admin: Delete a questionnaire.' })
  deleteQuestionnaire(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.appService.deleteQuestionnaire(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/questionnaires')
  @ApiBearerAuth(BEARER_AUTH_NAME)
  @ApiOperation({ summary: 'Admin: Get all questionnaires.' })
  async findQuestionnaires(): Promise<Questionnaire[]> {
    return this.appService.findQuestionnaires();
  }

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

  //#endregion Questionnaire controllers

  //#region Questions controllers

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

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('admin/question/:id')
  @ApiBearerAuth(BEARER_AUTH_NAME)
  @ApiOperation({ summary: 'Admin: Delete a question.' })
  deleteQuestion(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.appService.deleteQuestion(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/questions')
  @ApiBearerAuth(BEARER_AUTH_NAME)
  @ApiOperation({ summary: 'Admin: Get all questions.' })
  async findQuestions(): Promise<Question[]> {
    return this.appService.findQuestions();
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth(BEARER_AUTH_NAME)
  @Get('admin/question/:id')
  @ApiOperation({ summary: 'Admin: Get a question by ID.' })
  async findQuestion(@Param('id', ParseIntPipe) id: number): Promise<Question> {
    return this.appService.findQuestion(id);
  }

  //#endregion
}
