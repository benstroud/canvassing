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

@Entity()
@Unique(['name'])
export class Organization {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  // An Organization can have one or more Questionnaires.
  @OneToMany(() => Questionnaire, (questionnaire) => questionnaire.organization)
  questionnaires: Questionnaire[];

  // An Organization has zero or more associated AddressList records.
  @OneToMany(() => AddressList, (addressList) => addressList.organization)
  addressLists: AddressList[];
}

export class CreateOrganizationDto {
  @ApiProperty({ description: 'The name of the organization' })
  name: string;
}
