import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PollService } from './poll.service';
import { PollRepository } from './poll.repository';
import { CreatePollOptionDto } from './poll.dto';
import { BlockchainService } from '../blockchain/blockchain.service';
import { FlexibleJwtAuthGuard, JwtAuthGuard } from '../auth/auth.guard';
import { GetUser } from '../user/user.decorator';
import { VoteRepository } from './vote/vote.repository';
import { ApiResponse } from '@/types/types';

@Controller('api/poll')
export class PollController {
  constructor(
    private readonly pollService: PollService,
    private pollRepository: PollRepository,
    private blockchainService: BlockchainService,
    private voteRepository: VoteRepository,
  ) {}

  @Get()
  async getPolls() {
    return await this.pollRepository.findAllFilteredAndDesc();
  }

  @Get(':id')
  @UseGuards(FlexibleJwtAuthGuard)
  async getPoll(@GetUser('id') userId, @Param('id') pollId: number) {
    const poll = await this.pollRepository.getPollWithOptions(pollId);
    let isVoted = false;
    if (userId) {
      const record = await this.voteRepository.findOneBy({
        pollId,
        userId,
      });
      isVoted = !!record;
    }

    return {
      ...poll,
      isVoted,
    };
  }

  @Post()
  async addPoll(
    @Body('title') title: string,
    @Body('description') description: string,
    @Body('cover') cover: string,
    @Body('expired_at') expiredAt: string,
    @Body('options') options: CreatePollOptionDto[],
    @Body('is_enable_donations', {
      transform: (value) => (value === '1' || value == 'true' ? true : false),
    })
    isEnableDonations: boolean,
  ): Promise<ApiResponse<null>> {
    try {
      await this.pollService.addPoll(
        title,
        description,
        cover,
        options,
        expiredAt,
        isEnableDonations,
      );

      return {
        status: HttpStatus.OK,
        message: 'Poll created successfully',
      };
    } catch (e) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: e.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('vote/:id')
  @UseGuards(JwtAuthGuard)
  async vote(
    @GetUser('id') userId,
    @Param('id') pollId: number,
    @Body('option_index') optionIndex: number,
  ) {
    try {
      await this.pollService.vote(userId, pollId, optionIndex);
      return {
        status: HttpStatus.OK,
        message: 'Vote submitted successfully',
      };
    } catch (e) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: e.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('test/addVoter')
  async addToVoter(
    @Body('contract_address') address: string,
    @Body('user_address') userAddress: string,
  ) {
    const contract = await this.blockchainService.getContract(address);
    await contract.addVoters([userAddress], { nonce: 0 });

    return {
      status: HttpStatus.OK,
      data: contract,
    };
  }

  @Post('test/closePoll')
  async closePoll(@Body('contract_address') address: string) {
    const contract = await this.blockchainService.getContract(address);
    await contract.closePoll();
    return {
      status: HttpStatus.OK,
      data: contract,
    };
  }
}
