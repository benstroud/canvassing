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

@Entity()
@Unique(['text', 'questionnaire'])
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  // Free form text for the question verbiage.
  @Column('text')
  text: string;

  // Each Question belongs to one Questionnaire.
  @ManyToOne(() => Questionnaire, (questionnaire) => questionnaire.questions)
  questionnaire: Questionnaire;

  // A Question can have one or more Answers.
  @OneToMany(() => Answer, (answer) => answer.question)
  answers: Answer[];
}

export class CreateQuestionDto {
  questionnaireId: number;
  @ApiProperty({ description: 'The question text' })
  text: string;
}
