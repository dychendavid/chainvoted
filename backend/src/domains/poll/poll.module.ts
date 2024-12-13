import { Module } from '@nestjs/common';
import { PollController } from './poll.controller';
import { PollService } from './poll.service';
import { PollRepository } from './poll.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PollEntity, PollOptionEntity } from './poll.entity';
import { BlockchainService } from '../blockchain/blockchain.service';
import { UserRepository } from '../user/user.repository';
import { UserEntity, UserPollEntity } from '../user/user.entity';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { TxQueueService } from '../blockchain/tx-queue.service';
import { TxQueueRepository } from '../blockchain/tx-queue.repository';
import { TxQueueEntity } from '../blockchain/tx-queue.entity';
import { UserController } from '../user/user.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PollEntity,
      PollOptionEntity,
      UserEntity,
      UserPollEntity,
      TxQueueEntity,
    ]),
    BlockchainModule,
  ],
  controllers: [PollController, UserController],
  providers: [
    TxQueueRepository,
    BlockchainService,
    PollService,
    PollRepository,
    UserRepository,
    TxQueueService,
  ],
})
export class PollModule {}
