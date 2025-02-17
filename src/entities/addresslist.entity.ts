// AddressList TypeORM entity

import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Organization } from './organization.entity';
import { Address } from './address.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Questionnaire } from './questionnaire.entity';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Answer } from './answer.entity';

@Entity()
@ObjectType()
export class AddressList {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: number;

  @Column()
  @Field()
  title: string;

  @Column()
  @Field()
  organizationId: number;

  // Each AddressList belongs to one Organization.
  @ManyToOne(() => Organization, (organization) => organization.addressLists)
  @Field(() => Organization)
  organization: Organization;

  // A User can have one or more AnswerLists
  @OneToMany(() => Answer, (answer) => answer.addressList)
  @Field(() => [Answer])
  answers: Answer[];

  // A Questionnaire can have one or more AddressLists. An AddressList can
  // belong to one or more Questionnaires.
  @ManyToMany(
    () => Questionnaire,
    (questionnaire) => questionnaire.addressLists,
  )
  @Field(() => [Questionnaire])
  questionnaires: Questionnaire[];

  // Each AddressList can have one or more Addresses. An Address can belong to
  // one or more AddressLists.
  @ManyToMany(() => Address, (address) => address.addressLists)
  @JoinTable()
  @Field(() => [Address])
  addresses: Address[];
}

// Data transfer object (DTO) with the fields that the client can set when
// making a request to create an AddressList. Descriptions appear in Swagger UI.
export class CreateAddressListDto {
  @ApiProperty({
    description: 'The organization ID that controls the address list',
  })
  organizationId: number;
  @ApiProperty({ description: 'The title of the address list' })
  title: string;
}
