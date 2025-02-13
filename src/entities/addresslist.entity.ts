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

@Entity()
export class AddressList {
  @PrimaryGeneratedColumn()
  id: number;

  // Each AddressList belongs to one Organization.
  @ManyToOne(() => Organization, (organization) => organization.addressLists)
  organization: Organization;

  @Column()
  organizationId: number;

  // Many-to-many relationship between AddressList and Address.
  @ManyToMany(() => Address, (address) => address.addressLists)
  @JoinTable()
  addresses: Address[];
}
