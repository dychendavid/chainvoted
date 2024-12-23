import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PollService } from './poll.service';
import { PollRepository } from './poll.repository';
import { CreatePollOptionDto } from './poll.dto';
import { BlockchainService } from '../blockchain/blockchain.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { GetUser } from '../user/user.decorator';

@Controller('api/poll')
export class PollController {
  constructor(
    private readonly pollService: PollService,
    private pollRepository: PollRepository,
    private blockchainService: BlockchainService,
  ) {}

  @Get()
  async getPolls() {
    return await this.pollRepository.findAllDesc();
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
  ): Promise<ApiResponse> {
    try {
      await this.pollService.addPoll(
        title,
        description,
        cover,
        options,
        expiredAt,
        isEnableDonations,
      );
      // await this.pollService.addVerifiedUsers();

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

  @Post('vote')
  @UseGuards(JwtAuthGuard)
  async vote(
    @GetUser('id') userId,
    @Body('poll_id') pollId: number,
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
