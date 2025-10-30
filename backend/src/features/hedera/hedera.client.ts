import { Client, AccountId, PrivateKey, Hbar, AccountBalanceQuery, AccountInfoQuery } from '@hashgraph/sdk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export interface HederaConfig {
  operatorId: string;
  operatorKey: string;
  network: 'testnet' | 'mainnet' | 'previewnet';
}

export class HederaClient {
  private client: Client;
  private config: HederaConfig;

  constructor(config?: Partial<HederaConfig>) {
    this.config = {
      operatorId: process.env.HEDERA_OPERATOR_ID || '',
      operatorKey: process.env.HEDERA_OPERATOR_KEY || '',
      network: (process.env.HEDERA_NETWORK as 'testnet' | 'mainnet' | 'previewnet') || 'testnet',
      ...config
    };

    this.validateConfig();
    this.client = this.createClient();
  }

  private validateConfig(): void {
    if (!this.config.operatorId) {
      throw new Error('HEDERA_OPERATOR_ID environment variable is required');
    }
    if (!this.config.operatorKey) {
      throw new Error('HEDERA_OPERATOR_KEY environment variable is required');
    }
  }

  private createClient(): Client {
    try {
      const operatorId = AccountId.fromString(this.config.operatorId);
      const operatorKey = PrivateKey.fromStringECDSA(this.config.operatorKey);

      const client = Client.forName(this.config.network);
      client.setOperator(operatorId, operatorKey);

      return client;
    } catch (error) {
      throw new Error(`Failed to create Hedera client: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public getClient(): Client {
    return this.client;
  }

  public getOperatorId(): AccountId {
    return AccountId.fromString(this.config.operatorId);
  }

  public getOperatorKey(): PrivateKey {
    return PrivateKey.fromString(this.config.operatorKey);
  }

  public getNetwork(): string {
    return this.config.network;
  }

  public async getAccountBalance(accountId: string): Promise<Hbar> {
    try {
      const accountIdObj = AccountId.fromString(accountId);
      const balance = await new AccountBalanceQuery()
        .setAccountId(accountIdObj)
        .execute(this.client);
      
      return balance.hbars;
    } catch (error) {
      throw new Error(`Failed to get account balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async getAccountInfo(accountId: string) {
    try {
      const accountIdObj = AccountId.fromString(accountId);
      const accountInfo = await new AccountInfoQuery()
        .setAccountId(accountIdObj)
        .execute(this.client);
      
      return accountInfo;
    } catch (error) {
      throw new Error(`Failed to get account info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async close(): Promise<void> {
    await this.client.close();
  }
}

// Create a singleton instance
let hederaClientInstance: HederaClient | null = null;

export const getHederaClient = (config?: Partial<HederaConfig>): HederaClient => {
  if (!hederaClientInstance) {
    hederaClientInstance = new HederaClient(config);
  }
  return hederaClientInstance;
};

export const createHederaClient = (config?: Partial<HederaConfig>): HederaClient => {
  return new HederaClient(config);
};


