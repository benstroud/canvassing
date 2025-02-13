import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Questionnaire } from './questionnaire.entity';
import { Answer } from './answer.entity';

@Entity()
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
