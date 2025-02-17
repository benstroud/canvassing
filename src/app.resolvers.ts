// Description: Resolvers for the GraphQL API.

import { Query, Resolver, Mutation, Args, Subscription } from '@nestjs/graphql';
import { AppService } from './app.service';
import { User } from './entities/user.entity';
import { Inject, UseGuards } from '@nestjs/common';
import { GqlCurrentUserId, GqlAuthGuard } from './auth/jwt-auth.guard';
import { Answer, SubmitAnswerDto } from './entities/answer.entity';
import { PubSub } from 'graphql-subscriptions';
import { PUB_SUB } from './constants';

@Resolver()
export class CanvassingResolver {
  constructor(
    private readonly appService: AppService,
    @Inject(PUB_SUB)
    private pubSub: PubSub,
  ) {}

  // GraphQL query for fetching the current user's account information and
  // associated organizations, questionnaires, address lists, questions and
  // answers.
  @UseGuards(GqlAuthGuard)
  @Query(() => User, { name: 'myAccount' })
  async myAccount(@GqlCurrentUserId() userId: number): Promise<User> {
    console.log('myAccount userId:', userId);

    if (userId === undefined) {
      throw new Error('User ID not found');
    }
    try {
      const user = await this.appService.findUserById(userId);
      return user;
    } catch {
      throw new Error('User not found');
    }
  }

  // GraphQL mutation for submitting an answer to a question. This fires a
  // subscription event to the newAnswer pub-sub topic to notify clients of the
  // new answer object which includes inline reference data.
  @UseGuards(GqlAuthGuard)
  @Mutation(() => String, { name: 'submitAnswer' })
  async submitAnswer(
    @GqlCurrentUserId() userId: number,
    @Args('submitAnswerDto') submitAnswerDto: SubmitAnswerDto,
  ): Promise<string> {
    try {
      await this.appService.submitAnswer(
        userId,
        submitAnswerDto.questionId,
        submitAnswerDto.questionnaireId,
        submitAnswerDto.addressListId,
        submitAnswerDto.addressId,
        submitAnswerDto.answerText,
      );
      return 'Ok';
    } catch (error) {
      console.error('submitAnswer error:', error);
      return 'Error';
    }
  }

  // GraphQL subscription for communicating new answers answer events to
  // clients.
  @Subscription(() => Answer, {
    name: 'newAnswer',
  })
  newAnswer() {
    return this.pubSub.asyncIterableIterator('newAnswer');
  }
}
