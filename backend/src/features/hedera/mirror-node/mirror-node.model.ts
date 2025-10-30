// Token Holder interface for mirror node response
export interface TokenHolder {
    account: string;
    balance: number;
    serialNumbers: number[];
}

// NFT interface for mirror node response
export interface NFT {
    account_id: string;
    created_timestamp: string;
    delegating_spender: string | null;
    deleted: boolean;
    metadata: string;
    modified_timestamp: string;
    serial_number: number;
    spender: string | null;
    token_id: string;
}

// Mirror Node API response interface for token holders (balances)
export interface MirrorNodeTokenHoldersResponse {
    timestamp: string;
    balances: Array<{
      account: string;
      balance: number;
      decimals: number;
    }>;
    links?: {
      next?: string;
    };
}

// Mirror Node API response interface for NFTs
export interface MirrorNodeNFTsResponse {
    nfts: NFT[];
    links?: {
      next?: string;
    };
}
  