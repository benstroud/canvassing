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
import { Field, ID, ObjectType } from '@nestjs/graphql';

@Entity()
@ObjectType()
export class Questionnaire {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: number;

  @Column({ length: 255 })
  @Field()
  title: string;

  // Each Questionnaire is associated with one Organization.
  @ManyToOne(() => Organization, (organization) => organization.questionnaires)
  @Field(() => Organization)
  organization: Organization;

  // A Questionnaire can have one or more Questions.
  @OneToMany(() => Question, (question) => question.questionnaire)
  @Field(() => [Question])
  questions: Question[];

  // Many-to-many relationship with AddressList.
  @ManyToMany(() => AddressList, (addressList) => addressList.addresses)
  @Field(() => [AddressList])
  addressLists: AddressList[];
}

export class CreateQuestionnaireDto {
  @ApiProperty({
    description: 'The organization ID that controls the questionnaire',
  })
  organizationId: number;
  @ApiProperty({ description: 'The title of the questionnaire' })
  title: string;
}
