import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('tx_queue')
export class TxQueueEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'contract_address' })
  contractAddress: string;

  @Column('jsonb')
  params: Record<string, any>;

  @Column()
  method: string;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column({ nullable: true })
  transactionHash?: string;

  @Column({ type: 'int', default: 0 })
  retryCount: number;

  @Column({ nullable: true })
  error?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
