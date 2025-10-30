import { eq, and, like, desc, asc, count, ExtractTablesWithRelations } from 'drizzle-orm';
import { PrivateKey, Hbar, AccountCreateTransaction } from '@hashgraph/sdk';
import { db } from '@/db/index.js';
import { getHederaClient } from '../hedera.client.js';
import { encryptPrivateKey } from '../../../util/encryption.js';
import { 
  HederaAccount, 
  HederaAccountType, 
  AccountInfoResponse, 
  AccountListResponse,
  CreateAccountRequest,
  UpdateAccountRequest,
  AccountBalanceResponse
} from './account.model.js';
import { PgTransaction } from 'drizzle-orm/pg-core/index.js';
import { NodePgQueryResultHKT } from 'drizzle-orm/node-postgres/index.js';

export class HederaAccountRepository {
  private hederaClient = getHederaClient();

  // Create a new Hedera account with full business logic
  async createAccount(accountData: CreateAccountRequest, tx?: PgTransaction<NodePgQueryResultHKT, Record<string, never>, ExtractTablesWithRelations<Record<string, never>>>): Promise<AccountInfoResponse> {
    try {
      // Validate required fields
      if (!accountData.accountName || !accountData.accountType) {
        throw new Error('Account name and type are required');
      }

      // Generate new Hedera account
      const newPrivateKey = PrivateKey.generateECDSA();
      const newPublicKey = newPrivateKey.publicKey;
      
      // Create account on Hedera network
      const newAccount = await new AccountCreateTransaction()
        .setKeyWithoutAlias(newPublicKey)
        .setInitialBalance(Hbar.fromTinybars(0))
        .execute(this.hederaClient.getClient());

      const receipt = await newAccount.getReceipt(this.hederaClient.getClient());
      const hederaAccountId = receipt.accountId!.toString();
      
      // Check if account already exists in database
      const existingAccount = await this.accountExists(hederaAccountId);
      if (existingAccount) {
        throw new Error('Account already exists');
      }
      
      // Prepare account data for database
      const accountRecord: HederaAccountType = {
        hederaAccountId,
        accountName: accountData.accountName,
        publicKey: newPublicKey.toString(),
        privateKey: encryptPrivateKey(newPrivateKey.toString()),
        accountType: accountData.accountType,
        balance: '0',
        status: 'ACTIVE',
        isOperator: accountData.isOperator || false,
        network: accountData.network || 'testnet',
        createdBy: 'system', // TODO: Get from authenticated user
        updatedBy: 'system',
      };

      // Save to database
      const createdAccount = await this.createHederaAccount(accountRecord);

      // Return response (exclude private key for security)
      return {
        accountId: createdAccount.accountId!,
        hederaAccountId: createdAccount.hederaAccountId,
        accountName: createdAccount.accountName,
        publicKey: createdAccount.publicKey,
        accountType: createdAccount.accountType,
        balance: createdAccount.balance || '0',
        status: createdAccount.status,
        isOperator: createdAccount.isOperator,
        network: createdAccount.network,
        createdAt: createdAccount.createdAt!,
        updatedAt: createdAccount.updatedAt!,
      };
    } catch (error) {
      console.error('Create account error:', error);
      throw new Error(`Failed to create account: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get account by ID with business logic
  async getAccount(accountId: string): Promise<AccountInfoResponse> {
    try {
      if (!accountId) {
        throw new Error('Account ID is required');
      }

      const account = await this.getAccountById(accountId);
      if (!account) {
        throw new Error('Account not found');
      }

      return {
        accountId: account.accountId!,
        hederaAccountId: account.hederaAccountId,
        accountName: account.accountName,
        publicKey: account.publicKey,
        accountType: account.accountType,
        balance: account.balance || '0',
        status: account.status,
        isOperator: account.isOperator,
        network: account.network,
        createdAt: account.createdAt!,
        updatedAt: account.updatedAt!,
      };
    } catch (error) {
      console.error('Get account error:', error);
      throw new Error(`Failed to get account: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get all accounts with pagination and filtering
  async getAccountsList(
    page: number = 1,
    limit: number = 10,
    search?: string,
    accountType?: string,
    status?: string,
    network?: string
  ): Promise<AccountListResponse> {
    try {
      if (page < 1 || limit < 1 || limit > 100) {
        throw new Error('Invalid pagination parameters');
      }

      return await this.getAccounts(page, limit, search, accountType, status, network);
    } catch (error) {
      console.error('Get accounts error:', error);
      throw new Error(`Failed to get accounts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Update account with business logic
  async updateAccountInfo(accountId: string, updateData: UpdateAccountRequest): Promise<AccountInfoResponse> {
    try {
      if (!accountId) {
        throw new Error('Account ID is required');
      }

      // Check if account exists
      const existingAccount = await this.getAccountById(accountId);
      if (!existingAccount) {
        throw new Error('Account not found');
      }

      // Update account
      const updatedAccount = await this.updateAccount(accountId, {
        ...updateData,
        updatedBy: 'system', // TODO: Get from authenticated user
      });

      if (!updatedAccount) {
        throw new Error('Failed to update account');
      }

      return {
        accountId: updatedAccount.accountId!,
        hederaAccountId: updatedAccount.hederaAccountId,
        accountName: updatedAccount.accountName,
        publicKey: updatedAccount.publicKey,
        accountType: updatedAccount.accountType,
        balance: updatedAccount.balance || '0',
        status: updatedAccount.status,
        isOperator: updatedAccount.isOperator,
        network: updatedAccount.network,
        createdAt: updatedAccount.createdAt!,
        updatedAt: updatedAccount.updatedAt!,
      };
    } catch (error) {
      console.error('Update account error:', error);
      throw new Error(`Failed to update account: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get account balance from Hedera network
  async getAccountBalance(accountId: string): Promise<AccountBalanceResponse> {
    try {
      if (!accountId) {
        throw new Error('Account ID is required');
      }

      // Get account from database
      const account = await this.getAccountById(accountId);
      if (!account) {
        throw new Error('Account not found');
      }

      // Get balance from Hedera network
      const balance = await this.hederaClient.getAccountBalance(account.hederaAccountId);

      // Update balance in database
      await this.updateAccountBalance(account.hederaAccountId, balance.toString());

      return {
        hederaAccountId: account.hederaAccountId,
        balance: balance.toString(),
        balanceInHbar: balance.toString(),
        network: account.network,
      };
    } catch (error) {
      console.error('Get account balance error:', error);
      throw new Error(`Failed to get account balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get account info from Hedera network
  async getAccountInfo(accountId: string): Promise<any> {
    try {
      if (!accountId) {
        throw new Error('Account ID is required');
      }

      // Get account from database
      const account = await this.getAccountById(accountId);
      if (!account) {
        throw new Error('Account not found');
      }

      // Get account info from Hedera network
      const accountInfo = await this.hederaClient.getAccountInfo(account.hederaAccountId);

      return {
        hederaAccountId: account.hederaAccountId,
        accountInfo: {
          accountId: accountInfo.accountId.toString(),
          key: accountInfo.key.toString(),
          balance: accountInfo.balance.toString(),
          isReceiverSignatureRequired: accountInfo.isReceiverSignatureRequired,
          expirationTime: accountInfo.expirationTime?.toString(),
          autoRenewPeriod: accountInfo.autoRenewPeriod?.seconds ? accountInfo.autoRenewPeriod.seconds.toString() : null,
          memo: '',
          isDeleted: accountInfo.isDeleted,
          ethereumNonce: accountInfo.ethereumNonce?.toString(),
          stakingInfo: accountInfo.stakingInfo,
        },
        network: account.network,
      };
    } catch (error) {
      console.error('Get account info error:', error);
      throw new Error(`Failed to get account info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Delete account (soft delete)
  async deleteAccountById(accountId: string): Promise<boolean> {
    try {
      if (!accountId) {
        throw new Error('Account ID is required');
      }

      // Check if account exists
      const existingAccount = await this.getAccountById(accountId);
      if (!existingAccount) {
        throw new Error('Account not found');
      }

      // Soft delete account
      const deleted = await this.deleteAccount(accountId);
      if (!deleted) {
        throw new Error('Failed to delete account');
      }

      return true;
    } catch (error) {
      console.error('Delete account error:', error);
      throw new Error(`Failed to delete account: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get operator accounts
  async getOperatorAccountsList(network?: string): Promise<AccountInfoResponse[]> {
    try {
      const accounts = await this.getOperatorAccounts(network);

      return accounts.map(account => ({
        accountId: account.accountId!,
        hederaAccountId: account.hederaAccountId,
        accountName: account.accountName,
        publicKey: account.publicKey,
        accountType: account.accountType,
        balance: account.balance || '0',
        status: account.status,
        isOperator: account.isOperator,
        network: account.network,
        createdAt: account.createdAt!,
        updatedAt: account.updatedAt!,
      }));
    } catch (error) {
      console.error('Get operator accounts error:', error);
      throw new Error(`Failed to get operator accounts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Database operations (private methods)
  public async createHederaAccount(accountData: HederaAccountType, tx?: PgTransaction<NodePgQueryResultHKT, Record<string, never>, ExtractTablesWithRelations<Record<string, never>>>): Promise<HederaAccountType> {
    try {
      if (tx) {
        const [newAccount] = await tx.insert(HederaAccount).values(accountData).returning();
        return newAccount as HederaAccountType;
      } else {
        const [newAccount] = await db.insert(HederaAccount).values(accountData).returning();
        return newAccount as HederaAccountType;
      }
    } catch (error) {
      console.error('Error creating Hedera account:', error);
      throw new Error('Failed to create Hedera account');
    }
  }

  async getAccountByHederaId(hederaAccountId: string): Promise<HederaAccountType | null> {
    try {
      const [account] = await db
        .select()
        .from(HederaAccount)
        .where(eq(HederaAccount.hederaAccountId, hederaAccountId))
        .limit(1);
      
      return (account as HederaAccountType) || null;
    } catch (error) {
      console.error('Error getting account by Hedera ID:', error);
      throw new Error('Failed to get account by Hedera ID');
    }
  }

  async getAccountById(accountId: string): Promise<HederaAccountType | null> {
    try {
      const [account] = await db
        .select()
        .from(HederaAccount)
        .where(eq(HederaAccount.accountId, accountId))
        .limit(1);
      
      return (account as HederaAccountType) || null;
    } catch (error) {
      console.error('Error getting account by ID:', error);
      throw new Error('Failed to get account by ID');
    }
  }

  private async getAccounts(
    page: number = 1,
    limit: number = 10,
    search?: string,
    accountType?: string,
    status?: string,
    network?: string
  ): Promise<AccountListResponse> {
    try {
      const offset = (page - 1) * limit;
      
      // Build where conditions
      const conditions = [];
      
      if (search) {
        conditions.push(
          like(HederaAccount.accountName, `%${search}%`)
        );
      }
      
      if (accountType) {
        conditions.push(eq(HederaAccount.accountType, accountType));
      }
      
      if (status) {
        conditions.push(eq(HederaAccount.status, status));
      }
      
      if (network) {
        conditions.push(eq(HederaAccount.network, network));
      }
      
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
      
      // Get total count
      const [totalResult] = await db
        .select({ count: count() })
        .from(HederaAccount)
        .where(whereClause);
      
      const total = totalResult.count;
      
      // Get accounts with pagination
      const accounts = await db
        .select({
          accountId: HederaAccount.accountId,
          hederaAccountId: HederaAccount.hederaAccountId,
          accountName: HederaAccount.accountName,
          publicKey: HederaAccount.publicKey,
          accountType: HederaAccount.accountType,
          balance: HederaAccount.balance,
          status: HederaAccount.status,
          isOperator: HederaAccount.isOperator,
          network: HederaAccount.network,
          createdAt: HederaAccount.createdAt,
          updatedAt: HederaAccount.updatedAt,
        })
        .from(HederaAccount)
        .where(whereClause)
        .orderBy(desc(HederaAccount.createdAt))
        .limit(limit)
        .offset(offset);
      
      return {
        accounts: accounts as AccountInfoResponse[],
        total,
        page,
        limit,
      };
    } catch (error) {
      console.error('Error getting accounts:', error);
      throw new Error('Failed to get accounts');
    }
  }

  private async updateAccount(accountId: string, updateData: Partial<HederaAccountType>): Promise<HederaAccountType | null> {
    try {
      const [updatedAccount] = await db
        .update(HederaAccount)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(HederaAccount.accountId, accountId))
        .returning();
      
      return (updatedAccount as HederaAccountType) || null;
    } catch (error) {
      console.error('Error updating account:', error);
      throw new Error('Failed to update account');
    }
  }

  async updateAccountBalance(hederaAccountId: string, balance: string, tx?: PgTransaction<NodePgQueryResultHKT, Record<string, never>, ExtractTablesWithRelations<Record<string, never>>>): Promise<HederaAccountType | null> {
    try {
      if (tx) {
        const [updatedAccount] = await tx
        .update(HederaAccount)
        .set({
          balance,
          updatedAt: new Date(),
        })
          .where(eq(HederaAccount.hederaAccountId, hederaAccountId))
          .returning();
        return (updatedAccount as HederaAccountType) || null;
      } else {
        const [updatedAccount] = await db
          .update(HederaAccount)
          .set({
            balance,
            updatedAt: new Date(),
          })
          .where(eq(HederaAccount.hederaAccountId, hederaAccountId))
          .returning();
        return (updatedAccount as HederaAccountType) || null;
      }
    } catch (error) {
      console.error('Error updating account balance:', error);
      throw new Error('Failed to update account balance');
    }
  }

  private async deleteAccount(accountId: string): Promise<boolean> {
    try {
      const [updatedAccount] = await db
        .update(HederaAccount)
        .set({
          status: 'INACTIVE',
          updatedAt: new Date(),
        })
        .where(eq(HederaAccount.accountId, accountId))
        .returning();
      
      return !!updatedAccount;
    } catch (error) {
      console.error('Error deleting account:', error);
      throw new Error('Failed to delete account');
    }
  }

  private async getOperatorAccounts(network?: string): Promise<HederaAccountType[]> {
    try {
      const conditions = [eq(HederaAccount.isOperator, true)];
      
      if (network) {
        conditions.push(eq(HederaAccount.network, network));
      }
      
      const accounts = await db
        .select()
        .from(HederaAccount)
        .where(and(...conditions))
        .orderBy(asc(HederaAccount.createdAt));
      
      return accounts as HederaAccountType[];
    } catch (error) {
      console.error('Error getting operator accounts:', error);
      throw new Error('Failed to get operator accounts');
    }
  }

  private async accountExists(hederaAccountId: string): Promise<boolean> {
    try {
      const account = await this.getAccountByHederaId(hederaAccountId);
      return !!account;
    } catch (error) {
      console.error('Error checking if account exists:', error);
      return false;
    }
  }
}

// Export singleton instance
export const hederaAccountRepository = new HederaAccountRepository();
