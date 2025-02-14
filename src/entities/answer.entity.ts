import { ApiProperty } from '@nestjs/swagger';
import { Question } from './question.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@Entity()
@ObjectType()
export class Answer {
  @PrimaryGeneratedColumn()
  @Field(() => ID)
  id: number;

  // Free form text for the answer verbiage.
  @Column('text')
  @Field()
  text: string;

  // Link back to the Question.
  @ManyToOne(() => Question, (question) => question.answers)
  @Field(() => Question)
  question: Question;

  /* @Column()
  questionId: number; */

  /* // Storing the associated Questionnaire id inline.
  @Column()
  questionnaireId: number;

  // Storing the associated Organization id inline.
  @Column()
  organizationId: number;

  // Storing the associated AddressList id inline.
  @Column()
  addressListId: number;

  // Storing the associated Address id inline.
  @Column()
  addressId: number;

  // (Optional) Define a relation to Address if you need to access the Address entity.
  @ManyToOne(() => Address, (address) => address.answers)
  address: Address; */
}

export class CreateAnswerCto {
  questionId: number;
  @ApiProperty({ description: 'The answer text' })
  text: string;
}
