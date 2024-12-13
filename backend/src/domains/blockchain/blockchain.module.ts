import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockchainService } from '../blockchain/blockchain.service';
import { UserRepository } from '../user/user.repository';
import { TxQueueRepository } from './tx-queue.repository';
import { TxQueueService } from './tx-queue.service';
import { TxQueueEntity } from './tx-queue.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TxQueueEntity])],
  controllers: [],
  providers: [BlockchainService, TxQueueService, TxQueueRepository],
})
export class BlockchainModule {}
