import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Organization } from './organization.entity';
import { Question } from './question.entity';

@Entity()
export class Questionnaire {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  // Each Questionnaire is associated with one Organization.
  @ManyToOne(() => Organization, (organization) => organization.questionnaires)
  organization: Organization;

  // A Questionnaire can have one or more Questions.
  @OneToMany(() => Question, (question) => question.questionnaire)
  questions: Question[];
}
