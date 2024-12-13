import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { PollService } from './poll.service';
import { PollRepository } from './poll.repository';
import { CreatePollOptionDto } from './poll.dto';
import { BlockchainService } from '../blockchain/blockchain.service';

@Controller('poll')
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
  ): Promise<ApiResponse> {
    try {
      await this.pollService.addPoll(
        title,
        description,
        cover,
        options,
        expiredAt,
      );

      await this.pollService.addVerifiedUsers();

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
