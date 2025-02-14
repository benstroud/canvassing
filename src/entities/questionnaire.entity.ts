import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Organization } from './organization.entity';
import { Question } from './question.entity';
import { ApiProperty } from '@nestjs/swagger';
import { AddressList } from './addresslist.entity';

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

  // Many-to-many relationship with AddressList.
  @ManyToMany(() => AddressList, (addressList) => addressList.addresses)
  addressLists: AddressList[];
}

export class CreateQuestionnaireDto {
  organizationId: number;
  @ApiProperty({ description: 'The title of the questionnaire' })
  title: string;
}
