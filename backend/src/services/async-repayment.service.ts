import { Job } from 'bullmq';
import { hederaTokenRepository } from '../features/hedera/token/token.repository.js';
import { HederaAccountRepository } from '../features/hedera/account/account.repository.js';
import { decryptPrivateKey } from '../util/encryption.js';
import { PrivateKey } from '@hashgraph/sdk';
import { getOriginalOwnerByTokenId, getSag, updateSag } from '../features/sag/sag.repository.js';
import { db } from '../db/index.js';
import { mirrorNodeService } from '../features/hedera/mirror-node/mirror-node.service.js';
import { getSocketService, RepaymentProgressData, RepaymentCompleteData } from '../services/socket.service.js';
import { TokenHolder } from '../features/hedera/mirror-node/mirror-node.model.js';
import { PawnshopController } from '../features/pawnshop/pawnshop.controller.js';
const pawnshopController = new PawnshopController();

export interface AsyncRepaymentJobData {
  tokenId: string;
  sagId: string;
  userId: string; // User who initiated the repayment
  pawnshopAccountId?: string;
}

export interface RepaymentParams {
  tokenId: string;
  pawnshopAccountId: string;
  pawnshopPrivateKey: PrivateKey;
  freezeKey: PrivateKey;
  supplyKey: PrivateKey;
}

export interface RepaymentResult {
  success: boolean;
  tokenId?: string;
  totalHolders?: number;
  totalTokensProcessed?: number;
  unfreezeTransactions?: Array<{
    accountId: string;
    transactionId: string;
    receipt: any;
  }>;
  transferTransactions?: Array<{
    accountId: string;
    serialNumbers: number[];
    transactionId: string;
    receipt: any;
  }>;
  burnTransaction?: {
    transactionId: string;
    receipt: any;
    totalBurned: number;
  };
  error?: string;
}

/**
 * Enhanced repayment processor with Socket.IO progress updates
 */
