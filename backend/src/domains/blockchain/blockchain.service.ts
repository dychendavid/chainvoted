import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Contract, ContractFactory, ethers } from 'ethers';
import * as fs from 'fs';
import { NonceType } from './nonce.service';

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
    // TODO should be configureable
    this.localProvider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
  }

  getProvider() {
    return this.localProvider;
  }

  async getNonce(walletAddress: string, nonceType: NonceType) {
    return await this.getProvider().getTransactionCount(
      walletAddress,
      nonceType,
    );
  }

  async getArtifact(contractName: string): Promise<ContractArtifact> {
    try {
      // TODO should change path management
      const artifactPath = `${process.cwd()}/../hardhat/artifacts/contracts/${contractName}.sol/${contractName}.json`;
      const data = await fs.promises.readFile(artifactPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      throw new Error(`Failed to load artifact: ${error.message}`);
    }
  }

  async deployContract(contractName: string, constructorArgs: any[] = []) {
    const artifact = await this.getArtifact(contractName);
    const privateKey = this.configService.get<string>('PRIVATE_KEY');
    const wallet = new ethers.Wallet(privateKey, this.getProvider());

    const factory = new ethers.ContractFactory(
      artifact.abi,
      artifact.bytecode,
      wallet,
    );

    const contract = await factory.deploy(constructorArgs);
    await contract.waitForDeployment();

    return contract;
  }

  async getContract(address: string) {
    const artifact = await this.getArtifact('Poll');
    const privateKey = this.configService.get<string>('PRIVATE_KEY');
    const wallet = new ethers.Wallet(privateKey, this.getProvider());
    const contract = new ethers.Contract(address, artifact.abi, wallet);
    return contract;
  }

  async getWalletAddress() {
    const privateKey = this.configService.get<string>('PRIVATE_KEY');
    const wallet = new ethers.Wallet(privateKey, this.getProvider());
    return wallet.getAddress();
  }
}
