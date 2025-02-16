import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';

import * as bcrypt from 'bcrypt';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Organization } from './organization.entity';
import { JoinTable, ManyToMany } from 'typeorm';
import { UserRole } from 'src/constants';

@ObjectType()
@Entity()
export class User {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  // A User can belong to one or more Organizations. An Organization can have one or more Users.
  @Field(() => [Organization])
  @ManyToMany(() => Organization, (organization) => organization.users)
  @JoinTable()
  organizations: Organization[];

  @Field()
  @Column({ unique: true })
  username: string;

  // The password is stored as a salted bcrypt hash.
  @Column()
  password: string;

  // By default, a new user is created as a PARTNER.
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

  // eslint-disable-next-line @typescript-eslint/require-await
  async validatePassword(password: string): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return bcrypt.compare(password, this.password);
  }
}
