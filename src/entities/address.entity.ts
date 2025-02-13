import {
  Column,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { AddressList } from './addresslist.entity';

@Entity()
@Unique(['address1', 'zipcode'])
export class Address {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  address1: string;

  @Column({ length: 255, nullable: true })
  address2: string;

  @Column({ length: 100 })
  city: string;

  @Column({ length: 100 })
  state: string;

  @Column({ length: 20 })
  zipcode: string;

  // Many-to-many relationship with AddressList.
  @ManyToMany(() => AddressList, (addressList) => addressList.addresses)
  addressLists: AddressList[];

  /* // (Optional) Reverse relation if you want to access Answers related to this Address.
  @OneToMany(() => Answer, (answer) => answer.address)
  answers: Answer[]; */
}
