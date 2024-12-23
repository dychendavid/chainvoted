import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PollController } from './poll.controller';
import { PollService } from './poll.service';
import { PollRepository } from './poll.repository';
import { PollOptionRepository } from './poll-option.repository';
import { PollEntity, PollOptionEntity } from './poll.entity';
import { BlockchainService } from '../blockchain/blockchain.service';
import { UserRepository } from '../user/user.repository';
import { UserEntity, UserPollEntity } from '../user/user.entity';
import { UserController } from '../user/user.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PollEntity,
      PollOptionEntity,
      UserEntity,
      UserPollEntity,
    ]),
  ],
  controllers: [PollController, UserController],
  providers: [
    BlockchainService,
    PollService,
    PollRepository,
    PollOptionRepository,
    UserRepository,
  ],
})
export class PollModule {}
