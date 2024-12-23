import { Module } from '@nestjs/common';
import { BlockchainService } from '../blockchain/blockchain.service';

@Module({
  imports: [],
  controllers: [],
  providers: [BlockchainService],
})
export class BlockchainModule {}
