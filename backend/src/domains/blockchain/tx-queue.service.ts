// entity/TransactionQueue.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Repository,
  LessThan,
} from 'typeorm';
import { TransactionStatus, TxQueueEntity } from './tx-queue.entity';
import { BlockchainService } from './blockchain.service';
import { TxQueueRepository } from './tx-queue.repository';
import { Interval } from '@nestjs/schedule';

@Injectable()
export class TxQueueService {
  private isProcessing = false;
  private processingInterval: NodeJS.Timeout;

  constructor(
    private blockchainService: BlockchainService,
    private tqRepository: TxQueueRepository,
  ) {}

  async queue(
    contractAddress: string,
    method: string,
    params: Record<string, any>,
  ) {
    const transaction = this.tqRepository.create({
      contractAddress,
      method,
      params,
      status: TransactionStatus.PENDING,
    });

    return await transaction;
  }

  // TODO should test it
  @Interval(10000)
  private async processQueue() {
    if (this.isProcessing) return;

    this.isProcessing = true;

    try {
      // Get next pending transaction
      const pendingTx = await this.tqRepository.findOldest();
      if (!pendingTx) {
        this.isProcessing = false;
        return;
      }

      // Mark as processing
      await this.tqRepository.update(pendingTx.id, {
        status: TransactionStatus.PROCESSING,
      });

      try {
        const contract = await this.blockchainService.getContract(
          pendingTx.contractAddress,
        );

        // Send transaction
        const tx = await contract[pendingTx.method](
          ...Object.values(pendingTx.params),
        );

        // Wait for confirmation
        const receipt = await tx.wait();

        // Mark as completed
        await this.tqRepository.update(pendingTx.id, {
          status: TransactionStatus.COMPLETED,
          transactionHash: receipt.transactionHash,
        });
      } catch (error) {
        // Handle failure
        await this.tqRepository.update(pendingTx.id, {
          status: TransactionStatus.FAILED,
          retryCount: pendingTx.retryCount + 1,
          error: error.message,
        });
      }
    } finally {
      this.isProcessing = false;
    }
  }
}
