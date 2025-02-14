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
import { Organization } from './entities/organization.entity';

@Resolver()
export class CanvassingResolver {
  constructor(private readonly appService: AppService) {}

  @Query(() => Organization, { name: 'organization' })
  async getMyOrganization(): Promise<Organization> {
    // TODO instead obtain organization id from API key
    const id = 1;
    return this.appService.findOrganization(id);
  }

  /* @Query(() => [Questionnaire], { name: 'questionnaires' })
  async getQuestionnaires(): Promise<Questionnaire[]> {
    return this.appService.findQuestionnaires();
  }

  @Query(() => Questionnaire, { name: 'questionnaire' })
  async getQuestionnaire(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Questionnaire> {
    return this.appService.findQuestionnaire(id);
  } */
}
