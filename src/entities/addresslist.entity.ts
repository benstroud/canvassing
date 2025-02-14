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

@Entity()
export class AddressList {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  // Each AddressList belongs to one Organization.
  @ManyToOne(() => Organization, (organization) => organization.addressLists)
  organization: Organization;

  @Column()
  organizationId: number;

  @ManyToMany(
    () => Questionnaire,
    (questionnaire) => questionnaire.addressLists,
  )
  questionnaires: Questionnaire[];

  // Many-to-many relationship between AddressList and Address.
  @ManyToMany(() => Address, (address) => address.addressLists)
  @JoinTable()
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
