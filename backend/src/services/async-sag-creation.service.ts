import { Job } from 'bullmq';
import { hederaTokenRepository } from '../features/hedera/token/token.repository.js';
import { HederaAccountRepository } from '../features/hedera/account/account.repository.js';
import { decryptPrivateKey } from '../util/encryption.js';
import { PrivateKey, PublicKey } from '@hashgraph/sdk';
import { createSag } from '../features/sag/sag.repository.js';
import { SagModel } from '../features/sag/sag.model.js';
import { db } from '../db/index.js';
import { getSocketService, SagCreationProgressData, SagCreationCompleteData } from '../services/socket.service.js';
import { uploadJsonToIpfs } from '../util/ipfs-upload.js';
import { eq } from 'drizzle-orm';
import { SagSchema } from '../features/sag/sag.model.js';
import { TokenRepository } from '../features/hedera/token/token.repository.js';
import { callGoldEvaluator, GoldEvaluatorOutput } from '../util/gold-evaluator.js';

export interface AsyncSagCreationJobData {
  sagData: any; // Parsed SagSchema data
  userId: string; // User who initiated the SAG creation
}

export interface SagCreationParams {
  sagData: any;
  hederaAccountId: string;
  privateKey: PrivateKey;
  publicKey: PublicKey;
}

export interface SagCreationResult {
  success: boolean;
  sagId?: string;
  tokenId?: string;
  transactionId?: string;
  totalMinted?: number;
  totalBatches?: number;
  serialNumbers?: number[];
  error?: string;
}

/**
 * Enhanced SAG creation processor with Socket.IO progress updates
 */
