import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { PollRepository } from './poll.repository';
import { BlockchainService } from '../blockchain/blockchain.service';
import { CreatePollOptionDto } from './poll.dto';
import { UserRepository } from '../user/user.repository';
import { TxQueueService } from '../blockchain/tx-queue.service';
import { Interval } from '@nestjs/schedule';

@Injectable()
export class PollService {
  private localProvider: ethers.JsonRpcProvider;

  constructor(
    private pollRepository: PollRepository,
    private userRepository: UserRepository,
    private blockchainService: BlockchainService,
    private txQueueService: TxQueueService,
  ) {
    // TODO: should be configureable
    this.localProvider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
  }

  getProvider() {
    return this.localProvider;
  }

  /*
   * create poll and options, and deploy contract by each poll
   */
  async addPoll(
    title: string,
    description: string,
    cover: string,
    options: Partial<CreatePollOptionDto[]>,
    expiredAt: string,
  ) {
    const pollEntity = await this.pollRepository.create({
      title,
      description,
      cover,
      expiredAt,
    });

    const optionEntities = await this.pollRepository.createOptions(
      options.map((option) => ({
        pollId: pollEntity.id,
        title: option.title,
        description: option.description,
        cover: option.cover,
      })),
    );

    const contract = await this.blockchainService.deployContract(
      'Poll',
      optionEntities.map((option) => option.id),
    );

    pollEntity.address = await contract.getAddress();
    await this.pollRepository.update(pollEntity.id, pollEntity);
  }

  /*
   * iteration by poll(contract), add verified users to the contract
   */
  @Interval(10000)
  async addVerifiedUsers() {
    const polls = await this.pollRepository.findAlivePolls();
    for (const poll of polls) {
      const users = await this.userRepository.findToBeParticipantsByPoll(
        poll.id,
      );

      // TODO: make sure the contract method executable
      this.txQueueService.queue(
        poll.address,
        'addVoters',
        users.map((user) => user.address),
      );

      // NOTE: bulk add voters have higher performance and lower cost
      // server side record for analysis
      const userPolls = users.map((user) => ({
        userId: user.id,
        pollId: poll.id,
      }));
      await this.userRepository.addVoters(userPolls);
    }
  }
}
