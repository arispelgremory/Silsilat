import { 
  TokenCreateTransaction, 
  TokenType, 
  TokenSupplyType, 
  TokenMintTransaction,
  TokenFreezeTransaction,
  TokenUnfreezeTransaction,
  TokenBurnTransaction,
  TokenWipeTransaction,
  TokenAssociateTransaction,
  TransferTransaction,
  TokenId,
  AccountId,
  PrivateKey,
  TransactionResponse,
  TransactionReceipt,
  Hbar,
  NftId,
  AccountInfoQuery,
  AccountBalanceQuery,
  TokenInfoQuery
} from '@hashgraph/sdk';
import { getHederaClient } from '../hedera.client.js';
import { AssociateTokenParams, BurnTokenParams, CreateTokenParams, FreezeTokenParams, MintTokenParams, MintFungibleTokenParams, Token, TransferTokenParams, WipeTokenParams, FungibleToken, CreateFungibleTokenParams, TransferFungibleTokenParams, FungibleTokenInsertType } from './token.model.js';
import { PurchaseTokenParams } from '../../investor/investor.model.js';
import { db } from '../../../db/index.js';
import { eq, lt, and, sql, ExtractTablesWithRelations } from 'drizzle-orm';
import { ConcurrentMintService } from '../../../services/concurrent-mint.service.js';
import { PgTransaction } from 'drizzle-orm/pg-core/index.js';
import { NodePgQueryResultHKT } from 'drizzle-orm/node-postgres/index.js';
import { HederaAccount } from '../account/account.model.js';

export class TokenRepository {
  private hederaClient;
  private concurrentMintService: ConcurrentMintService;

  constructor() {
    this.hederaClient = getHederaClient();
    this.concurrentMintService = new ConcurrentMintService(3); // Use 3 concurrent workers
  }

