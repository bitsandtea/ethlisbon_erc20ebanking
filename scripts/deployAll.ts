// scripts/deploy.ts

import { ethers } from "hardhat";

async function main() {
  // Fetch signer information
  const [deployer] = await ethers.getSigners();

  console.log(`Deploying contracts with account: ${deployer.address}`);
  
  // Deploy AddressReputation
  const AddressReputation = await ethers.getContractFactory(
    "AddressReputation"
  );
  const addressReputation = await AddressReputation.deploy();
  await addressReputation.deployed();
  console.log(`AddressReputation address       : ${addressReputation.address}`);

  // Deploy Controller with AddressReputation contract address as parameter
  const Controller = await ethers.getContractFactory("Controller");
  const minReputation = 70; // Minimum required reputation is 70
  const transferTXCooldown = 20 * 60; // 20 minutes in seconds
  const dailyLimit = 1000;
  const weeklyLimit = 10000;
  const monthlyLimit = 100000;

  // address _reputationContractAddress, uint _minReputation, uint _transferTXCooldown, uint _dailyLimit, uint _weeklyLimit, uint _monthlyLimit

  const controller = await Controller.deploy(
    addressReputation.address, minReputation, transferTXCooldown, dailyLimit, weeklyLimit, monthlyLimit
  );
  await controller.deployed();
  console.log(`Controller address              : ${controller.address}`);
  // Deploy MockToken
  const MockToken = await ethers.getContractFactory("MockToken");
  const mockToken = await MockToken.deploy(controller.address);
  await mockToken.deployed();
  console.log(`MockToken address               : ${mockToken.address}`);

  // Deploy OneOwnerAccount with deployers contract address as parameter
  const OneOwnerAccount = await ethers.getContractFactory("OneOwnerAccount");

  const oneEntryPointGoerli = "0x9d98Bc2609b080a12aFd52477514DB95d668be3b";
  const oneOwnerAccount = await OneOwnerAccount.deploy(
    oneEntryPointGoerli, deployer.address
  );
  await oneOwnerAccount.deployed();
  console.log(`OneOwnerAccount address         : ${oneOwnerAccount.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
