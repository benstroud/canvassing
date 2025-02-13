import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Questionnaire } from './questionnaire.entity';
import { AddressList } from './addresslist.entity';

@Entity()
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
