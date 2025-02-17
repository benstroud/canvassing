import {
  Query,
  Resolver,
  Mutation,
  Args,
  ObjectType,
  Field,
  Subscription,
} from '@nestjs/graphql';
import { AppService } from './app.service';
import { User } from './entities/user.entity';
import { Inject, UseGuards } from '@nestjs/common';
import { GqlCurrentUserId, GqlAuthGuard } from './auth/jwt-auth.guard';
import { Answer, SubmitAnswerDto } from './entities/answer.entity';
import { PubSub } from 'graphql-subscriptions';
import { PUB_SUB } from './constants';

@ObjectType()
export class UserResponseDto {
  @Field()
  success: boolean;

  @Field(() => User, { nullable: true })
  user: User | null;
}

@Resolver()
export class CanvassingResolver {
  constructor(
    private readonly appService: AppService,
    @Inject(PUB_SUB)
    private pubSub: PubSub,
  ) {}

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

  @Subscription(() => Answer, {
    name: 'newAnswer',
  })
  newAnswer() {
    return this.pubSub.asyncIterableIterator('newAnswer');
  }
}
