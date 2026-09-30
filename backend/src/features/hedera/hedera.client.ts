import { Client, AccountId, PrivateKey, Hbar, AccountBalanceQuery, AccountInfoQuery } from '@hashgraph/sdk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export interface HederaConfig {
  operatorId: string;
  operatorKey: string;
  network: 'testnet' | 'mainnet' | 'previewnet';
}

/**
 * Parse a Hedera operator private key, supporting both ED25519 and ECDSA.
 *
 * DER-encoded keys are self-describing and parsed directly. Raw hex keys are
 * ambiguous (a 32-byte value is valid under both curves), so the key type is
 * taken from HEDERA_OPERATOR_KEY_TYPE (ED25519 | ECDSA), defaulting to ED25519
 * — the default account type created by the Hedera portal. Parsing a key under
 * the wrong type yields a different public key and fails on-chain with
 * INVALID_SIGNATURE.
 */
export function parseOperatorPrivateKey(key: string): PrivateKey {
  const trimmed = key.trim();
  const isDer = /^30[0-9a-fA-F]{2}/.test(trimmed) && trimmed.length > 64;
  if (isDer) {
    return PrivateKey.fromStringDer(trimmed);
  }
  const keyType = (process.env.HEDERA_OPERATOR_KEY_TYPE || 'ED25519').toUpperCase();
  return keyType === 'ECDSA'
    ? PrivateKey.fromStringECDSA(trimmed)
    : PrivateKey.fromStringED25519(trimmed);
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
      const operatorKey = parseOperatorPrivateKey(this.config.operatorKey);

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
    return parseOperatorPrivateKey(this.config.operatorKey);
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


