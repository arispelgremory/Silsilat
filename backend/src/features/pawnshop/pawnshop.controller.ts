import { Request, Response } from 'express';
import { PrivateKey } from '@hashgraph/sdk';
import { 
  RepaymentRequestSchema, 
  RepaymentResponse, 
  RepaymentParams, 
  RepaymentResult,
} from './pawnshop.model.js';
import { mirrorNodeService } from '../hedera/mirror-node/mirror-node.service.js';
import { TokenHolder } from '../hedera/mirror-node/mirror-node.model.js';
import { hederaTokenRepository } from '../hedera/token/token.repository.js';
import { HederaAccountRepository } from '../hedera/account/account.repository.js';
import { getUserDataByToken } from '../auth/auth.repository.js';
import { decryptPrivateKey } from '../../util/encryption.js';
import { getSag, updateSag } from '../sag/sag.repository.js';
import { db } from '@/db/index.js';
import { repaymentQueue, JOB_TYPES } from '../../bullmq/scheduler.js';

export class PawnshopController {
  /**
   * Process repayment: Get all token holders, unfreeze tokens, transfer to pawnshop, and burn them
   */
  async processRepayment(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const validatedData = RepaymentRequestSchema.parse(req.body);

      // Get user info from JWT token
      const userInfo = await getUserDataByToken(req.headers.authorization?.split(' ')[1] || '');
      if (!userInfo) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized'
        });
        return;
      }

      // Get user's Hedera account info
      const hederaInfo = await new HederaAccountRepository().getAccount(userInfo.accountId || '');
      if (!hederaInfo) {
        res.status(400).json({
          success: false,
          error: 'User Hedera account not found'
        });
        return;
      }

      // Get private key data
      const privateKeyData = await new HederaAccountRepository().getAccountByHederaId(hederaInfo.hederaAccountId || '');
      if (!privateKeyData) {
        res.status(400).json({
          success: false,
          error: 'Private key not found for user account'
        });
        return;
      }

      // Decrypt private keys
      const decryptedPrivateKey = PrivateKey.fromStringECDSA(
        decryptPrivateKey(privateKeyData.privateKey || '', process.env.ENCRYPTION_MASTER_KEY || '')
      );

      // Use provided pawnshop account ID or default to user's account
      const pawnshopAccountId = hederaInfo.hederaAccountId || '';
      // const investorAccountId = hederaInfo.hederaAccountId || '';

      // Prepare repayment parameters
      const repaymentParams: RepaymentParams = {
        tokenId: validatedData.tokenId,
        pawnshopAccountId,
        pawnshopPrivateKey: decryptedPrivateKey,
        freezeKey: decryptedPrivateKey, // Assuming user has freeze key
        supplyKey: decryptedPrivateKey  // Assuming user has supply key
      };

      // Validate environment variables
      const fungibleTokenId = process.env.FUNGIBLE_TOKEN_ID;
      if (!fungibleTokenId) {
        res.status(500).json({
          success: false,
          error: 'Fungible token ID not configured'
        });
        return;
      }

      // Retrieve all investors invested the specific NFTs & consolidate by account
      // So that then transfer fungible token to each investor
      const rawInvestors = await mirrorNodeService.getTokenHolders(validatedData.tokenId);
      const nftHolders = this.consolidateTokenHoldersByAccount(rawInvestors, pawnshopAccountId);
      console.log('NFT holders (consolidated):', nftHolders);
      const totalNFTAmount = nftHolders.reduce((sum, holder) => sum + holder.balance, 0);
      console.log('Total NFT amount:', totalNFTAmount);
      // Step 1: Calculate total buy back cost for all holders
      let totalBuyBackCost = 0;
      let totalBuyBackCostArray = [];
      for (const holder of nftHolders) {
        const holderBuyBackCost = await this.calculateTotalBuyBackCost(holder.account, validatedData.tokenId);
        console.log(`Buy back cost for ${holder.account}:`, holderBuyBackCost);
        totalBuyBackCost += holderBuyBackCost;
        totalBuyBackCostArray.push({account: holder.account, buyBackCost: holderBuyBackCost});
      }
      console.log('Total buy back cost for all holders:', totalBuyBackCost);
      console.log('Total buy back cost array:', totalBuyBackCostArray);
      // Validate pawnshop has sufficient balance
      const rawBalancePawnshop = await hederaTokenRepository.checkAccountBalance(pawnshopAccountId, fungibleTokenId);
      const pawnshopBalance = parseInt(rawBalancePawnshop) / 100;
      console.log('Pawnshop balance:', pawnshopBalance);

      if (pawnshopBalance < totalBuyBackCost) {
        res.status(400).json({
          success: false,
          error: `Insufficient pawnshop balance. Required: ${totalBuyBackCost}, Available: ${pawnshopBalance}`
        });
        return;
      }

      // Get pawnshop private key for the transfer
      const pawnshopKeyData = await new HederaAccountRepository().getAccountByHederaId(pawnshopAccountId);
      if (!pawnshopKeyData?.privateKey) {
        res.status(400).json({
          success: false,
          error: 'Pawnshop private key not found'
        });
        return;
      }

      const pawnshopPrivateKey = PrivateKey.fromStringECDSA(
        decryptPrivateKey(pawnshopKeyData.privateKey, process.env.ENCRYPTION_MASTER_KEY || '')
      );

      // Execute all operations within transaction
      // Note: Hedera blockchain operations cannot be rolled back
      const result = await db.transaction(async (tx) => {
        // Transfer buyback payment from pawnshop to each investor
        console.log(`Transferring total ${totalBuyBackCost} tokens from pawnshop to ${totalBuyBackCostArray.length} investors...`);
        
        for (const holder of totalBuyBackCostArray) {
          console.log(`Transferring ${holder.buyBackCost} tokens to ${holder.account}...`);
          const transferResult = await hederaTokenRepository.transferFungibleToken({ 
            tokenId: fungibleTokenId,
            senderAccountId: pawnshopAccountId,
            senderPrivateKey: pawnshopPrivateKey,
            recipientAccountId: holder.account,
            amount: holder.buyBackCost
          });
          console.log(`Transfer to ${holder.account} completed:`, transferResult.transactionId);
        }
        
        // Update all balances in database after all transfers complete
        console.log('Updating balances in database...');
        
        // Update pawnshop balance (only once, after all transfers)
        const updatedPawnshopBalance = await hederaTokenRepository.checkAccountBalance(pawnshopAccountId, fungibleTokenId);
        const pawnshopBalanceDecimal = parseInt(updatedPawnshopBalance) / 100;
        console.log('Final pawnshop balance:', pawnshopBalanceDecimal);
        await new HederaAccountRepository().updateAccountBalance(pawnshopAccountId, pawnshopBalanceDecimal.toString(), tx);
        
        // Update each investor's balance
        for (const holder of totalBuyBackCostArray) {
          const updatedInvestorBalance = await hederaTokenRepository.checkAccountBalance(holder.account, fungibleTokenId);
          const investorBalanceDecimal = parseInt(updatedInvestorBalance) / 100;
          console.log(`Updated ${holder.account} balance:`, investorBalanceDecimal);
          await new HederaAccountRepository().updateAccountBalance(holder.account, investorBalanceDecimal.toString(), tx);
        }
        
        // Process NFT repayment (unfreeze, transfer, burn)
        console.log('Processing NFT repayment...');
        const repaymentResult = await this.executeRepaymentProcess(repaymentParams);
        
        if (!repaymentResult.success) {
          throw new Error(repaymentResult.error || 'NFT repayment process failed');
        }
        
        // Update SAG status to closed
        await updateSag(validatedData.sagId, { status: 'closed' }, tx);
        
        return repaymentResult;
      });

      const response: RepaymentResponse = {
        success: result.success,
        data: result.success ? {
          tokenId: result.tokenId,
          totalHolders: result.totalHolders,
          totalTokensProcessed: result.totalTokensProcessed,
          unfreezeTransactions: result.unfreezeTransactions,
          transferTransactions: result.transferTransactions,
          burnTransaction: result.burnTransaction
        } : undefined,
        error: result.error
      };

      res.status(result.success ? 200 : 400).json(response);
    } catch (error) {
      console.error('Error processing repayment:', error);
      
      const response: RepaymentResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };

      res.status(400).json(response);
    }
  }

  /**
   * Execute the complete repayment process
   */
  public async executeRepaymentProcess(params: RepaymentParams): Promise<RepaymentResult> {
    try {
      console.log(`Starting repayment process for token ${params.tokenId}`);
      // Step 1: Get all token holders from mirror node
      console.log('Step 1: Fetching token holders from mirror node...');
      const tokenHolders = await mirrorNodeService.getTokenHolders(params.tokenId);
      
      if (tokenHolders.length === 0) {
        return {
          tokenId: params.tokenId,
          totalHolders: 0,
          totalTokensProcessed: 0,
          unfreezeTransactions: [],
          transferTransactions: [],
          burnTransaction: {
            transactionId: '',
            receipt: null,
            totalBurned: 0
          },
          success: true,
          error: 'No token holders found'
        };
      }

      console.log(`Found ${tokenHolders.length} token holders`);

      // Step 2: Unfreeze all accounts
      console.log('Step 2: Unfreezing all token holder accounts...');
      const unfreezeTransactions = await this.unfreezeAllAccounts(tokenHolders, params);

      // Step 3: Transfer all tokens to pawnshop account
      console.log('Step 3: Transferring all tokens to pawnshop account...');
      const transferTransactions = await this.transferAllTokensToPawnshop(tokenHolders, params);

      // Step 4: Collect all serial numbers for burning
      const allSerialNumbers: number[] = [];
      for (const holder of tokenHolders) {
        allSerialNumbers.push(...holder.serialNumbers);
      }

      // Step 5: Burn all tokens in batches
      console.log('Step 4: Burning all tokens in batches...');
      const burnResults = await this.burnTokensInBatches(allSerialNumbers, params);

      const totalBurned = burnResults.reduce((sum, result) => sum + result.totalBurned, 0);
      console.log(`Repayment process completed successfully. Burned ${totalBurned} tokens in ${burnResults.length} batches`);

      return {
        tokenId: params.tokenId,
        totalHolders: tokenHolders.length,
        totalTokensProcessed: allSerialNumbers.length,
        unfreezeTransactions,
        transferTransactions,
        burnTransaction: {
          transactionId: burnResults.length > 0 ? burnResults[0].transactionId : '',
          receipt: burnResults.length > 0 ? burnResults[0].receipt : null,
          totalBurned: totalBurned
        },
        success: true
      };
    } catch (error) {
      console.error('Error in repayment process:', error);
      return {
        tokenId: params.tokenId,
        totalHolders: 0,
        totalTokensProcessed: 0,
        unfreezeTransactions: [],
        transferTransactions: [],
        burnTransaction: {
          transactionId: '',
          receipt: null,
          totalBurned: 0
        },
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Calculation of interest amount
   */
  public async calculateTotalBuyBackCost(accountId: string, tokenId: string): Promise<number> {
    try{
      const investorObtainNFTInfo = await mirrorNodeService.getAccountTokenNFTsAmount(tokenId, accountId);
      const monthsPassed = investorObtainNFTInfo.nfts? (() => {
        // Convert the timestamp (seconds with nanoseconds) to milliseconds
        const createdAtMs = parseFloat(investorObtainNFTInfo.nfts[0].created_timestamp) * 1000
        const now = new Date().getTime()
        const diffMs = now - createdAtMs
    
        // Convert milliseconds to months (approximate: 30.44 days per month)
        const monthsElapsed = diffMs / (1000 * 60 * 60 * 24 * 30.44)
    
        return Math.ceil(monthsElapsed)
      })() : 0
      console.log('Months passed:', monthsPassed);
      const investorObtainNFTAmount = investorObtainNFTInfo.nfts.length;
      console.log('Investor obtain NFT amount:', investorObtainNFTAmount);
      const nftSagInfo = await getSag({ tokenId });
      console.log('NFT sag info:', nftSagInfo);
      const sharePrice = nftSagInfo.data[0].sagProperties.valuation / nftSagInfo.data[0].sagProperties.mintShare; /// 30/3 = 10
      console.log('Share price:', sharePrice);
      const totalRepaymentAmount = investorObtainNFTAmount * sharePrice; // 100 * 10 = 1000
      console.log('Total repayment amount:', totalRepaymentAmount);
      const monthlyInterestAmount = totalRepaymentAmount * nftSagInfo.data[0].sagProperties.investorRoiPercentage / 100; // 1000 * 8 / 100 = 80
      console.log('Monthly interest amount:', monthlyInterestAmount);
      const totalInterestAmount = monthlyInterestAmount * monthsPassed; // 80 * 1 = 80
      console.log('Total interest amount:', totalInterestAmount);
      const totalBuyBackCost = totalRepaymentAmount + totalInterestAmount; // 1000 + 80 = 1080
      console.log('Total buy back cost:', totalBuyBackCost);
      return totalBuyBackCost;
    } catch (error) {
      console.error('Error calculating total buy back cost:', error);
      throw new Error('Failed to calculate total buy back cost');
    }
  }

  /**
   * Unfreeze all token holder accounts
   */
  private async unfreezeAllAccounts(tokenHolders: TokenHolder[], params: RepaymentParams): Promise<Array<{
    accountId: string;
    transactionId: string;
    receipt: any;
  }>> {
    const unfreezeTransactions = [];

    for (const holder of tokenHolders) {
      try {
        // Skip unfreezing if holder account is the same as pawnshop account
        if (holder.account === params.pawnshopAccountId) {
          console.log(`Skipping unfreeze for ${holder.account} - same as pawnshop account`);
          continue;
        }

        console.log(`Unfreezing account ${holder.account}...`);
        
        const result = await hederaTokenRepository.unfreezeToken({
          tokenId: params.tokenId,
          accountId: holder.account,
          freezeKey: params.freezeKey
        });

        unfreezeTransactions.push({
          accountId: holder.account,
          transactionId: result.transactionId,
          receipt: result.receipt
        });

        console.log(`Successfully unfroze account ${holder.account}`);
      } catch (error) {
        console.error(`Failed to unfreeze account ${holder.account}:`, error);
        // Continue with other accounts even if one fails
      }
    }

    return unfreezeTransactions;
  }

  /**
   * Transfer all tokens from holders to pawnshop account
   */
  private async transferAllTokensToPawnshop(tokenHolders: TokenHolder[], params: RepaymentParams): Promise<Array<{
    accountId: string;
    serialNumbers: number[];
    transactionId: string;
    receipt: any;
  }>> {
    const transferTransactions = [];
    const hederaAccountRepository = new HederaAccountRepository();

    for (const holder of tokenHolders) {
      try {
        // Skip transfer if holder account is the same as pawnshop account
        if (holder.account === params.pawnshopAccountId) {
          console.log(`Skipping transfer for ${holder.account} - same as pawnshop account`);
          continue;
        }

        console.log(`Transferring ${holder.serialNumbers.length} tokens from ${holder.account} to pawnshop...`);
        
        // Get account information to retrieve the private key
        const accountInfo = await hederaAccountRepository.getAccountByHederaId(holder.account);
        if (!accountInfo || !accountInfo.privateKey) {
          console.error(`No account info or private key found for ${holder.account}`);
          continue;
        }

        // Decrypt the private key
        const decryptedPrivateKey = PrivateKey.fromStringECDSA(
          decryptPrivateKey(accountInfo.privateKey, process.env.ENCRYPTION_MASTER_KEY || '')
        );
        
        // Transfer each serial number individually
        for (const serialNumber of holder.serialNumbers) {
          const result = await hederaTokenRepository.transferToken({
            tokenId: params.tokenId,
            senderAccountId: holder.account,
            senderPrivateKey: decryptedPrivateKey,
            recipientAccountId: params.pawnshopAccountId,
            serialNumber: serialNumber
          });

          transferTransactions.push({
            accountId: holder.account,
            serialNumbers: [serialNumber],
            transactionId: result.transactionId,
            receipt: result.receipt
          });
        }

        console.log(`Successfully transferred tokens from ${holder.account}`);
      } catch (error) {
        console.error(`Failed to transfer tokens from ${holder.account}:`, error);
        // Continue with other accounts even if one fails
      }
    }

    return transferTransactions;
  }

  /**
   * Burn tokens in batches of 5 to avoid BATCH_SIZE_LIMIT_EXCEEDED error
   */
  private async burnTokensInBatches(allSerialNumbers: number[], params: RepaymentParams): Promise<Array<{
    transactionId: string;
    receipt: any;
    totalBurned: number;
  }>> {
    const burnResults = [];
    const batchSize = 5;

    // Process serial numbers in batches
    for (let i = 0; i < allSerialNumbers.length; i += batchSize) {
      const batch = allSerialNumbers.slice(i, i + batchSize);
      
      try {
        console.log(`Burning batch ${Math.floor(i / batchSize) + 1}: serials ${batch.join(', ')}`);
        
        const result = await hederaTokenRepository.burnToken({
          tokenId: params.tokenId,
          serials: batch,
          supplyKey: params.supplyKey
        });

        burnResults.push({
          transactionId: result.transactionId,
          receipt: result.receipt,
          totalBurned: batch.length
        });

        console.log(`Successfully burned batch of ${batch.length} tokens`);
      } catch (error) {
        console.error(`Failed to burn batch ${Math.floor(i / batchSize) + 1}:`, error);
        // Continue with other batches even if one fails
      }
    }

    return burnResults;
  }

  /**
   * Get token holders without processing repayment (for information purposes)
   */
  async getTokenHolders(req: Request, res: Response): Promise<void> {
    try {
      const { tokenId } = req.params;
      
      if (!tokenId) {
        res.status(400).json({
          success: false,
          error: 'Token ID is required'
        });
        return;
      }

      const tokenHolders = await mirrorNodeService.getTokenHolders(tokenId);
      
      res.status(200).json({
        success: true,
        data: {
          tokenId,
          holders: tokenHolders,
          totalHolders: tokenHolders.length,
          totalTokens: tokenHolders.reduce((sum, holder) => sum + holder.balance, 0)
        }
      });
    } catch (error) {
      console.error('Error fetching token holders:', error);
      
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }

  /**
   * Process repayment asynchronously using BullMQ and Socket.IO
   * This method queues the repayment job and returns immediately
   */
  async processRepaymentAsync(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const validatedData = RepaymentRequestSchema.parse(req.body);

      // Get user info from JWT token
      const userInfo = await getUserDataByToken(req.headers.authorization?.split(' ')[1] || '');
      if (!userInfo) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized'
        });
        return;
      }

      // Get user's Hedera account info
      const hederaInfo = await new HederaAccountRepository().getAccount(userInfo.accountId || '');
      if (!hederaInfo) {
        res.status(400).json({
          success: false,
          error: 'User Hedera account not found'
        });
        return;
      }

      // Validate SAG exists
      const sag = await getSag({ id: validatedData.sagId });
      if (!sag) {
        res.status(404).json({
          success: false,
          error: 'SAG not found'
        });
        return;
      }

      console.log(`[${new Date().toISOString()}] Queuing async repayment for token ${validatedData.tokenId} by user ${userInfo.accountId}`);

      // Get original owner of the hedera account id
      const originalOwnerHederaData = await new HederaAccountRepository().getAccountById(sag.data[0].originalOwner);
      if (!originalOwnerHederaData) {
        res.status(400).json({
          success: false,
          error: 'Original owner Hedera account not found'
        });
        return;
      }

      // Queue the repayment job
      const job = await repaymentQueue.add(
        JOB_TYPES.PROCESS_REPAYMENT,
        {
          tokenId: validatedData.tokenId,
          sagId: validatedData.sagId,
          userId: userInfo.accountId || '',
          pawnshopAccountId: originalOwnerHederaData.hederaAccountId || '',
        },
        {
          jobId: `async-repayment-${validatedData.tokenId}-${Date.now()}`,
          priority: 1, // Higher priority for manual repayments
          removeOnComplete: 10, // Keep last 10 completed jobs
          removeOnFail: 5,      // Keep last 5 failed jobs
        }
      );

      // Return immediately with job information
      const response = {
        success: true,
        message: 'Repayment process queued successfully',
        data: {
          jobId: job.id,
          tokenId: validatedData.tokenId,
          sagId: validatedData.sagId,
          status: 'queued',
          timestamp: new Date().toISOString(),
          estimatedProcessingTime: '2-5 minutes', // Estimated time
        }
      };

      res.status(202).json(response); // 202 Accepted for async processing

    } catch (error) {
      console.error('Error queuing repayment:', error);
      
      const response: RepaymentResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };

      res.status(400).json(response);
    }
  }

  /**
   * Get repayment job status by job ID
   */
  async getRepaymentStatus(req: Request, res: Response): Promise<void> {
    try {
      const { jobId } = req.params;

      if (!jobId) {
        res.status(400).json({
          success: false,
          error: 'Job ID is required'
        });
        return;
      }

      // Get job from repayment queue
      const job = await repaymentQueue.getJob(jobId);
      
      if (!job) {
        res.status(404).json({
          success: false,
          error: 'Job not found'
        });
        return;
      }

      const jobState = await job.getState();
      
      const response = {
        success: true,
        data: {
          jobId: job.id,
          state: jobState,
          progress: job.progress || 0,
          data: job.data,
          returnvalue: job.returnvalue,
          failedReason: job.failedReason,
          timestamp: job.timestamp,
          processedOn: job.processedOn,
          finishedOn: job.finishedOn,
          attemptsMade: job.attemptsMade,
        }
      };

      res.status(200).json(response);

    } catch (error) {
      console.error('Error getting repayment status:', error);
      
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }

  /**
   * Consolidate token holders by account
   * Combines multiple entries for the same account into a single entry
   * Excludes the pawnshop account from the results
   */
  private consolidateTokenHoldersByAccount(tokenHolders: TokenHolder[], pawnshopAccountId?: string): TokenHolder[] {
    const accountMap = new Map<string, TokenHolder>();

    for (const holder of tokenHolders) {
      // Skip pawnshop account if provided
      if (pawnshopAccountId && holder.account === pawnshopAccountId) {
        console.log(`Skipping pawnshop account: ${pawnshopAccountId}`);
        continue;
      }

      const existing = accountMap.get(holder.account);
      
      if (existing) {
        // Account already exists, combine the data
        existing.balance += holder.balance;
        existing.serialNumbers.push(...holder.serialNumbers);
      } else {
        // New account, create a copy to avoid mutating original
        accountMap.set(holder.account, {
          account: holder.account,
          balance: holder.balance,
          serialNumbers: [...holder.serialNumbers]
        });
      }
    }

    // Convert map to array and sort serial numbers
    return Array.from(accountMap.values()).map(holder => ({
      ...holder,
      serialNumbers: holder.serialNumbers.sort((a, b) => a - b)
    }));
  }
}

export const pawnshopController = new PawnshopController();