export async function processAsyncSagCreation(job: Job<AsyncSagCreationJobData>): Promise<SagCreationResult> {
  const { sagData, userId } = job.data; // userId is current login user id
  const socketService = getSocketService();
  
  try {
    // Stage 1: Validation (10%)
    await updateProgress(job, socketService, userId, 'validating', 10, 'Validating SAG data and checking permissions...');
    
    // Validate SAG data
    const validatedSagData = SagSchema.parse(sagData);
    
    // Get user's Hedera account info
    // const hederaInfo = await new HederaAccountRepository().getAccount(userId);
    // if (!hederaInfo) {
    //   throw new Error('User Hedera account not found');
    // }

    // Get private key data
    const adminHederaAccountData = await new HederaAccountRepository().getAccountByHederaId(process.env.ADMIN_HEDERA_ACCOUNT_ID || '');
    if (!adminHederaAccountData) {
      throw new Error('Private key not found for user account');
    }

    // const pawnshopAccountData = await new HederaAccountRepository().getAccount(userId || '');
    const pawnshopHederaAccountData = await new HederaAccountRepository().getAccountById(userId || '');
    console.log("Pawnshop Hedera account id:", pawnshopHederaAccountData?.hederaAccountId);
    if (!pawnshopHederaAccountData) {
      throw new Error('Private key not found for pawnshop account');
    }

    // Decrypt private keys 
    const adminPrivateKey = decryptPrivateKey(adminHederaAccountData.privateKey || '', process.env.ENCRYPTION_MASTER_KEY || '');
    const decryptedAdminPrivateKey = PrivateKey.fromStringECDSA(adminPrivateKey);
    const pawnshopPrivateKey = decryptPrivateKey(pawnshopHederaAccountData.privateKey || '', process.env.ENCRYPTION_MASTER_KEY || '');
    const decryptedPawnshopPrivateKey = PrivateKey.fromStringECDSA(pawnshopPrivateKey);
    const adminPublicKey = PublicKey.fromString(adminHederaAccountData.publicKey);
    const pawnshopPublicKey = PublicKey.fromString(pawnshopHederaAccountData.publicKey);

    // Use provided account ID or default to user's account
    const finalHederaAccountId = adminHederaAccountData.hederaAccountId || '';

    // Prepare gold evaluation data
    const goldEvaluateJson = {
      "principal_myr": validatedSagData.sagProperties.loan,
      "gold_weight_g": validatedSagData.sagProperties.weightG,
      "purity": validatedSagData.sagProperties.purity,
      "tenure_days": validatedSagData.sagProperties.tenorM * 30
    };

    // Stage 2: Execute all operations in a single transaction (20-90%)
    await updateProgress(job, socketService, userId, 'processing', 20, 'Processing SAG creation in transaction...');
    
    let sagResult: any = null;
    let tokenCreateResult: any = null;
    let tokenMintResult: any = null;
    let goldEvaluateResult: any = null;
    const tokenRepository = new TokenRepository();

    // Check platform(admin) balance first
    const rawBalancePawnshop = await hederaTokenRepository.checkAccountBalance(adminHederaAccountData.hederaAccountId || '', process.env.FUNGIBLE_TOKEN_ID || '');
    const pawnshopBalance = parseInt(rawBalancePawnshop) / 100;
    console.log('Pawnshop balance:', pawnshopBalance);
    if (pawnshopBalance < validatedSagData.sagProperties.valuation) {
      throw new Error('Pawnshop balance is less than the valuation amount, please top up your balance');
    }

    // Transfer sag valuation to pawnshop
    const fungibleTokenId = process.env.FUNGIBLE_TOKEN_ID || '';
    if (!fungibleTokenId) {
      throw new Error('Fungible token ID not configured');
    }
    
    let transferSagValuationResult: any = null;
    let transferReversed = false;
    let associateTokenResult: any = null;
 
    try {
      associateTokenResult = await hederaTokenRepository.associateTokenWithAccount({
        tokenId: fungibleTokenId,
        investorAccountId: pawnshopHederaAccountData.hederaAccountId || '',
        investorPrivateKey: decryptedPawnshopPrivateKey
      });

      transferSagValuationResult = await hederaTokenRepository.transferFungibleToken({ 
        tokenId: fungibleTokenId,
        senderAccountId: adminHederaAccountData.hederaAccountId || '',
        senderPrivateKey: decryptedAdminPrivateKey,
        recipientAccountId: pawnshopHederaAccountData.hederaAccountId || '',
        amount: validatedSagData.sagProperties.valuation
      });

      console.log('Transfer sag valuation to pawnshop completed:', transferSagValuationResult.transactionId);

      // Now create SAG record within database transaction
      await db.transaction(async (tx) => {
        await updateProgress(job, socketService, userId, 'creating_sag', 30, 'Creating SAG record in database...');
        sagResult = await createSag({...validatedSagData, tokenId: '', originalOwner: userId}, tx);
        if (!sagResult) {
          throw new Error('Failed to create SAG record in database');
        }

      // Create token
      await updateProgress(job, socketService, userId, 'creating_token', 40, 'Creating Hedera token...');
      tokenCreateResult = await tokenRepository.createToken({
        name: validatedSagData.sagName,
        symbol: validatedSagData.sagName.substring(0, 3).toUpperCase(),
        treasuryAccountId: finalHederaAccountId,
        treasuryPrivateKey: decryptedAdminPrivateKey,
        expiredAt: new Date(validatedSagData.expiredAt || '').toISOString(),
        adminKey: adminPublicKey,
        supplyKey: adminPublicKey,
        freezeKey: adminPublicKey,
        wipeKey: adminPublicKey,
      }, userId);

      // Upload metadata to IPFS
      await updateProgress(job, socketService, userId, 'uploading_metadata', 50, 'Uploading SAG metadata to IPFS...');
      const ipfsMetadata = await uploadJsonToIpfs(validatedSagData.sagProperties);
      
      // Mint tokens concurrently
      await updateProgress(job, socketService, userId, 'minting_tokens', 60, 'Minting NFTs concurrently...');
      tokenMintResult = await tokenRepository.mintTokenConcurrently({
        tokenId: tokenCreateResult.tokenId,
        amount: validatedSagData.sagProperties.mintShare,
        supplyKey: decryptedAdminPrivateKey,
        metadata: ipfsMetadata,
      });

      // Call gold evaluator
      await updateProgress(job, socketService, userId, 'evaluating_gold', 70, 'Evaluating gold properties...');
      goldEvaluateResult = await callGoldEvaluator(goldEvaluateJson);

      // Update SAG with token ID and gold evaluation results
      await updateProgress(job, socketService, userId, 'updating_sag', 80, 'Updating SAG with token and evaluation information...');
      await tx.update(SagModel).set({
        tokenId: tokenCreateResult?.tokenId || '',
        sagProperties: {
          ...validatedSagData.sagProperties,
          risk_level: goldEvaluateResult!.metrics.risk_level,
          ltv: goldEvaluateResult!.metrics.ltv,
          action: goldEvaluateResult!.recommendation.action,
          rationale: goldEvaluateResult!.recommendation.rationale,
          eval_id: goldEvaluateResult!.eval_id
        }
      }).where(eq(SagModel.sagId, sagResult[0].sagId));
      // Update pawnshop balance (only once, after all transfers)
      const updatedPawnshopBalance = await hederaTokenRepository.checkAccountBalance(pawnshopHederaAccountData.hederaAccountId || '', fungibleTokenId);
      const pawnshopBalanceDecimal = parseInt(updatedPawnshopBalance) / 100;
      console.log('Final pawnshop balance:', pawnshopBalanceDecimal);
      await new HederaAccountRepository().updateAccountBalance(pawnshopHederaAccountData.hederaAccountId || '', pawnshopBalanceDecimal.toString(), tx);

      // Update Platform(admin) balance)
      const updatedAdminBalance = await hederaTokenRepository.checkAccountBalance(adminHederaAccountData.hederaAccountId || '', fungibleTokenId);
      const adminBalanceDecimal = parseInt(updatedAdminBalance) / 100;
      console.log('Final admin balance:', adminBalanceDecimal);
      await new HederaAccountRepository().updateAccountBalance(adminHederaAccountData.hederaAccountId || '', adminBalanceDecimal.toString(), tx);
      
      });

      

    } catch (error) {
      console.error('SAG creation failed after token transfer:', error);
      
      // If transfer was successful but SAG creation failed, reverse the transfer
      if (transferSagValuationResult && !transferReversed) {
        try {
          console.log('Attempting to reverse token transfer due to SAG creation failure...');
          await hederaTokenRepository.transferFungibleToken({
            tokenId: fungibleTokenId,
            senderAccountId: pawnshopHederaAccountData.hederaAccountId || '',
            senderPrivateKey: decryptedPawnshopPrivateKey,
            recipientAccountId: adminHederaAccountData.hederaAccountId || '',
            amount: validatedSagData.sagProperties.valuation
          });
          transferReversed = true;
          console.log('Token transfer successfully reversed');
        } catch (reverseError) {
          console.error('Failed to reverse token transfer:', reverseError);
          // Log this critical error for manual intervention
          console.error('CRITICAL: Token transfer could not be reversed. Manual intervention required.');
          console.error('Transfer details:', {
            originalTransactionId: transferSagValuationResult.transactionId,
            amount: validatedSagData.sagProperties.valuation,
            from: adminHederaAccountData.hederaAccountId,
            to: pawnshopHederaAccountData.hederaAccountId
          });
        }
      }
      
      throw error; // Re-throw the original error
    }

    // Stage 3: Complete (100%)
    await updateProgress(job, socketService, userId, 'complete', 100, 'SAG creation completed successfully!');
    
    const completeData: SagCreationCompleteData = {
      jobId: job.id || '',
      sagId: sagResult[0].sagId,
      success: true,
      data: {
        sag: sagResult,
        token: {
          tokenId: tokenCreateResult?.tokenId,
          transactionId: tokenCreateResult?.transactionId
        },
        minting: {
          totalProcessed: tokenMintResult?.totalProcessed || 0,
          totalFailed: tokenMintResult?.totalFailed || 0,
          batches: tokenMintResult?.batches.length || 0,
          serialNumbers: tokenMintResult?.serialNumbers || [],
          summary: `Successfully minted ${tokenMintResult?.totalProcessed || 0} NFTs using ${tokenMintResult?.batches.length || 0} batches`
        },
        goldEvaluation: {
          risk_level: goldEvaluateResult!.metrics.risk_level,
          ltv: goldEvaluateResult!.metrics.ltv,
          collateral_value_myr: goldEvaluateResult!.metrics.collateral_value_myr,
          action: goldEvaluateResult!.recommendation.action,
          rationale: goldEvaluateResult!.recommendation.rationale,
          eval_id: goldEvaluateResult!.eval_id
        }
      },
      timestamp: new Date().toISOString(),
    };

    socketService.emitSagCreationComplete(userId, completeData);

    console.log(`SAG creation completed for ${validatedSagData.sagName}: SUCCESS`);
    
    return {
      success: true,
      sagId: sagResult[0].sagId,
      tokenId: tokenCreateResult?.tokenId,
      transactionId: tokenCreateResult?.transactionId,
      totalMinted: tokenMintResult?.totalProcessed || 0,
      totalBatches: tokenMintResult?.batches.length || 0,
      serialNumbers: tokenMintResult?.serialNumbers || [],
    };
    
  } catch (error) {
    console.error(`Error creating SAG:`, error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Emit error to user
    socketService.emitSagCreationError(userId, errorMessage);
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Mint tokens concurrently with detailed progress tracking
 */
async function mintTokensConcurrently(
  tokenId: string,
  amount: number,
  supplyKey: PrivateKey,
  metadata: string,
  job: Job<AsyncSagCreationJobData>,
  socketService: any,
  userId: string
): Promise<any> {
  const tokenRepository = new TokenRepository();
  
  // Calculate batch information
  const batchSize = 10; // Mint 10 tokens per batch
  const totalBatches = Math.ceil(amount / batchSize);
  
  await updateProgressWithDetails(
    job, socketService, userId, 'minting_tokens', 80,
    `Starting to mint ${amount} tokens in ${totalBatches} batches...`,
    { 
      currentStep: 'Minting tokens', 
      completedSteps: 4, 
      totalSteps: 6,
      totalBatches: totalBatches,
      currentBatch: 0,
      totalTokens: amount,
      processedTokens: 0
    }
  );

  const batches = [];
  const serialNumbers = [];
  let totalProcessed = 0;
  let totalFailed = 0;

  // Process tokens in batches
  for (let i = 0; i < amount; i += batchSize) {
    const batchAmount = Math.min(batchSize, amount - i);
    const batchNumber = Math.floor(i / batchSize) + 1;
    
    try {
      console.log(`Minting batch ${batchNumber}/${totalBatches}: ${batchAmount} tokens...`);
      
      // Update progress for current batch
      await updateProgressWithDetails(
        job, socketService, userId, 'minting_tokens', 80 + (batchNumber / totalBatches) * 10,
        `Minting batch ${batchNumber}/${totalBatches} (${batchAmount} tokens)...`,
        { 
          currentStep: 'Minting tokens', 
          completedSteps: 4, 
          totalSteps: 6,
          currentBatch: batchNumber,
          totalBatches: totalBatches,
          totalTokens: amount,
          processedTokens: i
        }
      );
      
      const result = await tokenRepository.mintTokenConcurrently({
        tokenId: tokenId,
        amount: batchAmount,
        supplyKey: supplyKey,
        metadata: metadata,
      });

      batches.push(result);
      serialNumbers.push(...result.serialNumbers);
      totalProcessed += result.totalProcessed;
      totalFailed += result.totalFailed;

      console.log(`Successfully minted batch ${batchNumber} of ${batchAmount} tokens`);
    } catch (error) {
      console.error(`Failed to mint batch ${batchNumber}:`, error);
      totalFailed += batchAmount;
      // Continue with other batches even if one fails
    }
  }

  await updateProgressWithDetails(
    job, socketService, userId, 'minting_tokens', 90,
    `Completed minting ${totalProcessed} tokens in ${batches.length} batches`,
    { 
      currentStep: 'Minting tokens', 
      completedSteps: 4, 
      totalSteps: 6,
      totalBatches: totalBatches,
      currentBatch: totalBatches,
      totalTokens: amount,
      processedTokens: amount
    }
  );

  return {
    batches,
    serialNumbers,
    totalProcessed,
    totalFailed
  };
}

/**
 * Update job progress and emit Socket.IO event
 */
async function updateProgress(
  job: Job<AsyncSagCreationJobData>,
  socketService: any,
  userId: string,
  stage: SagCreationProgressData['stage'],
  progress: number,
  message: string
): Promise<void> {
  // Update job progress
  await job.updateProgress(progress);
  
  // Emit progress update via Socket.IO
  const progressData: SagCreationProgressData = {
    jobId: job.id || '',
    sagId: job.data.sagData.sagName || '',
    stage,
    progress,
    message,
    timestamp: new Date().toISOString(),
  };
  
  socketService.emitSagCreationProgress(userId, progressData);
}

/**
 * Update job progress with detailed information
 */
async function updateProgressWithDetails(
  job: Job<AsyncSagCreationJobData>,
  socketService: any,
  userId: string,
  stage: SagCreationProgressData['stage'],
  progress: number,
  message: string,
  details?: SagCreationProgressData['details']
): Promise<void> {
  // Update job progress
  await job.updateProgress(progress);
  
  // Emit progress update via Socket.IO
  const progressData: SagCreationProgressData = {
    jobId: job.id || '',
    sagId: job.data.sagData.sagName || '',
    stage,
    progress,
    message,
    details,
    timestamp: new Date().toISOString(),
  };
  
  socketService.emitSagCreationProgress(userId, progressData);
}
