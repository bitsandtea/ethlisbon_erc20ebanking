import fs from "fs/promises";
import path from "path";
import prettier from "prettier";
import { ethers } from "ethers";
import "dotenv/config"
const INIT_CONFIG = {
  rpcUrl: "https://goerli.infura.io/v3/" + process.env.infura_eth_key,
  signingKey: new ethers.Wallet(ethers.utils.randomBytes(32)).privateKey,
  entryPoint: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
  simpleAccountFactory: "0x9406Cc6185a346906296840746125a0E44976454",
  paymaster: {
    rpcUrl: "https://api.stackup.sh/v1/paymaster/" + process.env.stackup_api,
    // rpcUrl: "https://goerli.infura.io/v3/" + process.env.infura_eth_key,
    context: { type: "payg" },
  },
};
const CONFIG_PATH = path.resolve(__dirname, "../config.json");

async function main() {
  return fs.writeFile(
    CONFIG_PATH,
    prettier.format(JSON.stringify(INIT_CONFIG, null, 2), { parser: "json" })
  );
}

main()
  .then(() => console.log(`Config written to ${CONFIG_PATH}`))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
