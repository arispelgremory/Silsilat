import { MirrorNodeTokenHoldersResponse, MirrorNodeNFTsResponse, TokenHolder, NFT } from './mirror-node.model.js';

export class MirrorNodeService {
  private baseUrl: string;

  constructor() {
    // Use testnet mirror node by default, can be configured via environment
    this.baseUrl = process.env.HEDERA_MIRROR_NODE_URL || 'https://testnet.mirrornode.hedera.com/api/v1';
  }

  /**
   * Get all token holders for a specific token ID from Hedera mirror node using NFTs endpoint
   */
  async getTokenHolders(tokenId: string): Promise<TokenHolder[]> {
    try {
      const allHolders: TokenHolder[] = [];
      let nextUrl: string | null = `${this.baseUrl}/tokens/${tokenId}/nfts`;

      while (nextUrl) {
        console.log(`Fetching token holders from: ${nextUrl}`);
        const response = await fetch(nextUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Mirror node API error: ${response.status} ${response.statusText}`);
        }

        const data: MirrorNodeNFTsResponse = await response.json();
        
        // Process the response and convert to our TokenHolder format
        if (data.nfts && data.nfts.length > 0) {
          console.log(`Mirror Node: Processing ${data.nfts.length} NFT entries`);
          
          // Group NFTs by account to calculate balances and collect serial numbers
          const accountMap = new Map<string, { balance: number; serialNumbers: number[] }>();
          
          for (const nft of data.nfts) {
            if (!nft.deleted) { // Only include non-deleted NFTs
              const account = nft.account_id;
              const serialNumber = nft.serial_number;
              
              if (!accountMap.has(account)) {
                accountMap.set(account, { balance: 0, serialNumbers: [] });
              }
              
              const holder = accountMap.get(account)!;
              holder.balance += 1; // Each NFT counts as 1 balance
              holder.serialNumbers.push(serialNumber);
              
              console.log(`Account ${account}: NFT serial ${serialNumber}`);
            }
          }
          
          // Convert map to TokenHolder array
          for (const [account, data] of accountMap) {
            allHolders.push({
              account,
              balance: data.balance,
              serialNumbers: data.serialNumbers.sort((a, b) => a - b) // Sort serial numbers
            });
            console.log(`Added holder: ${account} with balance ${data.balance} and ${data.serialNumbers.length} NFTs`);
          }
        } else {
          console.log("No NFTs found in response");
        }

        // Check if there's a next page
        if (data.links?.next) {
          // Convert relative URL to absolute URL
          if (data.links.next.startsWith('http')) {
            nextUrl = data.links.next;
          } else {
            // Remove /api/v1 from baseUrl if the relative URL already contains it
            const baseUrlWithoutApi = this.baseUrl.replace('/api/v1', '');
            nextUrl = `${baseUrlWithoutApi}${data.links.next}`;
          }
        } else {
          nextUrl = null;
        }
      }

      console.log(`Found ${allHolders.length} token holders for token ${tokenId}`);
      return allHolders;
    } catch (error) {
      console.error('Error fetching token holders from mirror node:', error);
      throw new Error(`Failed to fetch token holders: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get NFTs for a specific token ID for specfic serial number from Hedera mirror node
   */
  async getTokenNFTs(
    tokenId: string, 
    accountId?: string,
    limit?: number,
    order?: 'asc' | 'desc',
    serialNumber?: number
  ): Promise<{
    nfts: NFT[];
    hasNext: boolean;
    nextUrl?: string;
  }> {
    try {
      const params = new URLSearchParams();
      
      if (limit !== undefined) {
        params.append('limit', limit.toString());
      }
      if (order !== undefined) {
        params.append('order', order);
      }
      if (accountId !== undefined) {
        params.append('account.id', accountId);
      }
      if (serialNumber !== undefined) {
        params.append('serialnumber', serialNumber.toString());
      }
      
      const queryString = params.toString();
      const url = `${this.baseUrl}/tokens/${tokenId}/nfts${queryString ? `?${queryString}` : ''}`;
      console.log('url', url);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Mirror node API error: ${response.status} ${response.statusText}`);
      }

      const data: MirrorNodeNFTsResponse = await response.json();
      
      return {
        nfts: data.nfts || [],
        hasNext: !!data.links?.next,
        nextUrl: data.links?.next
      };
    } catch (error) {
      console.error('Error fetching token NFTs:', error);
      throw new Error(`Failed to fetch token NFTs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

   /**
   * Get ALL NFTs for a specific token ID from Hedera mirror node (with pagination)
   */
   async getAccountTokenNFTsAmount(
    tokenId: string, 
    accountId?: string,
  ): Promise<{
    nfts: NFT[];
    hasNext: boolean;
    nextUrl?: string;
  }> {
    try {
      const allNFTs: NFT[] = [];
      let nextUrl: string | null = `${this.baseUrl}/accounts/${accountId}/nfts?token.id=${tokenId}&limit=1000`;

      while (nextUrl) {
        console.log(`Fetching NFTs from: ${nextUrl}`);
        const response = await fetch(nextUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Mirror node API error: ${response.status} ${response.statusText}`);
        }

        const data: MirrorNodeNFTsResponse = await response.json();
        
        if (data.nfts && data.nfts.length > 0) {
          console.log(`Found ${data.nfts.length} NFTs in this batch`);
          allNFTs.push(...data.nfts);
        }

        // Check if there's a next page
        if (data.links?.next) {
          // Convert relative URL to absolute URL
          if (data.links.next.startsWith('http')) {
            nextUrl = data.links.next;
          } else {
            // Remove /api/v1 from baseUrl if the relative URL already contains it
            const baseUrlWithoutApi = this.baseUrl.replace('/api/v1', '');
            nextUrl = `${baseUrlWithoutApi}${data.links.next}`;
          }
        } else {
          nextUrl = null;
        }
      }

      console.log(`Total NFTs fetched: ${allNFTs.length}`);
      
      return {
        nfts: allNFTs,
        hasNext: false, // We've fetched all pages
        nextUrl: undefined
      };
    } catch (error) {
      console.error('Error fetching token NFTs:', error);
      throw new Error(`Failed to fetch token NFTs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get token information from mirror node
   */
  async getTokenInfo(tokenId: string): Promise<any> {
    try {
      const url = `${this.baseUrl}/tokens/${tokenId}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Mirror node API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching token info:', error);
      throw new Error(`Failed to fetch token info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /** 
   * Get account nft info
   */
  async getAccountNFTInfo(accountId: string): Promise<NFT[]> {
    const url = `${this.baseUrl}/accounts/${accountId}/nfts`;
    const response = await fetch(url, {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error(`Mirror node API error: ${response.status} ${response.statusText}`);
    }
    const data: MirrorNodeNFTsResponse = await response.json();
    return data.nfts;
  }

  /** 
   * Get account fungible token balance
   */
  
  async getAccountFungibleTokenBalance(accountId: string, tokenId: string): Promise<string> {
    try {
      const url = `${this.baseUrl}/accounts/${accountId}/tokens?token.id=${tokenId}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Mirror node API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.tokens && data.tokens.length > 0) {
        const token = data.tokens[0];
        const balance = token.balance / Math.pow(10, token.decimals);
        return balance.toString();
      }
      
      return '0';
    } catch (error) {
      console.error('Error fetching account fungible token balance:', error);
      throw new Error(`Failed to fetch account token balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

}

export const mirrorNodeService = new MirrorNodeService();
