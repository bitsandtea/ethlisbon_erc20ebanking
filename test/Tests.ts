import { ethers } from "hardhat";
import { expect } from "chai";
import { BigNumber } from "ethers";

describe("MockToken", function () {
  let MockToken: any;
  let mockToken: any;
  let AddressReputation: any;
  let addressReputation: any;
  let Controller: any;
  let controller: any;
  let deployer: any;
  let user: any;

  beforeEach(async function () {
    [deployer, user] = await ethers.getSigners();

    AddressReputation = await ethers.getContractFactory("AddressReputation");
    addressReputation = await AddressReputation.deploy();

    Controller = await ethers.getContractFactory("Controller");

    const minReputation = 70; // Minimum required reputation is 70
    const transferTXCooldown = 20 * 60; // 20 minutes in seconds
    const dailyLimit = 1000;
    const weeklyLimit = 10000;
    const monthlyLimit = 100000;

    controller = await Controller.deploy(
      addressReputation.address,
      minReputation,
      transferTXCooldown,
      dailyLimit,
      weeklyLimit,
      monthlyLimit
    );

    MockToken = await ethers.getContractFactory("MockToken");
    mockToken = await MockToken.deploy(controller.address);

  });

  it("should revert when executing with insufficient reputation", async function () {
    const to = user.address;
    const amount = 1;

    // Prepare the data to pass to the execute function
    const token = mockToken.address;

    const encodedData = ethers.utils.defaultAbiCoder.encode(
      ["address", "address", "uint256"],
      [token, to, amount]
    );
    await addressReputation.setReputation(deployer.address, 50);
    // Set the reputation of the MockToken address to 60
    await controller.setMinReputation(60);

    // Ensure that executing the transfer function reverts with insufficient reputation
    await expect(controller.connect(deployer).execute(encodedData)).to.be.revertedWith(
      "Insufficient reputation"
    );
  });
});
