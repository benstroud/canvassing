import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Organization } from './organization.entity';
import { Address } from './address.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Questionnaire } from './questionnaire.entity';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@Entity()
@ObjectType()
export class AddressList {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: number;

  @Column()
  @Field()
  title: string;

  // Each AddressList belongs to one Organization.
  @ManyToOne(() => Organization, (organization) => organization.addressLists)
  @Field(() => Organization)
  organization: Organization;

  @Column()
  @Field()
  organizationId: number;

  @ManyToMany(
    () => Questionnaire,
    (questionnaire) => questionnaire.addressLists,
  )
  @Field(() => [Questionnaire])
  questionnaires: Questionnaire[];

  // Many-to-many relationship between AddressList and Address.
  @ManyToMany(() => Address, (address) => address.addressLists)
  @JoinTable()
  @Field(() => [Address])
  addresses: Address[];
}

export class CreateAddressListDto {
  @ApiProperty({
    description: 'The organization ID that controls the address list',
  })
  organizationId: number;
  @ApiProperty({ description: 'The title of the address list' })
  title: string;
}
