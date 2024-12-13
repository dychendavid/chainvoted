import AppDataSource from 'src/infra/data-source';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  createQueryBuilder,
  FindOptionsWhere,
  LessThan,
  MoreThan,
  Repository,
  UpdateResult,
} from 'typeorm';
import { TransactionStatus, TxQueueEntity } from './tx-queue.entity';

@Injectable()
export class TxQueueRepository {
  constructor(
    @InjectRepository(TxQueueEntity)
    private tqRepo: Repository<TxQueueEntity>,
  ) {}

  findOldest(): Promise<TxQueueEntity> {
    return this.tqRepo.findOne({
      where: {
        status: TransactionStatus.PENDING,
        retryCount: LessThan(3),
      },
      order: {
        id: 'ASC',
      },
    });
  }

  update(id: number, data: Partial<TxQueueEntity>): Promise<UpdateResult> {
    return this.tqRepo.update(id, data);
  }

  create({
    contractAddress,
    method,
    params,
    status,
  }: {
    contractAddress: string;
    method: string;
    params: Record<string, any>;
    status: TransactionStatus;
  }): Promise<TxQueueEntity> {
    const txQueueEntity = this.tqRepo.create({
      contractAddress,
      method,
      params,
      status,
    });
    return this.tqRepo.save(txQueueEntity);
  }
}
