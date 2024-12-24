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

  // for login session
  @Column({ nullable: true })
  token: string;

  @Column({ nullable: true })
  name: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ unique: true, nullable: true })
  sms: string;

  @Column({ length: 42, nullable: true })
  address: string;

  @Column({ nullable: true })
  isEmailVerified: boolean;

  @Column({ nullable: true })
  isSmsVerified: boolean;

  @Column({ nullable: true })
  isIdVerified: boolean;

  @Column({ nullable: true })
  picture: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
