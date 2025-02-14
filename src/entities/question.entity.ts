import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Questionnaire } from './questionnaire.entity';
import { Answer } from './answer.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@Entity()
@Unique(['text', 'questionnaire'])
@ObjectType()
export class Question {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: number;

  // Free form text for the question verbiage.
  @Column('text')
  @Field()
  text: string;

  // Each Question belongs to one Questionnaire.
  @ManyToOne(() => Questionnaire, (questionnaire) => questionnaire.questions)
  @Field(() => Questionnaire)
  questionnaire: Questionnaire;

  // A Question can have one or more Answers.
  @OneToMany(() => Answer, (answer) => answer.question)
  @Field(() => [Answer])
  answers: Answer[];
}

export class CreateQuestionDto {
  questionnaireId: number;
  @ApiProperty({ description: 'The question text' })
  text: string;
}
