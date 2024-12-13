import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ nullable: true })
  name: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ unique: true, nullable: true })
  picture: string;

  @Column({ unique: false, nullable: true })
  sms: string;

  @Column({ nullable: true, name: 'is_email_verified' })
  isEmailVerified: boolean;

  @Column({ nullable: true, name: 'is_sms_verified' })
  isSmsVerified: boolean;

  @Column({ length: 42, nullable: true, name: 'address' })
  address: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('user_polls')
export class UserPollEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ unique: true, nullable: true, name: 'user_id' })
  userId: number;

  @Column({ unique: true, nullable: true, name: 'poll_id' })
  pollId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
