import { Contract, ContractFactory } from "ethers";
import { ethers } from "hardhat";

export async function deployContract<T extends Contract>(
  contractName: string,
  args: any[] = []
): Promise<T> {
  const Factory: ContractFactory = await ethers.getContractFactory(
    contractName
  );
  const contract = await Factory.deploy(...args);

  await contract.waitForDeployment();

  return contract as T;
}

export async function verifyContract(
  address: string,
  constructorArguments: any[] = []
) {
  const { run } = require("hardhat");

  try {
    await run("verify:verify", {
      address,
      constructorArguments,
    });
    console.log("Contract verified successfully");
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log("Contract already verified");
    } else {
      console.error("Error verifying contract:", error);
      throw error;
    }
  }
}

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
