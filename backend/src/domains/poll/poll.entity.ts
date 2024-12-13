import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';

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

  @Column({ nullable: true, name: 'is_email_verification', default: true })
  isEmailVerification: boolean;

  @Column({ nullable: true, name: 'is_sms_verification', default: true })
  isSmsVerification: boolean;

  @Column({ nullable: true, name: 'is_id_verification', default: true })
  isIdVerification: boolean;

  @Column({ nullable: true, name: 'is_enable_donations', default: true })
  isEnableDonations: boolean;

  @Column({ nullable: true, name: 'expired_at' })
  expiredAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => PollOptionEntity, (option) => option.poll, {
    createForeignKeyConstraints: false,
  })
  options: PollOptionEntity[];
}

@Entity('poll_options')
export class PollOptionEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ nullable: true })
  pollId: number;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  cover: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => PollEntity, (poll) => poll.options, {
    createForeignKeyConstraints: false,
  })
  poll: PollEntity;
}
