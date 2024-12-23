import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { PollOptionEntity } from './poll-option/poll-option.entity';

@Entity('polls')
export class PollEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ length: 42, unique: false, nullable: true })
  address: string;

  @Column({ length: 100, unique: false, nullable: true })
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  cover: string;

  @Column({ nullable: true, default: true })
  isEmailVerification: boolean;

  @Column({ nullable: true, default: true })
  isSmsVerification: boolean;

  @Column({ nullable: true, default: true })
  isIdVerification: boolean;

  @Column({ nullable: true, default: true })
  isEnableDonations: boolean;

  @Column({ nullable: true })
  expiredAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => PollOptionEntity, (option) => option.poll, {
    createForeignKeyConstraints: false,
  })
  options: PollOptionEntity[];
}
