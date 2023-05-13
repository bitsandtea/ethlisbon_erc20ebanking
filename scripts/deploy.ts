import { ethers } from "hardhat";

async function main() {
  const MockToken = await ethers.getContractFactory("MockToken");
  const mockToken = await MockToken.deploy();

  await mockToken.deployed();

  console.log("MockToken deployed to:", mockToken.address);

  const AddressReputation = await ethers.getContractFactory(
    "AddressReputation"
  );
  const addressReputation = await AddressReputation.deploy();

  await addressReputation.deployed();

  console.log("AddressReputation deployed to:", addressReputation.address);

  // Initialize the contract
  const ADMIN_ROLE = ethers.utils.id("ADMIN");
  const [admin, user] = await ethers.getSigners();

  const addressToInitialize = mockToken.address;
  const reputationValue = 50;

  const addressReputationWithSigner = AddressReputation.attach(
    addressReputation.address
  ).connect(admin);
  await addressReputationWithSigner.grantRole(ADMIN_ROLE, admin.address);
  await addressReputationWithSigner.setReputation(
    addressToInitialize,
    reputationValue
  );

  console.log("Initialization complete");

  // Create a transaction to execute the MockToken contract's transfer function
  const to = "0xdafea492d9c6733ae3d56b7ed1adb60692c98bc5";
  const amount = 100;

  // Get the sender's balance before executing the transfer
  const senderBalanceBefore = await mockToken.balanceOf(admin.address);

  const transferTx = await mockToken.transfer(to, amount);
  await transferTx.wait();

  console.log("Transfer executed");

  // Get the sender's balance after executing the transfer
  const senderBalanceAfter = await mockToken.balanceOf(admin.address);

  console.log("Sender's balance before:", senderBalanceBefore.toString());
  console.log("Sender's balance after :", senderBalanceAfter.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
