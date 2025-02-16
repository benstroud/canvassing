/* import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { Questionnaire } from './entities/questionnaire.entity';
import { AppService } from './app.service';

// Note: For a full code-first schema, the Questionnaire entity would normally be decorated with @ObjectType and its fields with @Field.
@Resolver(() => Questionnaire)
export class QuestionnaireResolver {
  constructor(private readonly appService: AppService) {}

  @Query(() => [Questionnaire], { name: 'questionnaires' })
  async getQuestionnaires(): Promise<Questionnaire[]> {
    return this.appService.findQuestionnaires();
  }

  @Query(() => Questionnaire, { name: 'questionnaire' })
  async getQuestionnaire(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Questionnaire> {
    return this.appService.findQuestionnaire(id);
  }
}
 */

import { Query, Resolver } from '@nestjs/graphql';
import { AppService } from './app.service';
import { User } from './entities/user.entity';
import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { GqlCurrentUserId, GqlAuthGuard } from './auth/jwt-auth.guard';

@Resolver()
export class CanvassingResolver {
  constructor(private readonly appService: AppService) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => User, { name: 'myAccount' })
  async myAccount(@GqlCurrentUserId() userId: number): Promise<User> {
    console.log('myAccount userId:', userId);
    if (userId === undefined) {
      throw new UnauthorizedException('User not found');
    }
    return this.appService.findUserById(userId);
  }
}
