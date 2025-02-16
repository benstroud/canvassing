import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { AddressList } from './addresslist.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Answer } from './answer.entity';

@Entity()
@ObjectType()
@Unique(['address1', 'zipcode'])
export class Address {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: number;

  @Column({ length: 255 })
  @Field()
  address1: string;

  @Column({ length: 255, nullable: true })
  @Field({ nullable: true })
  address2: string;

  @Column({ length: 100 })
  @Field()
  city: string;

  @Column({ length: 100 })
  @Field()
  state: string;

  @Column({ length: 20 })
  @Field()
  zipcode: string;

  // Many-to-many relationship with AddressList.
  @ManyToMany(() => AddressList, (addressList) => addressList.addresses)
  @Field(() => [AddressList])
  addressLists: AddressList[];

  @OneToMany(() => Answer, (answer) => answer.address)
  @Field(() => [Answer])
  answers: Answer[];
}

export class CreateAddressDto {
  @ApiProperty({ description: 'The first line of the address' })
  address1: string;
  @ApiProperty({ description: 'The second line of the address' })
  address2: string;
  @ApiProperty({ description: 'The city' })
  city: string;
  @ApiProperty({ description: 'The state' })
  state: string;
  @ApiProperty({ description: 'The ZIP code' })
  zipcode: string;
}
