import { ethers } from "hardhat";

async function main() {
  const MockToken = await ethers.getContractFactory("MockToken");
  const [deployer] = await ethers.getSigners();
  const mockToken = await MockToken.deploy(deployer.address);

  await mockToken.deployed();

  console.log("MockToken deployed to        :", mockToken.address);
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
  const reputationValue = 70;

  const addressReputationWithSigner = AddressReputation.attach(
    addressReputation.address
  ).connect(admin);
  await addressReputationWithSigner.setReputation(
    addressToInitialize,
    reputationValue
  );
  
  const ControllerArt = await ethers.getContractFactory("Controller");
  const controllerD = await ControllerArt.deploy(addressReputation.address, 55, 60);

  const controller = await controllerD.deployed();

  console.log("Controller deployed at       :", controller.address);
  console.log("Initialization complete");


}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
