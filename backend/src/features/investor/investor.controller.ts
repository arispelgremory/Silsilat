import { Request, Response } from 'express';
import { PrivateKey, TransactionReceipt } from '@hashgraph/sdk';
import { PurchaseTokenSchema, PurchaseTokenResponse, GetInvestorNFTInfoResponse } from './investor.model.js';
import { FungibleToken, TopUpTokenResponse, TopUpTokenSchema } from '../hedera/token/token.model.js';
import { hederaTokenRepository, updateFungibleTokenAmount, getInvestorWalletBalance } from '../hedera/token/token.repository.js';
import { decryptPrivateKey } from '../../util/encryption.js';
import { getUserDataByToken, updateUser } from '../auth/auth.repository.js';
import { tokenPurchaseQueue, JOB_TYPES } from '../../bullmq/scheduler.js';
import { HederaAccountRepository } from '../hedera/account/account.repository.js';
import { mirrorNodeService } from '../hedera/mirror-node/mirror-node.service.js';
import { updateSag, getSagByTokenId } from '../sag/sag.repository.js';
import { eq } from 'drizzle-orm';
import { db } from '@/db/index.js';

export class InvestorController {
  async purchaseToken(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = PurchaseTokenSchema.parse(req.body);
      // Get investor information
      const investorInfo = await getUserDataByToken(req.headers.authorization?.split(' ')[1] || '');
      const investorHederaInfo = await new HederaAccountRepository().getAccount(investorInfo?.accountId || '');
      const investorAccountData = await new HederaAccountRepository().getAccountByHederaId(investorHederaInfo?.hederaAccountId || '');
      // const investorHederaInfo = await new HederaAccountRepository().getAccount('cc2ffd4f-3836-4624-b1e6-f83fdc0d016e');
      // const investorAccountData = await new HederaAccountRepository().getAccountByHederaId('0.0.6867245');
      const investorBalance = await hederaTokenRepository.checkAccountBalance(investorHederaInfo?.hederaAccountId || '', process.env.FUNGIBLE_TOKEN_ID || '');
      const investorBalanceDecimal = parseInt(investorBalance) / 100;
      if (investorBalanceDecimal < validatedData.totalValue) {
        res.status(400).json({
          success: false,
          error: `Investor balance (${investorBalanceDecimal}) is less than the amount to purchase (${validatedData.totalValue})`
        });
        return;
      }

      // Get token information to find the owner (pawnshop)
      const tokenInfo = await hederaTokenRepository.getTokenByTokenId(validatedData.tokenId);
      if (!tokenInfo) {
        throw new Error('Token not found');
      }

      // Get pawnshop account information using the createdBy field from token
      const pawnShopAccountData = await new HederaAccountRepository().getAccountByHederaId(tokenInfo.createdBy);

      if (!pawnShopAccountData) {
        throw new Error('Pawnshop account not found');
      }

      // Get minted NFTs from the pawnshop account using mirror node
      const nftData = await mirrorNodeService.getTokenNFTs(
        validatedData.tokenId,
        tokenInfo.createdBy, // filter by pawnshop account
        validatedData.amount,
        'asc'
      );

      // Extract available serial numbers from minted NFTs
      const availableSerials = nftData.nfts
        .filter(nft => !nft.deleted) // Only include non-deleted NFTs
        .map(nft => nft.serial_number)
        .sort((a, b) => a - b); // Sort in ascending order

      console.log(`Found ${availableSerials.length} available NFTs for token ${validatedData.tokenId} in pawnshop account ${tokenInfo.createdBy}`);

      // Handle amount mismatch scenario
      if (availableSerials.length === 0) {
        throw new Error('No NFTs available for purchase. The pawnshop has no minted NFTs for this token.');
      }

      if (availableSerials.length < validatedData.amount) {
        // If requested amount is more than available, adjust to available amount
        console.log(`Requested amount (${validatedData.amount}) exceeds available supply (${availableSerials.length}). Adjusting to available amount.`);
      }

      // ===== STEP 1: PAYMENT TRANSFER (Fungible Token) =====
      console.log(`Transferring payment: ${validatedData.totalValue} fungible tokens from investor to pawnshop...`);
      
      // Associate fungible token with pawnshop if needed
      try {
        await hederaTokenRepository.associateTokenWithAccount({
          tokenId: process.env.FUNGIBLE_TOKEN_ID || '',
          investorAccountId: tokenInfo.createdBy, // pawnshop account
          investorPrivateKey: PrivateKey.fromStringECDSA(decryptPrivateKey(pawnShopAccountData!.privateKey || '', process.env.ENCRYPTION_MASTER_KEY || ''))
        });
      } catch (error) {
        console.log('Fungible token already associated with pawnshop or association failed:', error);
      }

      // Transfer payment from investor to pawnshop
      const paymentTransferResult = await hederaTokenRepository.transferFungibleToken({
        tokenId: process.env.FUNGIBLE_TOKEN_ID || '',
        senderAccountId: investorHederaInfo?.hederaAccountId || '',
        senderPrivateKey: PrivateKey.fromStringECDSA(decryptPrivateKey(investorAccountData!.privateKey || '', process.env.ENCRYPTION_MASTER_KEY || '')),
        recipientAccountId: process.env.ADMIN_HEDERA_ACCOUNT_ID || '', // pawnshop receives payment
        amount: validatedData.totalValue
      });
      console.log('Payment transfer completed:', paymentTransferResult.transactionId);

      // Use provided serial number or auto-assign from available ones
      let serialNumbers: number[];
      let actualAmount: number;
      
      if (validatedData.serialNumber) {
        // If specific serial number is provided, use it (for single token purchase)
        if (validatedData.amount > 1) {
          throw new Error('Cannot specify both amount > 1 and specific serial number');
        }
        if (!availableSerials.includes(validatedData.serialNumber)) {
          throw new Error(`Serial number ${validatedData.serialNumber} is not available`);
        }
        serialNumbers = [validatedData.serialNumber];
        actualAmount = 1;
      } else {
        // Auto-assign serial numbers from available ones
        actualAmount = Math.min(validatedData.amount, availableSerials.length);
        serialNumbers = availableSerials.slice(0, actualAmount);
      }

      console.log(`Processing purchase: ${actualAmount} NFTs with serial numbers: ${serialNumbers.join(', ')}`);

      // Decrypt the private keys
      const investorPrivateKey = PrivateKey.fromStringECDSA(decryptPrivateKey(investorAccountData!.privateKey || '', process.env.ENCRYPTION_MASTER_KEY || ''));
      const pawnShopPrivateKey = PrivateKey.fromStringECDSA(decryptPrivateKey(pawnShopAccountData!.privateKey || '', process.env.ENCRYPTION_MASTER_KEY || ''));
      // Use the same private key for both pawnshop operations and freeze key
      const freezeKey = pawnShopPrivateKey;

      // ===== STEP 2: NFT DELIVERY =====
      console.log('Starting NFT delivery process...');
      
      // Unfreeze the investor's NFT account (in case it was frozen from previous purchases)
      try {
        const unfreezeResult = await hederaTokenRepository.unfreezeToken({
          tokenId: validatedData.tokenId,
          accountId: investorHederaInfo?.hederaAccountId || '',
          freezeKey
        });
        console.log('Account unfrozen successfully:', unfreezeResult.transactionId);
      } catch (unfreezeError) {
        console.log('Account may not be frozen or unfreeze failed:', unfreezeError);
      }

      // Associate NFT token with investor account
      console.log('Associating NFT token with investor account...');
      const associationResult = await hederaTokenRepository.associateTokenWithAccount({
        tokenId: validatedData.tokenId,
        investorAccountId: investorHederaInfo?.hederaAccountId || '',
        investorPrivateKey
      });
      console.log('Token association completed:', associationResult.associationTransactionId);

      // Define batch size limit
      const BATCH_SIZE = 5;
      
      // Process NFTs in batches
      const batches = [];
      const allSerialNumbers: number[] = [];
      let allSuccessful = true;
      let lastSuccessfulResult: any = null;

      for (let i = 0; i < serialNumbers.length; i += BATCH_SIZE) {
        const batchSerialNumbers = serialNumbers.slice(i, i + BATCH_SIZE);
        const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
        
        console.log(`Processing batch ${batchNumber}: ${batchSerialNumbers.length} NFTs with serial numbers: ${batchSerialNumbers.join(', ')}`);
        
        try {
          const batchResult = await hederaTokenRepository.purchaseToken({
            tokenId: validatedData.tokenId,
            serialNumbers: batchSerialNumbers,
            investorAccountId: investorHederaInfo?.hederaAccountId || '',
            investorPrivateKey,
            pawnShopAccountId: tokenInfo.createdBy,
            pawnShopPrivateKey,
            freezeKey
          });

          batches.push({
            batchNumber,
            serialNumbers: batchSerialNumbers,
            transferTransactionId: batchResult.transferTransactionId,
            transferReceipt: batchResult.transferReceipt,
            success: true
          });

          allSerialNumbers.push(...batchSerialNumbers);
          lastSuccessfulResult = batchResult;
          
          console.log(`Batch ${batchNumber} completed successfully`);
        } catch (batchError) {
          console.error(`Batch ${batchNumber} failed:`, batchError);
          
          batches.push({
            batchNumber,
            serialNumbers: batchSerialNumbers,
            transferTransactionId: '',
            transferReceipt: null,
            success: false,
            error: batchError instanceof Error ? batchError.message : 'Unknown error occurred'
          });
          
          allSuccessful = false;
        }
      }

      const soldShare = validatedData.amount;

      // Get the SAG data first
      const existingSagData = await getSagByTokenId(validatedData.tokenId);
      if (!existingSagData || existingSagData.length === 0) {
        throw new Error('SAG not found for the given token ID');
      }

      // Update the SAG with new soldShare value
      const currentSagProperties = existingSagData[0].sagProperties as any;
      const sagResult = await updateSag(existingSagData[0].sagId, { 
        sagProperties: { 
          ...currentSagProperties, 
          soldShare: (currentSagProperties?.soldShare || 0) + soldShare
        } 
      });
    
      // ===== STEP 3: FREEZE NFT ACCOUNT =====
      let freezeResult: any = null;
      if (allSuccessful && allSerialNumbers.length > 0) {
        try {
          console.log('All batches completed successfully. Freezing token for investor account...');
          freezeResult = await hederaTokenRepository.freezeToken({
            tokenId: validatedData.tokenId,
            accountId: investorHederaInfo?.hederaAccountId || '',
            freezeKey
          });
          console.log('Token frozen successfully');
        } catch (freezeError) {
          console.error('Failed to freeze token:', freezeError);
          // Even if freezing fails, the purchase was successful, so we continue
          // but mark the overall operation as having a warning
        }
      }

      // ===== STEP 4: UPDATE DATABASE =====
      // Query actual balances from Hedera after all transfers
      console.log('Updating database with final balances...');
      
      const [tokenTotalSupply, investorFungibleBalance, pawnshopFungibleBalance] = await Promise.all([
        hederaTokenRepository.checkTokenTotalSupply(process.env.FUNGIBLE_TOKEN_ID || ''),
        hederaTokenRepository.checkAccountBalance(investorHederaInfo?.hederaAccountId || '', process.env.FUNGIBLE_TOKEN_ID || ''),
        hederaTokenRepository.checkAccountBalance(tokenInfo.createdBy, process.env.FUNGIBLE_TOKEN_ID || '')
      ]);

      await db.transaction(async (tx) => {
        // Update fungible token treasury balance (remaining available supply)
        await updateFungibleTokenAmount(
          process.env.FUNGIBLE_TOKEN_ID || '', 
          (tokenTotalSupply.checkTokenTotalSupply / 100).toString(), 
          tx
        );
        
        // Update investor's fungible token balance
        await new HederaAccountRepository().updateAccountBalance(
          investorHederaInfo?.hederaAccountId || '', 
          (parseInt(investorFungibleBalance) / 100).toString(), 
          tx
        );

        // Update pawnshop's fungible token balance (received payment)
        await new HederaAccountRepository().updateAccountBalance(
          tokenInfo.createdBy, 
          (parseInt(pawnshopFungibleBalance) / 100).toString(), 
          tx
        );
      });
      
      console.log('Database updated successfully');

      const response: PurchaseTokenResponse = {
        success: allSuccessful,
        data: {
          tokenId: validatedData.tokenId,
          serialNumbers: allSerialNumbers,
          investorAccountId: investorHederaInfo?.hederaAccountId || '',
          transferTransactionId: lastSuccessfulResult?.transferTransactionId || '',
          freezeTransactionId: freezeResult?.transactionId || '',
          transferReceipt: lastSuccessfulResult?.transferReceipt || null,
          freezeReceipt: freezeResult?.receipt || null,
          associationTransactionId: associationResult.associationTransactionId,
          associationReceipt: associationResult.associationReceipt,
          batches: batches
        }
      };

      // Add warning messages
      if (actualAmount < validatedData.amount) {
        response.data!.warning = `Requested amount (${validatedData.amount}) exceeded available supply (${availableSerials.length}). Processed ${actualAmount} NFTs instead.`;
      }
      
      if (!allSuccessful) {
        const failedBatches = batches.filter(batch => !batch.success);
        response.data!.warning = (response.data!.warning || '') + 
          ` Some batches failed: ${failedBatches.map(b => `Batch ${b.batchNumber}`).join(', ')}.`;
      }

      // Add warning if freezing failed
      if (allSuccessful && allSerialNumbers.length > 0 && !freezeResult) {
        response.data!.warning = (response.data!.warning || '') + 
          ' Token purchase completed but freezing failed. Tokens may still be transferable.';
      }

      res.status(200).json(response);
    } catch (error) {
      console.error('Error purchasing token:', error);
      
      const response: PurchaseTokenResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };

