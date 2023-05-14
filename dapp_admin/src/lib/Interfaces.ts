export interface WalletProvider {
  request: (payload: any) => Promise<any>;
  send: (payload: any, callback?: any) => Promise<any>;
  disconnect?: () => Promise<void>;
  on?: (type: string, callback: () => void) => void;
}

export type EthOrArb = "mainnet" | "arbitrum";
