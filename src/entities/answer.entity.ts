// Answer TypeORM entity

import { ApiProperty } from '@nestjs/swagger';
import { Question } from './question.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Field, ID, ObjectType, InputType, Int } from '@nestjs/graphql';
import { AddressList } from './addresslist.entity';
import { User } from './user.entity';
import { Address } from './address.entity';

@Entity()
@ObjectType()
// Uncomment the @Unique decorator to enforce that only a single answer can be
// submitted for a given question, address list, user, and address.
//
// @Unique(['question', 'addressList', 'user', 'address'])
export class Answer {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: number;

  // Free form text for the answer verbiage. Could potentially structure with
  // JSON or introduce a new entity for more complex answer types.
  @Column('text')
  @Field()
  text: string;

  // Link back to the Question. An answer is always associated with a question.
  @ManyToOne(() => Question, (question) => question.answers)
  @Field(() => Question)
  question: Question;

  // Link back to the AddressList. An answer is always associated with an address list.
  @ManyToOne(() => AddressList, (addressList) => addressList.answers)
  @Field(() => AddressList)
  addressList: AddressList;

  // Link back to the User. An answer is always associated with a user.
  @ManyToOne(() => User, (user) => user.answers)
  @Field(() => User)
  user: User;

  // Link back to the Address. An answer is always associated with an address.
  @ManyToOne(() => Address, (address) => address.answers)
  @Field(() => Address)
  address: Address;

  // For convenience, store inline JSON with the assocaited entities at the time
  // of answer submission.
  @Column('text')
  @Field()
  inlineReferenceData: string;
}

// Data transfer object (DTO) with the fields that the client can set when
// making a request to create an Answer (by admin). Descriptions appear in
// Swagger UI.
export class CreateAnswerDto {
  @ApiProperty({ description: 'The answer text' })
  text: string;

  @ApiProperty({
    description: 'The question ID that the answer is associated with',
  })
  questionId: number;

  @ApiProperty({
    description: 'The address list ID that the answer is associated with',
  })
  addressListId: number;

  @ApiProperty({
    description: 'The questionnaire ID that the answer is associated with',
  })
  questionnaireId: number;

  @ApiProperty({
    description: 'The user ID that the answer is associated with',
  })
  userId: number;

  @ApiProperty({
    description: 'The address ID that the answer is associated with',
  })
  addressId: number;
}

// Data transfer object (DTO) with the fields that the client can set when
// making a request to submit an Answer (by user). Descriptions appear in
// Swagger UI.
@InputType()
export class SubmitAnswerDto {
  @ApiProperty({
    description: 'The questionnaire ID that the answer is associated with',
  })
  @Field(() => Int)
  questionnaireId: number;

  @ApiProperty({
    description: 'The address list ID that the answer is associated with',
  })
  @Field(() => Int)
  addressListId: number;

  @ApiProperty({
    description: 'The address ID that the answer is associated with',
  })
  @Field(() => Int)
  addressId: number;

  @ApiProperty({
    description: 'The question ID that the answer is associated with',
  })
  @Field(() => Int)
  questionId: number;

  @ApiProperty({
    description: 'The answer text',
  })
  @Field()
  answerText: string;
}
