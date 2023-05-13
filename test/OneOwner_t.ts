import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";
import {
  SimpleAccountAPI,
  wrapProvider,
  HttpRpcClient,
} from "@account-abstraction/sdk";


import { ERC20_ABI } from "./abi/erc20abi";
import { entryPointABI } from "./abi/entryPointABI";
// @ts-ignore
import config from "../config.json";
import { UserOperation } from "./types/UserOperation";

let accounts: Signer[];
let controller: Contract;
let MToken: Contract;
let paymaster: Contract;
let deployer: Signer;
let nonOwner: Signer;
const entryPointGoerli = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
const factoryAddressGoerli = "0x6C583EE7f3a80cB53dDc4789B0Af1aaFf90e55F3";
describe("Controlled account", function () {

  before(async function () {
    accounts = await ethers.getSigners();
    deployer = accounts[0]
    nonOwner = accounts[1]
    console.log(`Deploying contracts with account: ${deployer.address}`);

    // Deploy AddressReputation
    const AddressReputation = await ethers.getContractFactory(
      "AddressReputation"
    );
    // const addressReputation = await AddressReputation.deploy();
    const addressReputation = AddressReputation.attach(
      "0xa35b0b5c9F171DAE8bC855f0301581F7C5126431"
    );
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

    //  controller = await Controller.deploy(
    //   addressReputation.address,
    //   minReputation,
    //   transferTXCooldown,
    //   dailyLimit,
    //   weeklyLimit,
    //   monthlyLimit
    // );
    // await controller.deployed();
    controller = Controller.attach(
      "0x94135720Dbd6Da777B18F0F3C49D019251b3114a"
    );
    console.log(`Controller address              : ${controller.address}`);
    // Deploy MockToken
    const MockToken = await ethers.getContractFactory("MockToken");
    // const mockToken = await MockToken.deploy(deployer.address);
    const mockToken = MockToken.attach(
      "0x4F37756a0Af3b0B9f1a47f7781B39c79A2E713A7"
    );
    MToken = await mockToken.deployed();
    console.log(`MockToken address               : ${mockToken.address}`);
    //get balance and print it
    const balance = await MToken.balanceOf(deployer.address);
    //make balance with decimal points
    const balanceWithDecimals = ethers.utils.formatUnits(balance, 18);
    console.log(`MockToken balance               : ${balanceWithDecimals}`);

    // Deploy controlledAccount with deployers contract address as parameter
    const ControlledAccountArtifact = await ethers.getContractFactory("ControlledAccount");

    // const controlledAccount = await ControlledAccountArtifact.deploy(
    //   entryPointGoerli,
    //   controller.address,
    // );
    const controlledAccount = ControlledAccountArtifact.attach("0xD3606605aDe3880786c23eF77dEe3344d4401C78");
    controller = await controlledAccount.deployed();
    console.log(`controlledAccount address        : ${controlledAccount.address}`);
    
  });

  describe("deploys a paymaster, adds token and initiates it with ether and tokens", function () {
    it("should deploy a paymaster and initiate it with funds", async function () {
        const paymasterArt = await ethers.getContractFactory(
          "AcceptEverythingPM"
        );
        const initEther = "0.01";
        // paymaster = await paymasterArt.deploy(config.entryPoint, {
        //      value: ethers.utils.parseEther(initEther),
        // });
        // await paymaster.deployed();
        paymaster = paymasterArt.attach(
          "0xd88b0574802cC2c162AD5D68f6D099385D61bdD5"
        );

        console.log(`Paymaster address               : ${paymaster.address}`);

        const paymasterBalance = await paymaster.getDeposit();
        const paymasterBalanceWithDecimals = ethers.utils.formatUnits(
            paymasterBalance,
            18
            );
        console.log(`Paymaster balance               : ${paymasterBalanceWithDecimals}`);

        //check if paymaster has the right amount of ether
        expect(paymasterBalanceWithDecimals).to.equal("0.01");
        
    });
  });
  describe("does a transaction of tokens and then checks balances if they have changed accordingly", function () {
    it("should create the userOps to transfer tokens from controlledAccount to another address", async function () {
      //use this account as wallet-owner (which will be used to sign the requests)
      const config = {
        chainId: await ethers.provider.getNetwork().then((net) => net.chainId),
        entryPointAddress: entryPointGoerli,
        bundlerUrl: "http://127.0.0.1:8545/rpc",
      };
      const aaProvider = await wrapProvider(ethers.provider, config, deployer);
      const sAccount = {
        provider: aaProvider,
        entryPointAddress: entryPointGoerli,
        owner: deployer,
        factoryAddress: factoryAddressGoerli,
      };
      const walletAPI = await new SimpleAccountAPI(sAccount);

      const iface = new ethers.utils.Interface(ERC20_ABI);
      const amount = ethers.utils.parseEther("1");
      const encodedData = iface.encodeFunctionData("transfer", [
        nonOwner.address,
        amount,
      ]);

      // let finalSingedUserOp: UserOperation;
      // finalSingedUserOp = {
      //   sender: "0x0",
      //   nonce: 0,
      //   initCode: "0x",
      //   callData: "0x",
      //   callGasLimit: 0,
      //   verificationGasLimit: 150000, // default verification gas. will add create2 cost (3200+200*length) if initCode exists
      //   preVerificationGas: 21000, // should also cover calldata cost.
      //   maxFeePerGas: 0,
      //   maxPriorityFeePerGas: 1e9,
      //   paymasterAndData: "0x",
      //   signature: "0x",
      // };
      // console.log("Creating signed user op", finalSingedUserOp);


      let singedUserOp = await walletAPI.createSignedUserOp({
        target: nonOwner.address,
        value: 0,
        data: encodedData,
        maxPriorityFeePerGas: 0x2540be400, // 15gwei
        maxFeePerGas: 0x6fc23ac00, // 30gewi
      });
      // const userOpHash = await walletAPI.getUserOpHash(singedUserOp);

      //initiate EntryPoint contract at entryPointGoerli
      const entryPoint = new ethers.Contract(
        entryPointGoerli,
        entryPointABI,
        deployer
      );
      // //send the op to the entry point
      const chainID = await ethers.provider.getNetwork().then((net) => net.chainId);

      const client = new HttpRpcClient(
        "https://api.blocknative.com/v1/goerli/bundler",
        entryPointGoerli,
        chainID,
      );
      singedUserOp.sender = await singedUserOp.sender;
      singedUserOp.nonce = await singedUserOp.nonce;
      singedUserOp.preVerificationGas = await singedUserOp.preVerificationGas;
      singedUserOp.signature = await singedUserOp.signature;
      // finalSingedUserOp = SingedUserOp;

      // // signed
      // console.log(singedUserOp); 
      const sent = await entryPoint
        .connect(deployer)
        .handleOps([singedUserOp], deployer.address);
      // const sent = await client.sendUserOpToBundler(singedUserOp);
      console.log("sent", sent);

      //// "https://node.stackup.sh/v1/rpc/fa76279a35fc476de50d511035a190dbe3e082421f420c520c59fb390e8bb11d",
      // entryPointGoerli,
      // Number(ChainId.mumbai)

      // const uoHash = await client.sendUserOpToBundler();

      // // const sent = await entryPoint.handleOps([op], deployer.address);

      //   // const wallet1 = ethers.Wallet.from;
      //   const sig = ecsign(
      //     keccak256_buffer(msg1),
      //     Buffer.from(ethers.utils.arrayify(signer.privateKey))
      //   );
      //   // that's equivalent of:  await signer.signMessage(message);
      //   // (but without "async"
      //   const signedMessage1 = toRpcSig(sig.v, sig.r, sig.s);
      //   console.log(signedMessage1)
      //   return {
      //     ...op,
      //     signature: signedMessage1,
      //   };
      // }

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
