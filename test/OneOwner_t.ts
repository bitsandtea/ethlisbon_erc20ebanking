import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";

import { ERC20_ABI } from "./abi/erc20abi";
// @ts-ignore
import config from "../config.json";
import { Client, Presets } from "userop";

export interface CLIOpts {
  dryRun: boolean;
  withPM: boolean;
}
describe("Controlled account", function () {
  let accounts: Signer[];
  let oneOwnerCon: Contract;
  let controller: Contract;
  let MToken: Contract;
  let paymaster: Contract;
  let deployer: Signer;
  let nonOwner: Signer;


  before(async function () {
    accounts = await ethers.getSigners();
    deployer = accounts[0]
    nonOwner = accounts[1]
    console.log(`Deploying contracts with account: ${deployer.address}`);

    // Deploy AddressReputation
    const AddressReputation = await ethers.getContractFactory(
      "AddressReputation"
    );
    const addressReputation = await AddressReputation.deploy();
    await addressReputation.deployed();
    console.log(
      `AddressReputation address       : ${addressReputation.address}`
    );

    // Deploy Controller with AddressReputation contract address as parameter
    const Controller = await ethers.getContractFactory("Controller");
    const minReputation = 70; // Minimum required reputation is 70
    const transferTXCooldown = 20 * 60; // 20 minutes in seconds
    const dailyLimit = 1000;
    const weeklyLimit = 10000;
    const monthlyLimit = 100000;

    // address _reputationContractAddress, uint _minReputation, uint _transferTXCooldown, uint _dailyLimit, uint _weeklyLimit, uint _monthlyLimit

     controller = await Controller.deploy(
      addressReputation.address,
      minReputation,
      transferTXCooldown,
      dailyLimit,
      weeklyLimit,
      monthlyLimit
    );
    await controller.deployed();
    console.log(`Controller address              : ${controller.address}`);
    // Deploy MockToken
    const MockToken = await ethers.getContractFactory("MockToken");
    const mockToken = await MockToken.deploy(deployer.address);
    MToken = await mockToken.deployed();
    console.log(`MockToken address               : ${mockToken.address}`);
    //get balance and print it
    const balance = await MToken.balanceOf(deployer.address);
    //make balance with decimal points
    const balanceWithDecimals = ethers.utils.formatUnits(balance, 18);
    console.log(`MockToken balance               : ${balanceWithDecimals}`);

    // Deploy controlledAccount with deployers contract address as parameter
    const ControlledAccountArtifact = await ethers.getContractFactory("ControlledAccount");

    const oneEntryPointGoerli = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
    const controlledAccount = await ControlledAccountArtifact.deploy(
      oneEntryPointGoerli,
      controller.address,
    );
    oneOwnerCon = await controlledAccount.deployed();
    console.log(`controlledAccount address         : ${controlledAccount.address}`);
    
  });

  describe("deploys a paymaster, adds token and initiates it with ether and tokens", function () {
    it("should deploy a paymaster and initiate it with funds", async function () {
        const paymasterArt = await ethers.getContractFactory("DepositPaymaster");
        paymaster = await paymasterArt.deploy(config.entryPoint);
        await paymaster.deployed();

        console.log(`Paymaster address               : ${paymaster.address}`);
        // no stake only deposit 
        await paymaster.addStake(1, { value: ethers.utils.parseEther("2") });
        await MToken.approve(paymaster.address, ethers.constants.MaxUint256);

        const testOracle = await ethers.getContractFactory("TestOracle")
        const oracle = await testOracle.deploy();

        await paymaster.addToken(MToken.address, oracle.address);

        await paymaster.addDepositFor(MToken.address, deployer.address, 100);
        const depositInfo = await paymaster.depositInfo(
          MToken.address,
          deployer.address
        );
        expect(
        depositInfo.amount.toString()
        ).to.eql("100");
    });
  });
  describe("does a transaction of tokens and then checks balances if they have changed accordingly", function () {
    it("should transfer tokens from controlledAccount to another address", async function () {
    //   const paymaster = Presets.Middleware.verifyingPaymaster(
    //     config.paymaster.rpcUrl,
    //     config.paymaster.context
    //   );
    //   const simpleAccount = await Presets.Builder.SimpleAccount.init(
    //     new ethers.Wallet(config.signingKey),
    //     config.rpcUrl,
    //     config.entryPoint,
    //     config.simpleAccountFactory,
    //     paymaster
    //   );
    //   const client = await Client.init(config.rpcUrl, config.entryPoint);
    //   const dryRun = true;

    //TODO: 1. generate the user OP and 
    // 2. then send it to the entry point

    //   const [symbol, decimals] = await Promise.all([
    //     MToken.symbol(),
    //     MToken.decimals(),
    //   ]);
    //   const amount = ethers.utils.parseUnits("11", decimals);
    //   console.log(`Transferring ${amount} ${symbol}...`);
    // // entry point the userOperation

    //   const res = await oneOwnerCon.sendUserOperation(
        // entryPoint.execute(
        //   MToken.address,
        //   0,
        //   MToken.interface.encodeFunctionData("transfer", [nonOwner.address, amount])
        // ),
        // {
        //   dryRun: dryRun,
        //   onBuild: (op) => console.log("Signed UserOperation:", op),
        // }
    //   );
//       console.log(`UserOpHash: ${res.userOpHash}`);

//       console.log("Waiting for transaction...");
//       const ev = await res.wait();
//       console.log(`Transaction hash: ${ev?.transactionHash ?? null}`);
    });
  });

  // Add more test cases for your contract methods
});
