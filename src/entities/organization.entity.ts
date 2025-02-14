import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Questionnaire } from './questionnaire.entity';
import { AddressList } from './addresslist.entity';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
@Entity()
@Unique(['name'])
export class Organization {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: number;

  @Column({ length: 255 })
  @Field()
  name: string;

  // An Organization can have one or more Questionnaires.
  @OneToMany(() => Questionnaire, (questionnaire) => questionnaire.organization)
  @Field(() => [Questionnaire])
  questionnaires: Questionnaire[];

  // An Organization has zero or more associated AddressList records.
  @OneToMany(() => AddressList, (addressList) => addressList.organization)
  @Field(() => [AddressList])
  addressLists: AddressList[];
}

export class CreateOrganizationDto {
  @ApiProperty({ description: 'The name of the organization' })
  name: string;
}