  /**
   * Create a new NFT token
   */
  async createToken(params: CreateTokenParams, userId: string): Promise<{
    tokenId: string;
    transactionId: string;
    receipt: TransactionReceipt;
  }> {
    try {
      const client = this.hederaClient.getClient();
      // Create token transaction
      const tokenCreateTransaction = new TokenCreateTransaction()
        .setTokenName(params.name)
        .setTokenSymbol(params.symbol)
        .setTokenType(TokenType.NonFungibleUnique)
        .setSupplyType(TokenSupplyType.Infinite)
        .setInitialSupply(0)
        .setTreasuryAccountId(AccountId.fromString(params.treasuryAccountId))
        .setDecimals(0); // NFTs have 0 decimals

      // Set admin key if provided
      if (params.adminKey) {
        tokenCreateTransaction.setAdminKey(params.adminKey);
      }

      // Set supply key if provided
      if (params.supplyKey) {
        tokenCreateTransaction.setSupplyKey(params.supplyKey);
      }

      // Set freeze key if provided
      if (params.freezeKey) {
        tokenCreateTransaction.setFreezeKey(params.freezeKey);
      }

      // Set wipe key if provided
      if (params.wipeKey) {
        tokenCreateTransaction.setWipeKey(params.wipeKey);
      }

      // Set metadata if provided
      if (params.metadata) {
        tokenCreateTransaction.setMetadata(Buffer.from(params.metadata, 'utf8'));
      }

      // Set custom fees if provided
      if (params.customFees && params.customFees.length > 0) {
        tokenCreateTransaction.setCustomFees(params.customFees);
      }

    //   // Set transaction fee
    //   tokenCreateTransaction.setMaxTransactionFee(new Hbar(30));

      // Freeze the transaction before signing
      tokenCreateTransaction.freezeWith(client);

      // Sign the transaction with the treasury private key
      tokenCreateTransaction.sign(params.treasuryPrivateKey);

      // Execute transaction
      const transactionResponse: TransactionResponse = await tokenCreateTransaction.execute(client);
      const receipt: TransactionReceipt = await transactionResponse.getReceipt(client);
      
      const tokenId = receipt.tokenId?.toString();
      if (!tokenId) {
        throw new Error('Token creation failed - no token ID returned');
      }

      await db.insert(Token).values({
        tokenId,
        transactionId: transactionResponse.transactionId.toString(),
        status: receipt.status.toString(),
        expiredAt: new Date(params.expiredAt),
        createdBy: userId,
        updatedBy: userId
      });

      // Note: Token expiration scheduling is now handled by the daily cron job
      // The daily cron will check for tokens expiring today and schedule them at their exact expiration time
      console.log(`Token ${tokenId} created successfully. Expiration scheduling will be handled by daily cron job.`);

      return {
        tokenId,
        transactionId: transactionResponse.transactionId.toString(),
        receipt
      };
    } catch (error) {
      throw new Error(`Failed to create token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Mint new NFTs to the token
   */
  async mintToken(params: MintTokenParams): Promise<{
    serialNumbers: number[];
    transactionId: string;
    receipt: TransactionReceipt;
  }> {
    try {
      const client = this.hederaClient.getClient();

      // Mint in batches to satisfy Hedera batch limit (max 5 NFT metadata per tx)
      const maxBatchSize = 5;
      const totalToMint = params.amount && params.amount > 0 ? params.amount : 1;
      const allSerials: number[] = [];
      let lastTransactionId = '';
      let lastReceipt: TransactionReceipt | undefined;

      // Helper: sleep with backoff
      const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

      for (let minted = 0; minted < totalToMint; ) {
        const remaining = totalToMint - minted;
        const batchSize = Math.min(maxBatchSize, remaining);

        // Build a new transaction per batch
        const tokenMintTransaction = new TokenMintTransaction()
          .setTokenId(TokenId.fromString(params.tokenId))
          .setMaxTransactionFee(new Hbar(30));

        if (params.metadata) {
          const cidList: Buffer[] = [];
          for (let i = 0; i < batchSize; i++) {
            cidList.push(Buffer.from(params.metadata));
          }
          tokenMintTransaction.setMetadata(cidList);
        }

        // Retry strategy for transient errors
        const maxRetries = 3;
        let attempt = 0;
        // simple jittered exponential backoff: 500ms, 1s, 2s
        const baseDelayMs = 500;

        // eslint-disable-next-line no-constant-condition
        while (true) {
          try {
            tokenMintTransaction.freezeWith(client);
            tokenMintTransaction.sign(params.supplyKey);

            const transactionResponse: TransactionResponse = await tokenMintTransaction.execute(client);
            const receipt: TransactionReceipt = await transactionResponse.getReceipt(client);

            const serialNumbers = receipt.serials || [];
            if (serialNumbers.length === 0) {
              throw new Error('Token minting failed - no serial numbers returned');
            }

            allSerials.push(...serialNumbers.map(sn => Number(sn)));
            lastTransactionId = transactionResponse.transactionId.toString();
            lastReceipt = receipt;
            minted += batchSize;
            break; // success for this batch
          } catch (batchError) {
            const message = batchError instanceof Error ? batchError.message : String(batchError);
            const isTransient =
              message.includes('BATCH_SIZE_LIMIT_EXCEEDED') ||
              message.includes('BUSY') ||
              message.includes('PLATFORM_TRANSACTION_NOT_CREATED') ||
              message.includes('INSUFFICIENT_TX_FEE') ||
              message.includes('TRANSACTION_EXPIRED');

            if (isTransient && attempt < maxRetries) {
              attempt += 1;
              const delay = baseDelayMs * Math.pow(2, attempt - 1) + Math.floor(Math.random() * 100);
              await sleep(delay);
              continue;
            }
            throw new Error(`Failed to mint batch of ${batchSize}: ${message}`);
          }
        }
      }

      return {
        serialNumbers: allSerials,
        transactionId: lastTransactionId,
        receipt: lastReceipt as TransactionReceipt
      };
    } catch (error) {
      throw new Error(`Failed to mint token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createFungibleToken(params: CreateFungibleTokenParams): Promise<{
    tokenId: string;
    transactionId: string;
    receipt: TransactionReceipt;
  }> {
    try {
      // With 2 decimals, multiply by 100 to get the correct display amount
      // e.g., initialSupply: 10000 -> 10000 * 100 = 1000000 raw units = 10000.00 tokens
      const rawInitialSupply = (params.initialSupply || 0) * 100;
      
      // Step 1: Create token on Hedera (OUTSIDE database transaction)
      let tokenCreateTx = new TokenCreateTransaction()
        .setTokenName(params.name)
        .setTokenSymbol(params.symbol)
        .setTokenType(TokenType.FungibleCommon)
        .setDecimals(2)
        .setInitialSupply(rawInitialSupply)
        .setTreasuryAccountId(params.treasuryAccountId || '')
        .setSupplyType(TokenSupplyType.Infinite)
        .setSupplyKey(params.supplyKey)
        .setAutoRenewAccountId(AccountId.fromString(params.treasuryAccountId || ''))
        .setAutoRenewPeriod(7890000) // ~91.3 days in seconds (within Hedera's 6,999,999 - 8,000,001 range)
        .freezeWith(this.hederaClient.getClient());
      
      let tokenCreateSign = await tokenCreateTx.sign(params.treasuryPrivateKey);
      let tokenCreateSubmit = await tokenCreateSign.execute(this.hederaClient.getClient());
      let receipt = await tokenCreateSubmit.getReceipt(this.hederaClient.getClient());
      let tokenId = receipt.tokenId?.toString();
      
      console.log("tokenId: ", tokenId);
      if (!tokenId) {
        throw new Error('Token creation failed - no token ID returned');
      }

      // Step 2: Save to database (INSIDE transaction - fast operation)
      // Calculate expiration date (1 year from now)
      const expirationDate = new Date();
      expirationDate.setFullYear(expirationDate.getFullYear() + 1);
      
      await db.transaction(async (tx) => {
        await createFungibleToken({
          tokenId: tokenId,
          transactionId: tokenCreateSubmit.transactionId.toString(),
          status: receipt.status.toString(),
          expiredAt: expirationDate,
          amount: rawInitialSupply.toString(),
          price: params.price?.toString() || '0',
          createdBy: params.treasuryAccountId || '',
          updatedBy: params.treasuryAccountId || '',
        }, tx);
      });

      return {
        tokenId: tokenId,
        transactionId: tokenCreateSubmit.transactionId.toString(),
        receipt: receipt
      };
    }
    catch (error) {
      throw new Error(`Failed to create fungible token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Mint new NFTs to the token using concurrent workers
   */
  async mintTokenConcurrently(params: MintTokenParams): Promise<{
    serialNumbers: number[];
    transactionIds: string[];
    receipts: TransactionReceipt[];
    batches: Array<{
      batchNumber: number;
      serialNumbers: number[];
      transactionId: string;
      receipt: TransactionReceipt;
      success: boolean;
      error?: string;
    }>;
    success: boolean;
    totalProcessed: number;
    totalFailed: number;
  }> {
    try {
      const totalToMint = params.amount && params.amount > 0 ? params.amount : 1;
      
      // Serialize the private key for worker threads
      const serializedSupplyKey = params.supplyKey.toString();
      
      const result = await this.concurrentMintService.mintConcurrently({
        tokenId: params.tokenId,
        amount: totalToMint,
        supplyKey: serializedSupplyKey,
        metadata: params.metadata,
        maxConcurrentWorkers: 5
      });
      
      if (result.totalFailed > 0) {
        console.warn(`${result.totalFailed} batches failed during concurrent minting`);
      }

      return result;
    } catch (error) {
      throw new Error(`Failed to mint token concurrently: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Mint additional supply to a fungible token
   */
  async mintFungibleToken(params: MintFungibleTokenParams): Promise<{
    newTotalSupply: string;
    transactionId: string;
    receipt: TransactionReceipt;
  }> {
    try {
      const client = this.hederaClient.getClient();

      // With 2 decimals, multiply by 100 to get the correct display amount
      const rawAmount = (params.amount) * 100;

      // Create mint transaction for fungible tokens
      const tokenMintTransaction = new TokenMintTransaction()
        .setTokenId(TokenId.fromString(params.tokenId))
        .setAmount(rawAmount) // For fungible tokens, use setAmount instead of setMetadata
        .setMaxTransactionFee(new Hbar(20));

      // Freeze and sign the transaction
      tokenMintTransaction.freezeWith(client);
      tokenMintTransaction.sign(params.supplyKey);

      // Execute the transaction
      const transactionResponse: TransactionResponse = await tokenMintTransaction.execute(client);
      const receipt: TransactionReceipt = await transactionResponse.getReceipt(client);

      // Get the new total supply
      const newTotalSupply = ((receipt.totalSupply && (receipt.totalSupply).toNumber() / 100) || 0)?.toString() || '0';

      return {
        newTotalSupply,
        transactionId: transactionResponse.transactionId.toString(),
        receipt
      };
    } catch (error) {
      throw new Error(`Failed to mint fungible token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Freeze an account's token holdings
   */
  async freezeToken(params: FreezeTokenParams): Promise<{
    transactionId: string;
    receipt: TransactionReceipt;
  }> {
    try {
      const client = this.hederaClient.getClient();
      
      // Create freeze transaction
      const tokenFreezeTransaction = new TokenFreezeTransaction()
        .setTokenId(TokenId.fromString(params.tokenId))
        .setAccountId(AccountId.fromString(params.accountId));

    //   // Set transaction fee
    //   tokenFreezeTransaction.setMaxTransactionFee(new Hbar(5));

      // Freeze the transaction before signing
      tokenFreezeTransaction.freezeWith(client);
      
      // Sign the transaction with the freeze key
      tokenFreezeTransaction.sign(params.freezeKey);

      // Execute transaction
      const transactionResponse: TransactionResponse = await tokenFreezeTransaction.execute(client);
      const receipt: TransactionReceipt = await transactionResponse.getReceipt(client);

      return {
        transactionId: transactionResponse.transactionId.toString(),
        receipt
      };
    } catch (error) {
      throw new Error(`Failed to freeze token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Unfreeze an account's token holdings
   */
  async unfreezeToken(params: FreezeTokenParams): Promise<{
    transactionId: string;
    receipt: TransactionReceipt;
  }> {
    try {
      const client = this.hederaClient.getClient();
      
      // Create unfreeze transaction
      const tokenUnfreezeTransaction = new TokenUnfreezeTransaction()
        .setTokenId(TokenId.fromString(params.tokenId))
        .setAccountId(AccountId.fromString(params.accountId));

    //   // Set transaction fee
    //   tokenUnfreezeTransaction.setMaxTransactionFee(new Hbar(5));

      // Freeze the transaction before signing
      tokenUnfreezeTransaction.freezeWith(client);

      // Sign the transaction with the freeze key
      tokenUnfreezeTransaction.sign(params.freezeKey);

      // Execute transaction
      const transactionResponse: TransactionResponse = await tokenUnfreezeTransaction.execute(client);
      const receipt: TransactionReceipt = await transactionResponse.getReceipt(client);

      return {
        transactionId: transactionResponse.transactionId.toString(),
        receipt
      };
    } catch (error) {
      throw new Error(`Failed to unfreeze token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Burn NFT serials from an existing token
   */
  async burnToken(params: BurnTokenParams): Promise<{
    transactionId: string;
    receipt: TransactionReceipt;
  }> {
    try {
      const client = this.hederaClient.getClient();
      
      // Create burn transaction
      const tokenBurnTransaction = new TokenBurnTransaction()
        .setTokenId(TokenId.fromString(params.tokenId))
        .setSerials(params.serials);

    //   // Set transaction fee
    //   tokenBurnTransaction.setMaxTransactionFee(new Hbar(30));

      // Freeze the transaction before signing
      tokenBurnTransaction.freezeWith(client);

      // Sign the transaction with the supply key
      tokenBurnTransaction.sign(params.supplyKey);

      // Execute transaction
      const transactionResponse: TransactionResponse = await tokenBurnTransaction.execute(client);
      const receipt: TransactionReceipt = await transactionResponse.getReceipt(client);

      return {
        transactionId: transactionResponse.transactionId.toString(),
        receipt
      };
    } catch (error) {
      throw new Error(`Failed to burn token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Associate an account with a token
   */
  async associateToken(params: AssociateTokenParams): Promise<{
    transactionId: string;
    receipt: TransactionReceipt;
  }> {
    try {
      const client = this.hederaClient.getClient();
      
      // Create associate transaction
      const tokenAssociateTransaction = new TokenAssociateTransaction()
        .setAccountId(AccountId.fromString(params.accountId))
        .setTokenIds([TokenId.fromString(params.tokenId)]);

    //   // Set transaction fee
    //   tokenAssociateTransaction.setMaxTransactionFee(new Hbar(5));

      // Freeze the transaction before signing
      tokenAssociateTransaction.freezeWith(client);

      // Sign the transaction with the account's private key
      tokenAssociateTransaction.sign(params.privateKey);

      // Execute transaction
      const transactionResponse: TransactionResponse = await tokenAssociateTransaction.execute(client);
      const receipt: TransactionReceipt = await transactionResponse.getReceipt(client);

      return {
        transactionId: transactionResponse.transactionId.toString(),
        receipt
      };
    } catch (error) {
      throw new Error(`Failed to associate token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Transfer an NFT from one account to another
   */
  async transferToken(params: TransferTokenParams): Promise<{
    transactionId: string;
    receipt: TransactionReceipt;
  }> {
    try {
      const client = this.hederaClient.getClient();
      
      // Create transfer transaction
      const transferTransaction = new TransferTransaction()
        .addNftTransfer(
          new NftId(TokenId.fromString(params.tokenId), params.serialNumber),
          AccountId.fromString(params.senderAccountId),
          AccountId.fromString(params.recipientAccountId)
        );

    //   // Set transaction fee
    //   transferTransaction.setMaxTransactionFee(new Hbar(30));

      // Freeze the transaction before signing
      transferTransaction.freezeWith(client);

      // Sign the transaction with the sender's private key
      transferTransaction.sign(params.senderPrivateKey);

      // Execute transaction
      const transactionResponse: TransactionResponse = await transferTransaction.execute(client);
      const receipt: TransactionReceipt = await transactionResponse.getReceipt(client);

      return {
        transactionId: transactionResponse.transactionId.toString(),
        receipt
      };
    } catch (error) {
      throw new Error(`Failed to transfer token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Wipe NFT serials from an account (requires wipe key)
   */
  async wipeToken(params: WipeTokenParams): Promise<{
    transactionId: string;
    receipt: TransactionReceipt;
  }> {
    try {
      const client = this.hederaClient.getClient();
      
      // Create wipe transaction
      const tokenWipeTransaction = new TokenWipeTransaction()
        .setTokenId(TokenId.fromString(params.tokenId))
        .setAccountId(AccountId.fromString(params.accountId))
        .setSerials(params.serials);

    //   // Set transaction fee
    //   tokenWipeTransaction.setMaxTransactionFee(new Hbar(30));

      // Freeze the transaction before signing
      tokenWipeTransaction.freezeWith(client);

      // Sign the transaction with the wipe key
      tokenWipeTransaction.sign(params.wipeKey);

      // Execute transaction
      const transactionResponse: TransactionResponse = await tokenWipeTransaction.execute(client);
      const receipt: TransactionReceipt = await transactionResponse.getReceipt(client);

      return {
        transactionId: transactionResponse.transactionId.toString(),
        receipt
      };
    } catch (error) {
      throw new Error(`Failed to wipe token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get token by tokenId
   */
  async getTokenByTokenId(tokenId: string): Promise<{
    tokenId: string;
    transactionId: string;
    status: string;
    expiredAt: Date;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
  } | null> {
    try {
      const result = await db.select().from(Token).where(eq(Token.tokenId, tokenId)).limit(1);
      return result[0] || null;
    } catch (error) {
      throw new Error(`Failed to get token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getFungibleTokenByTokenId(tokenId: string): Promise<{
    tokenId: string;
    transactionId: string;
    status: string;
    expiredAt: Date;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
    amount: string;
    price: string;
  } | null> {
    try {
      const result = await db.select().from(FungibleToken).where(eq(FungibleToken.tokenId, tokenId)).limit(1);
      return result[0] || null;
    } catch (error) {
      throw new Error(`Failed to get fungible token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get available serial numbers for a token owned by a specific account
   * For now, we'll generate sequential serial numbers starting from 1
   * In a production environment, you might want to query the actual NFT balance
   */
  async getAvailableSerialNumbers(tokenId: string, accountId: string, limit: number = 100): Promise<number[]> {
    try {
      // For now, generate sequential serial numbers starting from 1
      // In a real implementation, you would query the actual NFT balance
      // and return the available serial numbers
      const serialNumbers: number[] = [];
      for (let i = 1; i <= limit; i++) {
        serialNumbers.push(i);
      }
      
      return serialNumbers;
    } catch (error) {
      throw new Error(`Failed to get available serial numbers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all tokens that have expired (expiredAt < current time)
   */
  async getExpiredTokens(): Promise<Array<{
    tokenId: string;
    transactionId: string;
    status: string;
    expiredAt: Date;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
  }>> {
    try {
      const currentTime = new Date();
      const result = await db
        .select()
        .from(Token)
        .where(and(
          lt(Token.expiredAt, currentTime),
          eq(Token.status, 'SUCCESS') // Only process successfully created tokens
        ));
      
      return result;
    } catch (error) {
      throw new Error(`Failed to get expired tokens: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get tokens that expire today (expiredAt is between start and end of today)
   */
  async getTokensExpiringToday(): Promise<Array<{
    tokenId: string;
    transactionId: string;
    status: string;
    expiredAt: Date;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
  }>> {
    try {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      
      const result = await db
        .select()
        .from(Token)
        .where(and(
          // expiredAt >= start of today
          sql`${Token.expiredAt} >= ${startOfToday}`,
          // expiredAt < end of today (start of tomorrow)
          sql`${Token.expiredAt} < ${endOfToday}`,
          // Only process successfully created tokens
          eq(Token.status, 'SUCCESS')
        ));
      
      return result;
    } catch (error) {
      throw new Error(`Failed to get tokens expiring today: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update token status
   */
  async updateTokenStatus(tokenId: string, status: string, updatedBy: string): Promise<void> {
    try {
      await db
        .update(Token)
        .set({
          status,
          updatedBy,
          updatedAt: new Date()
        })
        .where(eq(Token.tokenId, tokenId));
    } catch (error) {
      throw new Error(`Failed to update token status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Purchase token: Transfer NFT(s) to investor (without freezing)
   * Note: Token association should be done separately before calling this method
   */
  async purchaseToken(params: PurchaseTokenParams): Promise<{
    tokenId: string;
    serialNumbers: number[];
    investorAccountId: string;
    transferTransactionId: string;
    transferReceipt: TransactionReceipt;
  }> {
    try {
      const client = this.hederaClient.getClient();
      
      // Transfer the NFT(s) from pawnshop to investor
      // Add all NFT transfers to a single transaction to avoid ACCOUNT_REPEATED_IN_ACCOUNT_AMOUNTS error
      const transferTransaction = new TransferTransaction();

      for (const serialNumber of params.serialNumbers) {
        transferTransaction.addNftTransfer(
          new NftId(TokenId.fromString(params.tokenId), serialNumber),
          AccountId.fromString(params.pawnShopAccountId),
          AccountId.fromString(params.investorAccountId)
        );
      }
      
      transferTransaction.freezeWith(client);
      transferTransaction.sign(params.pawnShopPrivateKey);
      
      const transferResponse = await transferTransaction.execute(client);
      const transferReceipt = await transferResponse.getReceipt(client);

      return {
        tokenId: params.tokenId,
        serialNumbers: params.serialNumbers,
        investorAccountId: params.investorAccountId,
        transferTransactionId: transferResponse.transactionId.toString(),
        transferReceipt: transferReceipt
      };
    } catch (error) {
      throw new Error(`Failed to purchase token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Associate token with investor account (if not already associated)
   */
  async associateTokenWithAccount(params: {
    tokenId: string;
    investorAccountId: string;
    investorPrivateKey: PrivateKey;
  }): Promise<{
    tokenId: string;
    investorAccountId: string;
    associationTransactionId: string;
    associationReceipt: TransactionReceipt;
  }> {
    try {
      const client = this.hederaClient.getClient();
      
      const associateTransaction = new TokenAssociateTransaction()
        .setAccountId(AccountId.fromString(params.investorAccountId))
        .setTokenIds([TokenId.fromString(params.tokenId)]);

      associateTransaction.freezeWith(client);
      associateTransaction.sign(params.investorPrivateKey);
      
      const associateResponse = await associateTransaction.execute(client);
      const associationReceipt = await associateResponse.getReceipt(client);

      return {
        tokenId: params.tokenId,
        investorAccountId: params.investorAccountId,
        associationTransactionId: associateResponse.transactionId.toString(),
        associationReceipt: associationReceipt
      };
    } catch (error) {
      // If association fails, it might already be associated, which is fine
      if (error instanceof Error && error.message.includes('TOKEN_ALREADY_ASSOCIATED_TO_ACCOUNT')) {
        console.log('Token already associated with account:', params.investorAccountId);
        // Return a mock response for already associated case
        return {
          tokenId: params.tokenId,
          investorAccountId: params.investorAccountId,
          associationTransactionId: 'ALREADY_ASSOCIATED',
          associationReceipt: null as any
        };
      }
      throw new Error(`Failed to associate token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async transferFungibleToken(params: TransferFungibleTokenParams): Promise<{
    transactionId: string;
    receipt: TransactionReceipt;
  }> {
    try {
      const client = this.hederaClient.getClient();
      
      // With 2 decimals, multiply by 100 to get the correct raw amount
      const rawAmount = (params.amount * 100);
      console.log("rawAmount*100 to get the correct raw amount: ", rawAmount);
      const transferTransaction = new TransferTransaction()
        .addTokenTransfer(TokenId.fromString(params.tokenId), AccountId.fromString(params.senderAccountId), -rawAmount)
        .addTokenTransfer(TokenId.fromString(params.tokenId), AccountId.fromString(params.recipientAccountId), rawAmount);
      transferTransaction.freezeWith(client);
      transferTransaction.sign(params.senderPrivateKey);
      const transferResponse = await transferTransaction.execute(client);
      const transferReceipt = await transferResponse.getReceipt(client);

      return {
        transactionId: transferResponse.transactionId.toString(),
        receipt: transferReceipt
      };
    } catch (error) {
      throw new Error(`Failed to transfer fungible token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async checkAccountBalance(accountId: string, tokenId: string): Promise<string> {
    try {
      const client = this.hederaClient.getClient();
      
      // Check the balance before the NFT transfer for the treasury account
      let balanceCheckTx = await new AccountBalanceQuery()
      .setAccountId(accountId)
      .execute(client);

      return (balanceCheckTx.tokens?.get(tokenId) ?? '0').toString();
    } catch (error) {
      throw new Error(`Failed to check account balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async checkTokenTotalSupply(tokenId: string): Promise<{
    checkTokenTotalSupply: number;
  }> {
    try {
      // Validate tokenId format
      if (!tokenId || !tokenId.match(/^\d+\.\d+\.\d+$/)) {
        throw new Error('Invalid token ID format. Expected format: 0.0.xxxxx');
      }

      const client = this.hederaClient.getClient();
      const tokenInfoTx = await new TokenInfoQuery()
        .setTokenId(TokenId.fromString(tokenId))
        .execute(client);
      
      // Check if totalSupply exists
      if (!tokenInfoTx.totalSupply) {
        throw new Error('Token total supply information not available');
      }

      // Convert to number and validate
      const totalSupply = tokenInfoTx.totalSupply.toNumber();
      
      return {
        checkTokenTotalSupply: totalSupply,
      };
    } catch (error) {
      console.error('Error checking token total supply:', error);
      throw new Error(`Failed to check token info for token ${tokenId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find a fungible token by symbol by querying Hedera network
   */
  async findFungibleTokenBySymbol(symbol: string): Promise<{
    tokenId: string;
    name: string;
    symbol: string;
    totalSupply: number;
    decimals: number;
  } | null> {
    try {
      // Query all fungible tokens from database
      const tokens = await db.select().from(FungibleToken);
      
      // Check each token's symbol on Hedera network
      const client = this.hederaClient.getClient();
      
      for (const token of tokens) {
        try {
          const tokenInfo = await new TokenInfoQuery()
            .setTokenId(TokenId.fromString(token.tokenId))
            .execute(client);
          
          if (tokenInfo.symbol?.toUpperCase() === symbol.toUpperCase()) {
            return {
              tokenId: token.tokenId,
              name: tokenInfo.name || '',
              symbol: tokenInfo.symbol || '',
              totalSupply: tokenInfo.totalSupply?.toNumber() || 0,
              decimals: tokenInfo.decimals || 0
            };
          }
        } catch (error) {
          // If token doesn't exist on network, skip it
          console.warn(`Token ${token.tokenId} doesn't exist on Hedera network, skipping...`);
          continue;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error finding fungible token by symbol:', error);
      throw new Error(`Failed to find fungible token by symbol ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

}

export const hederaTokenRepository = new TokenRepository();

export const createFungibleToken = async (params: FungibleTokenInsertType, tx?: PgTransaction<NodePgQueryResultHKT, Record<string, never>, ExtractTablesWithRelations<Record<string, never>>>) => {
  if (tx) {
    return await tx.insert(FungibleToken).values(params).returning();
  } else {
    return await db.insert(FungibleToken).values(params).returning();
  }
}


export const updateFungibleTokenAmount = async (tokenId: string, amount: string, tx?: PgTransaction<NodePgQueryResultHKT, Record<string, never>, ExtractTablesWithRelations<Record<string, never>>>) => {
  if (tx) {
    await tx.update(FungibleToken)
      .set({
        amount: amount
      })
      .where(eq(FungibleToken.tokenId, tokenId));
  } else {
    await db.update(FungibleToken)
      .set({
        amount: amount
      })
      .where(eq(FungibleToken.tokenId, tokenId));
  }
}

export const getInvestorWalletBalance = async (accountId: string): Promise<string> => {
  try {
    // Validate accountId
    if (!accountId || accountId.trim() === '') {
      throw new Error('Account ID is required');
    }

    const hederaAccount = await db
      .select()
      .from(HederaAccount)
      .where(eq(HederaAccount.accountId, accountId))
      .limit(1);
    
    // Check if account exists
    if (!hederaAccount || hederaAccount.length === 0) {
      console.warn(`No Hedera account found for account ID: ${accountId}`);
      return '0';
    }

    // Return balance, defaulting to '0' if null/undefined
    const balance = hederaAccount[0].balance ?? '0';
    return balance.toString();
  } catch (error) {
    console.error('Error getting investor wallet balance:', error);
    throw new Error(`Failed to get investor wallet balance for account ${accountId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}