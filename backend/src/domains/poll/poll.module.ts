import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PollController } from './poll.controller';
import { PollEntity } from './poll.entity';
import { PollRepository } from './poll.repository';
import { PollService } from './poll.service';
import { PollOptionEntity } from './poll-option/poll-option.entity';
import { PollOptionRepository } from './poll-option/poll-option.repository';
import { BlockchainService } from '../blockchain/blockchain.service';
import { UserRepository } from '../user/user.repository';
import { UserEntity } from '../user/user.entity';
import { UserController } from '../user/user.controller';
import { VoteRepository } from './vote/vote.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([PollEntity, PollOptionEntity, UserEntity]),
  ],
  controllers: [PollController, UserController],
  providers: [
    BlockchainService,
    PollService,
    PollRepository,
    PollOptionRepository,
    UserRepository,
    VoteRepository,
  ],
})
export class PollModule {}
