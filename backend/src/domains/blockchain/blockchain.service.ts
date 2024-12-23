import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ethers } from 'ethers';
import * as fs from 'fs';

interface ContractArtifact {
  _format: string;
  contractName: string;
  sourceName: string;
  abi: any[];
  bytecode: string;
  deployedBytecode: string;
  linkReferences: any;
  deployedLinkReferences: any;
}

@Injectable()
export class BlockchainService {
  private localProvider: ethers.JsonRpcProvider;

  constructor(private configService: ConfigService) {
    this.localProvider = new ethers.JsonRpcProvider(
      this.configService.get<string>('JSON_RPC_URL'),
    );
  }

  getProvider() {
    return this.localProvider;
  }

  async getArtifact(contractName: string): Promise<ContractArtifact> {
    try {
      // NOTE possible to use tsconfig path alias
      const artifactPath = `${process.cwd()}/../shared/artifacts/contracts/${contractName}.sol/${contractName}.json`;
      const data = await fs.promises.readFile(artifactPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      throw new Error(`Failed to load artifact: ${error.message}`);
    }
  }

  async deployContract(contractName: string, constructorArgs: any[] = []) {
    const artifact = await this.getArtifact(contractName);
    const privateKey = this.configService.get<string>('WALLET_PRIVATE_KEY');
    const wallet = new ethers.Wallet(privateKey, this.getProvider());

    const factory = new ethers.ContractFactory(
      artifact.abi,
      artifact.bytecode,
      wallet,
    );

    const contract = await factory.deploy(...constructorArgs);
    await contract.waitForDeployment();

    return contract;
  }

  async getContract(address: string) {
    const artifact = await this.getArtifact('Poll');
    const privateKey = this.configService.get<string>('WALLET_PRIVATE_KEY');
    const wallet = new ethers.Wallet(privateKey, this.getProvider());
    const contract = new ethers.Contract(address, artifact.abi, wallet);
    return contract;
  }

  async getWalletAddress() {
    const privateKey = this.configService.get<string>('WALLET_PRIVATE_KEY');
    const wallet = new ethers.Wallet(privateKey, this.getProvider());
    return wallet.getAddress();
  }
}
