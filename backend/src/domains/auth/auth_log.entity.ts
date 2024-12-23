import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('auth_logs')
export class AuthLogEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ nullable: true })
  token: string;

  // extract from token
  @Column({ nullable: true })
  email: string;

  // extract from token
  @Column({ nullable: true })
  name: string;

  // for token validation
  @Column({ nullable: true, default: false })
  is_success: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
