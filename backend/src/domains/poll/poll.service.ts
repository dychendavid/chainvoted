import { Injectable } from '@nestjs/common';
import { PollRepository } from './poll.repository';
import { BlockchainService } from '../blockchain/blockchain.service';
import { CreatePollOptionDto } from './poll.dto';
import { PollOptionRepository } from './poll-option/poll-option.repository';
import { VoteRepository } from './vote/vote.repository';
import { DataSource } from 'typeorm';

@Injectable()
export class PollService {
  constructor(
    private blockchainService: BlockchainService,
    private pollRepository: PollRepository,
    private pollOptionRepository: PollOptionRepository,
    private voteRepository: VoteRepository,
    private dataSource: DataSource,
  ) {}

  /*
   * create poll and options, and deploy contract by each poll
   */
  async addPoll(
    title: string,
    description: string,
    cover: string,
    options: Partial<CreatePollOptionDto[]>,
    expiredAt: string,
    isEnableDonations: boolean,
  ) {
    const pollEntity = this.pollRepository.create({
      title,
      description,
      cover,
      expiredAt,
      isEnableDonations,
    });
    await this.pollRepository.save(pollEntity);

    const optionEntities = this.pollOptionRepository.create(
      options.map((option) => ({
        pollId: pollEntity.id,
        title: option.title,
        description: option.description,
        cover: option.cover,
      })),
    );
    await this.pollOptionRepository.save(optionEntities);

    const contract = await this.blockchainService.deployContract('Poll', [
      optionEntities.length,
    ]);

    const address = await contract.getAddress();
    pollEntity.address = address;
    await this.pollRepository.update(pollEntity.id, pollEntity);
  }

  async vote(userId: number, pollId: number, optionIndex: number) {
    const poll = await this.pollRepository.getPollWithOptions(pollId);
    if (!poll) {
      throw new Error('Invalid poll id');
    }

    if (poll.expiredAt < new Date()) {
      throw new Error('Poll is expired');
    }

    const cnt = poll.options.length;
    if (optionIndex < 0 || optionIndex >= cnt) {
      throw new Error('Invalid option index');
    }

    const voted = await this.voteRepository.findOneBy({ userId, pollId });
    if (voted) {
      throw new Error('User already voted');
    }

    this.dataSource.transaction(async (manager) => {
      const optionId = poll.options[optionIndex].id;
      await manager.query(
        `UPDATE poll_options SET votes = votes + 1 WHERE id = $1`,
        [optionId],
      );
      await manager.query(`UPDATE polls SET votes = votes + 1 WHERE id = $1`, [
        pollId,
      ]);

      const vote = this.voteRepository.create({
        userId,
        pollId,
        optionIndex,
        optionId: poll.options[optionIndex].id,
      });
      await manager.save(vote);
    });
  }
}
