export interface NetworkConfig {
  shortname: string;
  chainId: number;
  mockToken: string;
  addressReputation: string;
  controller: string;

}

interface Config {
  mainnetNetworkConfig: NetworkConfig;
  localhostNetworkConfig: NetworkConfig;
}

const config: Config = {
  mainnetNetworkConfig: {
    shortname: "goerli",
    chainId: 5,
    mockToken: "0xB8EA28EadbC99DCcC106A8D7B1Fbe72a2E34832F",
    addressReputation: "0x84ac321fd96390b81E710378939d1b1ccA84cA45",
    controller: "0x6ec3A41309976e9b292a8B74Ad6177F3eEF032C6",
  },
  localhostNetworkConfig: {
    shortname: "localhost",
    chainId: 31337,
    mockToken: "0xf8c0Af1322b867AB52a5a946F03e44e8a33664cc",
    addressReputation: "0x6208812E8E3923BB3fEFC6795FD480C75dD9aafE",
    controller: "0xfB325400ac54f2241047e0f7153797C904aaF576",
  },
};

export default config;
