import Web3 from "web3";
import { Contract } from "web3-eth-contract";
import config, { NetworkConfig } from "@/config";
import { WalletProvider } from "./Interfaces";
import chains from "./chains.json";
import controllersABI from "../../../artifacts/contracts/Controller.sol/Controller.json";
import MTokenABI from "../../../artifacts/contracts/MockToken.sol/MockToken.json";
import AddressRepABI from "../../../artifacts/contracts/AddressReputation.sol/AddressReputation.json";

export class Wallet {
  private web3?: Web3;
  private _provider?: WalletProvider;
  private _chainId?: number;
  private _networkName?: string;
  private _walletAddress?: string;
  private MTokenContract?: Contract;
  private AddressRepContract?: Contract;
  private ControllerContract?: Contract;
  private userState: any = {
    dailyLimit: 0,
    weeklyLimit: 0,
    monthlyLimit: 0,
    minReputation: 0,
    transferTXCooldown: 0,
  };
  constructor(provider?: WalletProvider, web3?: Web3) {
    this._provider = provider;
    this.web3 = web3;
  }

  static async init(provider: WalletProvider): Promise<Wallet> {
    const web3 = new Web3(provider as any);
    const wallet = new Wallet(provider, web3);
    await wallet.updateNetworkName();
    await wallet.updateAccount();
    await wallet.initContracts();
    await wallet.initState();

    return wallet;
  }

  /**
   * The following methods update properties and change the
   * state of the connection. Therefore, any call must be
   * followed by a refresh in Vue, since properties in
   * this class aren't reactive.
   */

  async disconnect(): Promise<void> {
    const provider = this._provider as any;
    if (provider !== undefined && provider.disconnect !== undefined) {
      provider.disconnect();
    }
  }

  reset(): void {
    this.web3 = undefined;
  }

  async updateNetworkName(): Promise<void> {
    if (this.web3 !== undefined) {
      this._chainId = await this.web3.eth.getChainId();
      const chainConfig = chains.find(
        (chain: any) => chain.chainId === this._chainId
      );
      this._networkName = chainConfig?.name;
      await this.initContracts();
    }
  }

  async updateAccount(): Promise<void> {
    if (this.web3 !== undefined) {
      const accounts = await this.web3.eth.getAccounts();
      if (accounts.length === 0) {
        this.reset();
      }
      this._walletAddress = accounts[0];
    }
  }

  /** --- **/
  async initState(): Promise<void> {
    // get states from controllerAddress
    this.ControllerContract?.methods.getUserTokenSettings(this._walletAddress, this.currentNetworkConfig?.mockToken).call().then((res: any) => {
      this.userState.dailyLimit = res[0];
      this.userState.weeklyLimit = res[1];
      this.userState.monthlyLimit = res[2];
      this.userState.minReputation = res[3];
      this.userState.transferTXCooldown = res[4];
      
    });



  }
  async initContracts(): Promise<void> {
    if (
      this.web3 !== undefined &&
      this.isNetworkSupported
    ) {
      
      const MockTokenAddress = this.currentNetworkConfig?.mockToken;
      const addressRepAddress = this.currentNetworkConfig?.addressReputation;
      const controllerAddress = this.currentNetworkConfig?.controller;

      this.MTokenContract = new this.web3.eth.Contract(
        MTokenABI.abi as any,
        MockTokenAddress
      );
      this.AddressRepContract = new this.web3.eth.Contract(
        AddressRepABI.abi as any,
        addressRepAddress
      );
      this.ControllerContract = new this.web3.eth.Contract(
        controllersABI.abi as any,
        controllerAddress
      );
    }
  }

  get isConnected(): boolean {
    return this.web3 !== undefined;
  }
  get userContractState(): any {
    return this.userState;
  }

  get isNetworkSupported(): boolean {
    //support mainnet
    return (
      this._chainId === undefined ||
      (config.mainnetNetworkConfig.chainId === this._chainId || config.localhostNetworkConfig.chainId === this._chainId)
    );
  }

  get mockTokenAddress(): string {
    return this.currentNetworkConfig?.mockToken ?? "";
  }

  get isOnMainnet(): boolean {
    return config.mainnetNetworkConfig.chainId === this._chainId;
  }

  get walletAddress(): string {
    return this._walletAddress ?? "";
  }

  get networkName(): string {
    return this._networkName ?? "";
  }

  get chainExplorerPrefix(): string {
    switch (this._chainId) {
      case 1:
        return "https://etherscan.io";
      case 42161:
        return "https://arbiscan.io";
      case 421611:
        return "https://testnet.arbiscan.io";
      default:
        return `https://${this.currentNetworkConfig?.shortname}.etherscan.io`;
    }
  }

  private get currentNetworkConfig(): NetworkConfig | undefined {
    if (this.isOnMainnet) {
      return config.mainnetNetworkConfig;
    } else {
      return config.localhostNetworkConfig;
    }
  }

  setBulk(_token: string, _dailyLimit: number, _weeklyLimit: number, _monthlyLimit: number, _minReputation: number, _transferTxCoolDown: number): Promise<void> {

    if (this.ControllerContract !== undefined) {
      return this.ControllerContract.methods
        .setBulk(
          _token,
          _dailyLimit,
          _weeklyLimit,
          _monthlyLimit,
          _minReputation,
          _transferTxCoolDown
        )
        .send({ from: this.walletAddress });
    } else {
      return Promise.reject("ControllerContract is undefined");
    }
  };

}
