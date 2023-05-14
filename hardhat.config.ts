import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {
    hardhat: {
      // forking: {
      //   url: "https://goerli.infura.io/v3/" + process.env.infura_eth_key,
      // },
    },
    forkedgoerli:{
      url: "http://127.0.0.1:8545/",
      accounts: [process.env.local_pkey as string, process.env.local_pkey2 as string],
    },
    goerli:{
      url: "https://goerli.infura.io/v3/" + process.env.infura_eth_key,
      accounts: [process.env.local_goerli_pkey as string, process.env.local_goerli_pkey2 as string],

    }


    },
  };


export default config;
