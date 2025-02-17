// User TypeORM entity

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
  OneToMany,
} from 'typeorm';

import * as bcrypt from 'bcrypt';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Organization } from './organization.entity';
import { JoinTable, ManyToMany } from 'typeorm';
import { UserRole } from '../constants';
import { Answer } from './answer.entity';

@ObjectType()
@Entity()
export class User {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  // A User can belong to one or more Organizations. An Organization can have
  // one or more Users.
  @Field(() => [Organization])
  @ManyToMany(() => Organization, (organization) => organization.users)
  @JoinTable()
  organizations: Organization[];

  // A User can have one or more Answers.
  @OneToMany(() => Answer, (answer) => answer.user)
  @Field(() => [Answer])
  answers: Answer[];

  @Field()
  @Column({ unique: true })
  username: string;

  // The password is stored as a salted bcrypt hash (see hashPassword() below).
  @Column()
  password: string;

  // By default, a new user is created as a non-admin PARTNER user.
  @Field(() => String)
  @Column({
    type: 'text',
    default: 'PARTNER',
  })
  @ApiProperty({ enum: UserRole })
  role: UserRole;

  // Salting and hashing the password before saving it to the database - using bcrypt.
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      const saltRounds = 10;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      this.password = await bcrypt.hash(this.password, saltRounds);
    }
  }

  // Verifying the password when a user logs in - using bcrypt.
  // eslint-disable-next-line @typescript-eslint/require-await
  async validatePassword(password: string): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return bcrypt.compare(password, this.password);
  }
}

// Data transfer object (DTO) with the fields that the client can set when
// making a /auth/login request. Descriptions appear in Swagger UI.
export class SignInDto {
  @ApiProperty({ description: 'The username of the user' })
  username: string;
  @ApiProperty({ description: 'The password of the user' })
  password: string;
}
