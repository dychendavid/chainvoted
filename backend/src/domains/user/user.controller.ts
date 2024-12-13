import {
  Body,
  Controller,
  ExceptionFilter,
  Get,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { BlockchainService } from '../blockchain/blockchain.service';

@Controller('test')
export class UserController {
  constructor(private blockchainService: BlockchainService) {}

  @Get('addToVoter')
  async addToVoter(
    @Body('contract_address') address: string,
    @Body('user_address') userAddress: string,
  ) {
    const contract = await this.blockchainService.getContract(address);

    await contract.addVoters([userAddress]);
    console.log(await contract.getVoters());

    return {
      status: HttpStatus.OK,
      data: contract,
    };
  }
}
