import { Question } from './question.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Answer {
  @PrimaryGeneratedColumn()
  id: number;

  // Free form text for the answer verbiage.
  @Column('text')
  text: string;

  // Link back to the Question.
  @ManyToOne(() => Question, (question) => question.answers)
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