      res.status(500).json(response);
    }
  }

  async getInvestorNFTInfo(req: Request, res: Response): Promise<void> {
    try {
      const investorInfo = await getUserDataByToken(req.headers.authorization?.split(' ')[1] || '');
      const investorHederaInfo = await new HederaAccountRepository().getAccount(investorInfo?.accountId || '');
      const nftInfo = await mirrorNodeService.getAccountNFTInfo(investorHederaInfo?.hederaAccountId || '');
      
      const response: GetInvestorNFTInfoResponse = {
        success: true,
        data: { nfts: nftInfo }
      };

      res.status(200).json(response);
    } catch (error) {
      
      const response: GetInvestorNFTInfoResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };

      res.status(400).json(response);
    }
  }

  async topUpToken(req: Request, res: Response): Promise<void> {
    try { 
      const validatedData = TopUpTokenSchema.parse(req.body);
      const tokenId = process.env.FUNGIBLE_TOKEN_ID;

      if (!tokenId) {
        // Checked in main.ts but check it again for typesafety
        throw new Error('Token is not initialized!');
      }


      const investorInfo = await getUserDataByToken(req.headers.authorization?.split(' ')[1] || '');
      const investorAccountInfo = await new HederaAccountRepository().getAccount(investorInfo?.accountId || '');
      const investorHederaInfo = await new HederaAccountRepository().getAccountByHederaId(investorAccountInfo?.hederaAccountId || '');
      const tokenInfo = await hederaTokenRepository.getFungibleTokenByTokenId(tokenId);
      const tokenCreatorInfo = await new HederaAccountRepository().getAccountByHederaId(tokenInfo?.createdBy || '');
      const tokenCreator = tokenCreatorInfo?.hederaAccountId;
      const privateKeyData = await new HederaAccountRepository().getAccountByHederaId(tokenCreator || '');

      if (!tokenInfo) {
        throw new Error('Token not found');
      }

      // Decrypt the private key (supply key)
      const decryptedPrivateKey = decryptPrivateKey(
        privateKeyData?.privateKey || '', 
        process.env.ENCRYPTION_MASTER_KEY || ''
      );

      // Prepare parameters for minting
      const mintParams = {
        tokenId: tokenId,
        amount: validatedData.amount,
        supplyKey: PrivateKey.fromStringECDSA(decryptedPrivateKey)
      };

      
      let transferResult: {
        transactionId: string;
        receipt: TransactionReceipt | null;
      }  = { transactionId: '', receipt: null };
      let transactionId = '';

      // Update the database with the new supply
      await db.transaction(async (tx) => {
        // Mint the fungible tokens
        const mintResult = await hederaTokenRepository.mintFungibleToken(mintParams);
        
        // Update the fungible token amount in the database
        await updateFungibleTokenAmount(tokenId, mintResult.newTotalSupply, tx);
        // Associate the token with the investor account
        const associateResult = await hederaTokenRepository.associateTokenWithAccount({
          tokenId: tokenId,
          investorAccountId: investorHederaInfo?.hederaAccountId || '',
          investorPrivateKey: PrivateKey.fromStringECDSA(decryptPrivateKey(investorHederaInfo?.privateKey || '', process.env.ENCRYPTION_MASTER_KEY || ''))
        });

        // Transfer the token from token creator to investor
        transferResult = await hederaTokenRepository.transferFungibleToken({ 
          tokenId: tokenId,
          senderAccountId: tokenCreator || '',
          senderPrivateKey: PrivateKey.fromStringECDSA(decryptPrivateKey(tokenCreatorInfo?.privateKey || '', process.env.ENCRYPTION_MASTER_KEY || '')),
          recipientAccountId: investorHederaInfo?.hederaAccountId || '',
          amount: validatedData.amount
        });

        transactionId = transferResult.transactionId;
        // Retrieve the new balances after the transfer
        const rawBalanceInvestor = await hederaTokenRepository.checkAccountBalance(investorHederaInfo?.hederaAccountId || '', tokenInfo.tokenId); // 3000
        const accountBalanceInvestor = parseInt(rawBalanceInvestor) / 100; // Convert raw units to decimal amount
        const rawBalanceCreator = await hederaTokenRepository.checkAccountBalance(tokenCreator || '', tokenInfo.tokenId);
        const accountBalanceCreator = parseInt(rawBalanceCreator) / 100; // Convert raw units to decimal amount
        // Update the investor and creator balances in the database
        await new HederaAccountRepository().updateAccountBalance(investorHederaInfo?.hederaAccountId || '', accountBalanceInvestor.toString(), tx);
        await new HederaAccountRepository().updateAccountBalance(tokenCreatorInfo?.hederaAccountId || '', accountBalanceCreator.toString(), tx);
      });

      const response: TopUpTokenResponse = {
        success: true,
        data: {
          transactionId: transactionId,
          receipt: transferResult ? transferResult.receipt : null
        }
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error top up token:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }

  async getInvestorWalletBalance(req: Request, res: Response): Promise<void> {
    try {
      const investorInfo = await getUserDataByToken(req.headers.authorization?.split(' ')[1] || '');
      const investorHederaInfo = await new HederaAccountRepository().getAccountById(investorInfo?.accountId || '');
      
      const investorBalance = await mirrorNodeService.getAccountFungibleTokenBalance(investorHederaInfo?.hederaAccountId || '', process.env.FUNGIBLE_TOKEN_ID || '');

      res.status(200).json({ success: true, data: { balance: investorBalance } });
    } catch (error) {
      console.error('Error getting investor wallet balance:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' });
    }
  }

  /**
   * Purchase token asynchronously using BullMQ and Socket.IO
   * This method queues the token purchase job and returns immediately
   */
  async purchaseTokenAsync(req: Request, res: Response): Promise<void> {
    try {
      // Validate request body
      const validatedData = PurchaseTokenSchema.parse(req.body);
      
      // Get investor information
      const investorInfo = await getUserDataByToken(req.headers.authorization?.split(' ')[1] || '');
      if (!investorInfo) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized'
        });
        return;
      }

      console.log(`[${new Date().toISOString()}] Queuing async token purchase for token ${validatedData.tokenId} by user ${investorInfo.accountId}`);

      // Queue the token purchase job
      const job = await tokenPurchaseQueue.add(
        JOB_TYPES.PURCHASE_TOKEN,
        {
          tokenId: validatedData.tokenId,
          amount: validatedData.amount,
          totalValue: validatedData.totalValue,
          userId: investorInfo.accountId || '',
          serialNumber: validatedData.serialNumber,
        },
        {
          jobId: `async-token-purchase-${validatedData.tokenId}-${Date.now()}`,
          priority: 1, // Higher priority for manual token purchase
          removeOnComplete: 10, // Keep last 10 completed jobs
          removeOnFail: 5,      // Keep last 5 failed jobs
        }
      );

      // Return immediately with job information
      const response = {
        success: true,
        message: 'Token purchase process queued successfully',
        data: {
          jobId: job.id,
          tokenId: validatedData.tokenId,
          amount: validatedData.amount,
          totalValue: validatedData.totalValue,
          status: 'queued',
          timestamp: new Date().toISOString(),
          estimatedProcessingTime: '2-5 minutes', // Estimated time
        }
      };

      res.status(202).json(response); // 202 Accepted for async processing

    } catch (error) {
      console.error('Error queuing token purchase:', error);
      
      const response = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };

      res.status(400).json(response);
    }
  }
}