export async function processAsyncRepayment(job: Job<AsyncRepaymentJobData>): Promise<RepaymentResult> {
  const { tokenId, sagId, userId, pawnshopAccountId } = job.data;
  const socketService = getSocketService();
  
  try {
    // Stage 1: Validation (10%)
    await updateProgress(job, socketService, userId, 'validating', 10, 'Validating request and checking permissions...');
    
    // Get user's Hedera account info
    const hederaInfo = await new HederaAccountRepository().getAccount(userId);
    if (!hederaInfo) {
      throw new Error('User Hedera account not found');
    }

    // Get private key data
    const privateKeyData = await new HederaAccountRepository().getAccountByHederaId(process.env.ADMIN_HEDERA_ACCOUNT_ID || '');
    if (!privateKeyData) {
      throw new Error('Private key not found for user account');
    }

    // Decrypt private keys
    const decryptedPrivateKey = PrivateKey.fromStringECDSA(
      decryptPrivateKey(privateKeyData.privateKey || '', process.env.ENCRYPTION_MASTER_KEY || '')
    );

    // Use provided pawnshop account ID or default to user's account
    const finalPawnshopAccountId = pawnshopAccountId || hederaInfo.hederaAccountId || '';

    // Validate environment variables
    const fungibleTokenId = process.env.FUNGIBLE_TOKEN_ID;
    if (!fungibleTokenId) {
      throw new Error('Fungible token ID not configured');
    }

    // Stage 2: Calculate buyback costs (30%)
    await updateProgress(job, socketService, userId, 'calculating', 30, 'Calculating buyback costs for all investors...');
    
    // Retrieve all investors invested the specific NFTs & consolidate by account
    const rawInvestors = await mirrorNodeService.getTokenHolders(tokenId);
    const nftSagInfo = await getSag({ tokenId });
    if (!nftSagInfo.data[0]) {
      throw new Error('NFT sag info not found');
    }
    const nftHolders = consolidateTokenHoldersByAccount(rawInvestors, process.env.ADMIN_HEDERA_ACCOUNT_ID || '');
    console.log('NFT holders (consolidated):', nftHolders);
    
    const totalNFTAmount = nftHolders.reduce((sum, holder) => sum + holder.balance, 0);
    console.log('Total NFT amount:', totalNFTAmount);
    
    // Calculate total buy back cost for all holders
    let totalBuyBackCost = 0;
    let totalBuyBackCostArray = [];
    for (const holder of nftHolders) {
      const holderBuyBackCost = await pawnshopController.calculateTotalBuyBackCost(holder.account, tokenId);
      console.log(`Buy back cost for ${holder.account}:`, holderBuyBackCost);
      totalBuyBackCost += holderBuyBackCost;
      totalBuyBackCostArray.push({account: holder.account, buyBackCost: holderBuyBackCost});
    }
    console.log('Total buy back cost for all holders:', totalBuyBackCost);

    // Validate pawnshop has sufficient balance
    const rawBalancePawnshop = await hederaTokenRepository.checkAccountBalance(finalPawnshopAccountId, fungibleTokenId);
    const pawnshopBalance = parseInt(rawBalancePawnshop) / 100;
    console.log('Pawnshop balance:', pawnshopBalance);

    if (pawnshopBalance < totalBuyBackCost) {
      throw new Error(`Insufficient pawnshop balance. Required: ${totalBuyBackCost}, Available: ${pawnshopBalance}`);
    }

    // Get pawnshop private key for the transfer
    const pawnshopKeyData = await new HederaAccountRepository().getAccountByHederaId(finalPawnshopAccountId);
    if (!pawnshopKeyData?.privateKey) {
      throw new Error('Pawnshop private key not found');
    }

    const pawnshopPrivateKey = PrivateKey.fromStringECDSA(
      decryptPrivateKey(pawnshopKeyData.privateKey, process.env.ENCRYPTION_MASTER_KEY || '')
    );

    // Stage 3: Transfer fungible tokens (60%)
    await updateProgress(job, socketService, userId, 'transferring', 60, 'Transferring buyback payments to investors...');
    
    // Execute all operations within transaction
    const result = await db.transaction(async (tx) => {
      // Transfer buyback payment from pawnshop to each investor
      console.log(`Transferring total ${totalBuyBackCost} tokens from pawnshop to ${totalBuyBackCostArray.length} investors...`);
      
      for (const holder of totalBuyBackCostArray) {
        console.log(`Transferring ${holder.buyBackCost} tokens to ${holder.account}...`);
        const transferResult = await hederaTokenRepository.transferFungibleToken({ 
          tokenId: fungibleTokenId,
          senderAccountId: finalPawnshopAccountId,
          senderPrivateKey: pawnshopPrivateKey,
          recipientAccountId: holder.account,
          amount: holder.buyBackCost
        });
        console.log(`Transfer to ${holder.account} completed:`, transferResult.transactionId);
      }

      // transfer non-sold nft to platform(admin) only if there are unsold shares
      const nonSoldNftAmount = nftSagInfo.data[0].sagProperties.mintShare - totalBuyBackCostArray.length;
      
      if (nonSoldNftAmount > 0) {
        console.log(`Transferring non-sold NFTs (${nonSoldNftAmount} shares) to platform admin...`);
        const nftPricePerShare = nftSagInfo.data[0].sagProperties.valuation / nftSagInfo.data[0].sagProperties.mintShare;
        const nonSoldNftCost = (nonSoldNftAmount * nftPricePerShare);
        const transferNonSoldNftResult = await hederaTokenRepository.transferFungibleToken({ 
          tokenId: fungibleTokenId,
          senderAccountId: finalPawnshopAccountId,
          senderPrivateKey: pawnshopPrivateKey,
          recipientAccountId: process.env.ADMIN_HEDERA_ACCOUNT_ID || '',
          amount: nonSoldNftCost
        });
        console.log(`Transfer of non-sold NFTs to admin completed:`, transferNonSoldNftResult.transactionId);
      } else {
        console.log(`All NFT shares (${nftSagInfo.data[0].sagProperties.mintShare}) have been sold. No transfer to admin needed.`);
      }
      
      // Update all balances in database after all transfers complete
      console.log('Updating balances in database...');
      
      // Update pawnshop balance (only once, after all transfers)
      const updatedPawnshopBalance = await hederaTokenRepository.checkAccountBalance(finalPawnshopAccountId, fungibleTokenId);
      const pawnshopBalanceDecimal = parseInt(updatedPawnshopBalance) / 100;
      console.log('Final pawnshop balance:', pawnshopBalanceDecimal);
      await new HederaAccountRepository().updateAccountBalance(finalPawnshopAccountId, pawnshopBalanceDecimal.toString(), tx);
      
      // Update each investor's balance
      for (const holder of totalBuyBackCostArray) {
        const updatedInvestorBalance = await hederaTokenRepository.checkAccountBalance(holder.account, fungibleTokenId);
        const investorBalanceDecimal = parseInt(updatedInvestorBalance) / 100;
        console.log(`Updated ${holder.account} balance:`, investorBalanceDecimal);
        await new HederaAccountRepository().updateAccountBalance(holder.account, investorBalanceDecimal.toString(), tx);
      }

      // Update platform(admin) balance
      const updatedAdminBalance = await hederaTokenRepository.checkAccountBalance(process.env.ADMIN_HEDERA_ACCOUNT_ID || '', fungibleTokenId);
      const adminBalanceDecimal = parseInt(updatedAdminBalance) / 100;
      console.log('Final admin balance:', adminBalanceDecimal);
      await new HederaAccountRepository().updateAccountBalance(process.env.ADMIN_HEDERA_ACCOUNT_ID || '', adminBalanceDecimal.toString(), tx);
      
      // Stage 4: Process NFT repayment (80%)
      await updateProgress(job, socketService, userId, 'processing_nft', 80, 'Processing NFT repayment (unfreeze, transfer, burn)...');
      
      // Prepare repayment parameters
      const repaymentParams: RepaymentParams = {
        tokenId,
        pawnshopAccountId: finalPawnshopAccountId,
        pawnshopPrivateKey: decryptedPrivateKey,
        freezeKey: decryptedPrivateKey,
        supplyKey: decryptedPrivateKey
      };
      
      // Process NFT repayment (unfreeze, transfer, burn) with detailed progress
      console.log('Processing NFT repayment...');
      const repaymentResult = await executeRepaymentProcess(repaymentParams, job, socketService, userId);
      
      if (!repaymentResult.success) {
        throw new Error(repaymentResult.error || 'NFT repayment process failed');
      }
      
      // Stage 5: Update SAG status (90%)
      await updateProgress(job, socketService, userId, 'updating_status', 90, 'Updating SAG status to closed...');
      
      // Update SAG status to closed
      await updateSag(sagId, { status: 'closed' }, tx);
      
      return repaymentResult;
    });

    // Stage 6: Complete (100%)
    await updateProgress(job, socketService, userId, 'complete', 100, 'Repayment process completed successfully!');
    
    const completeData: RepaymentCompleteData = {
      jobId: job.id || '',
      tokenId,
      success: true,
      data: {
        totalHolders: result.totalHolders || 0,
        totalTokensProcessed: result.totalTokensProcessed || 0,
        unfreezeTransactions: result.unfreezeTransactions || [],
        transferTransactions: result.transferTransactions || [],
        burnTransaction: result.burnTransaction || {transactionId: '', receipt: null, totalBurned: 0},
      },
      timestamp: new Date().toISOString(),
    };

    socketService.emitRepaymentComplete(userId, completeData);

    console.log(`Repayment processing completed for token ${tokenId}: SUCCESS`);
    
    return {
      success: true,
      tokenId,
      totalHolders: result.totalHolders,
      totalTokensProcessed: result.totalTokensProcessed,
      unfreezeTransactions: result.unfreezeTransactions,
      transferTransactions: result.transferTransactions,
      burnTransaction: result.burnTransaction,
    };
    
  } catch (error) {
    console.error(`Error processing repayment for token ${tokenId}:`, error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Emit error to user
    socketService.emitRepaymentError(userId, errorMessage);
    
    // Update token status to indicate repayment failed
    await hederaTokenRepository.updateTokenStatus(tokenId, 'REPAYMENT_FAILED', userId);
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Update job progress and emit Socket.IO event
 */
async function updateProgress(
  job: Job<AsyncRepaymentJobData>,
  socketService: any,
  userId: string,
  stage: RepaymentProgressData['stage'],
  progress: number,
  message: string
): Promise<void> {
  // Update job progress
  await job.updateProgress(progress);
  
  // Emit progress update via Socket.IO
  const progressData: RepaymentProgressData = {
    jobId: job.id || '',
    tokenId: job.data.tokenId,
    stage,
    progress,
    message,
    timestamp: new Date().toISOString(),
  };
  
  socketService.emitRepaymentProgress(userId, progressData);
}

/**
 * Update job progress with detailed information
 */
async function updateProgressWithDetails(
  job: Job<AsyncRepaymentJobData>,
  socketService: any,
  userId: string,
  stage: RepaymentProgressData['stage'],
  progress: number,
  message: string,
  details?: RepaymentProgressData['details']
): Promise<void> {
  // Update job progress
  await job.updateProgress(progress);
  
  // Emit progress update via Socket.IO
  const progressData: RepaymentProgressData = {
    jobId: job.id || '',
    tokenId: job.data.tokenId,
    stage,
    progress,
    message,
    details,
    timestamp: new Date().toISOString(),
  };
  
  socketService.emitRepaymentProgress(userId, progressData);
}

/**
 * Consolidate token holders by account (remove pawnshop account)
 */
function consolidateTokenHoldersByAccount(holders: any[], pawnshopAccountId: string): Array<{account: string, balance: number}> {
  const consolidated: {[key: string]: number} = {};
  
  for (const holder of holders) {
    if (holder.account !== pawnshopAccountId) {
      consolidated[holder.account] = (consolidated[holder.account] || 0) + holder.balance;
    }
  }
  
  return Object.entries(consolidated).map(([account, balance]) => ({
    account,
    balance
  }));
}

/**
 * Calculate total buyback cost for a specific account
 */
async function calculateTotalBuyBackCost(account: string, tokenId: string): Promise<number> {
  // This is a placeholder - implement your actual buyback cost calculation logic
  // For now, returning a fixed amount per NFT
  const nftBalance = await mirrorNodeService.getTokenHolders(tokenId);
  const accountBalance = nftBalance.find(h => h.account === account)?.balance || 0;
  
  // Assuming 100 tokens per NFT as buyback cost
  return accountBalance * 100;
}

/**
 * Execute the actual repayment process (unfreeze, transfer, burn NFTs)
 */
async function executeRepaymentProcess(
  params: RepaymentParams, 
  job: Job<AsyncRepaymentJobData>, 
  socketService: any, 
  userId: string
): Promise<RepaymentResult> {
  try {
    console.log(`Starting repayment process for token ${params.tokenId}`);
    
    // Step 1: Get all token holders from mirror node
    console.log('Step 1: Fetching token holders from mirror node...');
    await updateProgressWithDetails(
      job, socketService, userId, 'processing_nft', 80, 
      'Fetching token holders from mirror node...',
      { currentStep: 'Fetching holders', completedSteps: 0, totalSteps: 4 }
    );
    
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
    const unfreezeTransactions = await unfreezeAllAccounts(tokenHolders, params, job, socketService, userId);

    // Step 3: Transfer all tokens to pawnshop account
    console.log('Step 3: Transferring all tokens to pawnshop account...');
    const transferTransactions = await transferAllTokensToPawnshop(tokenHolders, params, job, socketService, userId);

    // Step 4: Collect all serial numbers for burning
    const allSerialNumbers: number[] = [];
    for (const holder of tokenHolders) {
      allSerialNumbers.push(...holder.serialNumbers);
    }

    // Step 5: Burn all tokens in batches
    console.log('Step 4: Burning all tokens in batches...');
    const burnResults = await burnTokensInBatches(allSerialNumbers, params, job, socketService, userId);

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
 * Unfreeze all token holder accounts
 */
async function unfreezeAllAccounts(
  tokenHolders: TokenHolder[], 
  params: RepaymentParams,
  job: Job<AsyncRepaymentJobData>,
  socketService: any,
  userId: string
): Promise<Array<{
  accountId: string;
  transactionId: string;
  receipt: any;
}>> {
  const unfreezeTransactions = [];
  const accountsToProcess = tokenHolders.filter(holder => holder.account !== params.pawnshopAccountId);
  
  await updateProgressWithDetails(
    job, socketService, userId, 'unfreezing', 82,
    `Starting to unfreeze ${accountsToProcess.length} accounts...`,
    { 
      currentStep: 'Unfreezing accounts', 
      completedSteps: 1, 
      totalSteps: 4,
      totalAccounts: accountsToProcess.length,
      processedAccounts: 0
    }
  );

  for (let i = 0; i < accountsToProcess.length; i++) {
    const holder = accountsToProcess[i];
    
    try {
      // Skip unfreezing if holder account is the same as pawnshop account
      if (holder.account === params.pawnshopAccountId) {
        console.log(`Skipping unfreeze for ${holder.account} - same as pawnshop account`);
        continue;
      }

      console.log(`Unfreezing account ${holder.account}... (${i + 1}/${accountsToProcess.length})`);
      
      // Update progress for current account
      await updateProgressWithDetails(
        job, socketService, userId, 'unfreezing', 82 + (i / accountsToProcess.length) * 3,
        `Unfreezing account ${holder.account}...`,
        { 
          currentStep: 'Unfreezing accounts', 
          completedSteps: 1, 
          totalSteps: 4,
          currentAccount: holder.account,
          totalAccounts: accountsToProcess.length,
          processedAccounts: i
        }
      );
      
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

  await updateProgressWithDetails(
    job, socketService, userId, 'unfreezing', 85,
    `Completed unfreezing ${unfreezeTransactions.length} accounts`,
    { 
      currentStep: 'Unfreezing accounts', 
      completedSteps: 1, 
      totalSteps: 4,
      totalAccounts: accountsToProcess.length,
      processedAccounts: accountsToProcess.length
    }
  );

  return unfreezeTransactions;
}

/**
 * Transfer all tokens from holders to pawnshop account
 */
async function transferAllTokensToPawnshop(
  tokenHolders: TokenHolder[], 
  params: RepaymentParams,
  job: Job<AsyncRepaymentJobData>,
  socketService: any,
  userId: string
): Promise<Array<{
  accountId: string;
  serialNumbers: number[];
  transactionId: string;
  receipt: any;
}>> {
  const transferTransactions = [];
  const hederaAccountRepository = new HederaAccountRepository();
  const accountsToProcess = tokenHolders.filter(holder => holder.account !== params.pawnshopAccountId);
  
  // Calculate total tokens to transfer
  const totalTokensToTransfer = accountsToProcess.reduce((sum, holder) => sum + holder.serialNumbers.length, 0);
  let processedTokens = 0;

  await updateProgressWithDetails(
    job, socketService, userId, 'transferring_nfts', 85,
    `Starting to transfer ${totalTokensToTransfer} tokens from ${accountsToProcess.length} accounts...`,
    { 
      currentStep: 'Transferring NFTs', 
      completedSteps: 2, 
      totalSteps: 4,
      totalAccounts: accountsToProcess.length,
      processedAccounts: 0,
      totalTokens: totalTokensToTransfer,
      processedTokens: 0
    }
  );

  for (let i = 0; i < accountsToProcess.length; i++) {
    const holder = accountsToProcess[i];
    
    try {
      // Skip transfer if holder account is the same as pawnshop account
      if (holder.account === params.pawnshopAccountId) {
        console.log(`Skipping transfer for ${holder.account} - same as pawnshop account`);
        continue;
      }

      console.log(`Transferring ${holder.serialNumbers.length} tokens from ${holder.account} to pawnshop... (Account ${i + 1}/${accountsToProcess.length})`);
      
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
      for (let j = 0; j < holder.serialNumbers.length; j++) {
        const serialNumber = holder.serialNumbers[j];
        
        // Update progress for current token
        await updateProgressWithDetails(
          job, socketService, userId, 'transferring_nfts', 85 + (processedTokens / totalTokensToTransfer) * 5,
          `Transferring token ${serialNumber} from ${holder.account}...`,
          { 
            currentStep: 'Transferring NFTs', 
            completedSteps: 2, 
            totalSteps: 4,
            currentAccount: holder.account,
            totalAccounts: accountsToProcess.length,
            processedAccounts: i,
            currentTokens: serialNumber,
            totalTokens: totalTokensToTransfer,
            processedTokens: processedTokens
          }
        );
        
        const result = await hederaTokenRepository.transferToken({
          tokenId: params.tokenId,
          senderAccountId: holder.account,
          senderPrivateKey: decryptedPrivateKey,
          recipientAccountId: process.env.ADMIN_HEDERA_ACCOUNT_ID || '',
          serialNumber: serialNumber
        });

        transferTransactions.push({
          accountId: holder.account,
          serialNumbers: [serialNumber],
          transactionId: result.transactionId,
          receipt: result.receipt
        });

        processedTokens++;
      }

      console.log(`Successfully transferred tokens from ${holder.account}`);
    } catch (error) {
      console.error(`Failed to transfer tokens from ${holder.account}:`, error);
      // Continue with other accounts even if one fails
    }
  }

  await updateProgressWithDetails(
    job, socketService, userId, 'transferring_nfts', 90,
    `Completed transferring ${processedTokens} tokens from ${accountsToProcess.length} accounts`,
    { 
      currentStep: 'Transferring NFTs', 
      completedSteps: 2, 
      totalSteps: 4,
      totalAccounts: accountsToProcess.length,
      processedAccounts: accountsToProcess.length,
      totalTokens: totalTokensToTransfer,
      processedTokens: processedTokens
    }
  );

  return transferTransactions;
}

/**
 * Burn tokens in batches of 5 to avoid BATCH_SIZE_LIMIT_EXCEEDED error
 */
async function burnTokensInBatches(
  allSerialNumbers: number[], 
  params: RepaymentParams,
  job: Job<AsyncRepaymentJobData>,
  socketService: any,
  userId: string
): Promise<Array<{
  transactionId: string;
  receipt: any;
  totalBurned: number;
}>> {
  const burnResults = [];
  const batchSize = 5;
  const totalBatches = Math.ceil(allSerialNumbers.length / batchSize);

  await updateProgressWithDetails(
    job, socketService, userId, 'burning', 90,
    `Starting to burn ${allSerialNumbers.length} tokens in ${totalBatches} batches...`,
    { 
      currentStep: 'Burning tokens', 
      completedSteps: 3, 
      totalSteps: 4,
      totalBatches: totalBatches,
      currentBatch: 0,
      totalTokens: allSerialNumbers.length,
      processedTokens: 0
    }
  );

  // Process serial numbers in batches
  for (let i = 0; i < allSerialNumbers.length; i += batchSize) {
    const batch = allSerialNumbers.slice(i, i + batchSize);
    const batchNumber = Math.floor(i / batchSize) + 1;
    
    try {
      console.log(`Burning batch ${batchNumber}/${totalBatches}: serials ${batch.join(', ')}`);
      
      // Update progress for current batch
      await updateProgressWithDetails(
        job, socketService, userId, 'burning', 90 + (batchNumber / totalBatches) * 5,
        `Burning batch ${batchNumber}/${totalBatches} (${batch.length} tokens)...`,
        { 
          currentStep: 'Burning tokens', 
          completedSteps: 3, 
          totalSteps: 4,
          currentBatch: batchNumber,
          totalBatches: totalBatches,
          totalTokens: allSerialNumbers.length,
          processedTokens: i
        }
      );
      
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

      console.log(`Successfully burned batch ${batchNumber} of ${batch.length} tokens`);
    } catch (error) {
      console.error(`Failed to burn batch ${batchNumber}:`, error);
      // Continue with other batches even if one fails
    }
  }

  const totalBurned = burnResults.reduce((sum, result) => sum + result.totalBurned, 0);
  
  await updateProgressWithDetails(
    job, socketService, userId, 'burning', 95,
    `Completed burning ${totalBurned} tokens in ${burnResults.length} batches`,
    { 
      currentStep: 'Burning tokens', 
      completedSteps: 3, 
      totalSteps: 4,
      totalBatches: totalBatches,
      currentBatch: totalBatches,
      totalTokens: allSerialNumbers.length,
      processedTokens: allSerialNumbers.length
    }
  );

  return burnResults;
}
