import { Job } from 'bullmq'
import { hederaTokenRepository } from '../features/hedera/token/token.repository.js'
import { HederaAccountRepository } from '../features/hedera/account/account.repository.js'
import { decryptPrivateKey } from '../util/encryption.js'
import { PrivateKey } from '@hashgraph/sdk'
import { updateSag, getSagByTokenId } from '../features/sag/sag.repository.js'
import { updateFungibleTokenAmount } from '../features/hedera/token/token.repository.js'
import { db } from '../db/index.js'
import { mirrorNodeService } from '../features/hedera/mirror-node/mirror-node.service.js'
import { getSocketService, TokenPurchaseProgressData } from '../services/socket.service.js'

export interface AsyncTokenPurchaseJobData {
  tokenId: string
  amount: number
  totalValue: number
  userId: string
  serialNumber?: number
}

export interface TokenPurchaseParams {
  tokenId: string
  amount: number
  totalValue: number
  userId: string
  serialNumber?: number
}

export interface TokenPurchaseResult {
  success: boolean
  tokenId: string
  serialNumbers: number[]
  investorAccountId: string
  transferTransactionId?: string
  freezeTransactionId?: string
  associationTransactionId?: string
  batches?: any[]
  error?: string
}

/**
 * Enhanced token purchase processor with Socket.IO progress updates
 */
export async function processAsyncTokenPurchase(job: Job<AsyncTokenPurchaseJobData>): Promise<TokenPurchaseResult> {
  const { tokenId, amount, totalValue, userId, serialNumber } = job.data
  const socketService = getSocketService()
  
  try {
    // Stage 1: Validation (10%)
    await updateProgress(job, socketService, userId, 'validating', 10, 'Validating purchase parameters and user permissions...')
    
    // Get investor information
    const investorInfo = await new HederaAccountRepository().getAccount(userId)
    if (!investorInfo) {
      throw new Error('Investor account not found')
    }

    const investorAccountData = await new HederaAccountRepository().getAccountByHederaId(investorInfo.hederaAccountId || '')
    if (!investorAccountData) {
      throw new Error('Investor account data not found')
    }

    // Stage 2: Check Balance (20%)
    await updateProgress(job, socketService, userId, 'checking_balance', 20, 'Checking wallet balance and available tokens...')
    
    const investorBalance = await hederaTokenRepository.checkAccountBalance(investorInfo.hederaAccountId || '', process.env.FUNGIBLE_TOKEN_ID || '')
    const investorBalanceDecimal = parseInt(investorBalance) / 100
    
    if (investorBalanceDecimal < totalValue) {
      throw new Error(`Insufficient balance: ${investorBalanceDecimal} < ${totalValue}`)
    }

    // Get token information
    const tokenInfo = await hederaTokenRepository.getTokenByTokenId(tokenId)
    if (!tokenInfo) {
      throw new Error('Token not found')
    }

    // Get pawnshop account information
    const pawnShopAccountData = await new HederaAccountRepository().getAccountByHederaId(process.env.ADMIN_HEDERA_ACCOUNT_ID || '')
    if (!pawnShopAccountData) {
      throw new Error('Pawnshop account not found')
    }

    // Get available NFTs
    const nftData = await mirrorNodeService.getTokenNFTs(
      tokenId,
      pawnShopAccountData.hederaAccountId || '',
      amount,
      'asc'
    )

    const availableSerials = nftData.nfts
      .filter(nft => !nft.deleted)
      .map(nft => nft.serial_number)
      .sort((a, b) => a - b)

    if (availableSerials.length === 0) {
      throw new Error('No NFTs available for purchase')
    }

    // Stage 3: Process Payment (30%)
    await updateProgress(job, socketService, userId, 'processing_payment', 30, 'Processing payment transfer to pawnshop...')
    
    // Associate fungible token with pawnshop if needed
    try {
      await hederaTokenRepository.associateTokenWithAccount({
        tokenId: process.env.FUNGIBLE_TOKEN_ID || '',
        investorAccountId: tokenInfo.createdBy,
        investorPrivateKey: PrivateKey.fromStringECDSA(decryptPrivateKey(pawnShopAccountData.privateKey || '', process.env.ENCRYPTION_MASTER_KEY || ''))
      })
    } catch (error) {
      console.log('Fungible token already associated with pawnshop or association failed from async:', error)
    }

    // Transfer payment
    const paymentTransferResult = await hederaTokenRepository.transferFungibleToken({
      tokenId: process.env.FUNGIBLE_TOKEN_ID || '',
      senderAccountId: investorInfo.hederaAccountId || '',
      senderPrivateKey: PrivateKey.fromStringECDSA(decryptPrivateKey(investorAccountData.privateKey || '', process.env.ENCRYPTION_MASTER_KEY || '')),
      recipientAccountId: process.env.ADMIN_HEDERA_ACCOUNT_ID || '',
      amount: totalValue
    })

    // Stage 4: Deliver NFTs (50%)
    await updateProgress(job, socketService, userId, 'delivering_nfts', 50, 'Transferring NFT tokens to your account...')
    
    // Determine serial numbers to process
    let serialNumbers: number[]
    let actualAmount: number
    
    if (serialNumber) {
      if (amount > 1) {
        throw new Error('Cannot specify both amount > 1 and specific serial number')
      }
      if (!availableSerials.includes(serialNumber)) {
        throw new Error(`Serial number ${serialNumber} is not available`)
      }
      serialNumbers = [serialNumber]
      actualAmount = 1
    } else {
      actualAmount = Math.min(amount, availableSerials.length)
      serialNumbers = availableSerials.slice(0, actualAmount)
    }

    // Unfreeze investor account
    const investorPrivateKey = PrivateKey.fromStringECDSA(decryptPrivateKey(investorAccountData.privateKey || '', process.env.ENCRYPTION_MASTER_KEY || ''))
    const pawnShopPrivateKey = PrivateKey.fromStringECDSA(decryptPrivateKey(pawnShopAccountData.privateKey || '', process.env.ENCRYPTION_MASTER_KEY || ''))
    const freezeKey = pawnShopPrivateKey

    try {
      await hederaTokenRepository.unfreezeToken({
        tokenId: tokenId,
        accountId: investorInfo.hederaAccountId || '',
        freezeKey
      })
    } catch (unfreezeError) {
      console.log('Account may not be frozen or unfreeze failed:', unfreezeError)
    }

    // Associate NFT token with investor account
    const associationResult = await hederaTokenRepository.associateTokenWithAccount({
      tokenId: tokenId,
      investorAccountId: investorInfo.hederaAccountId || '',
      investorPrivateKey
    })

    // Process NFTs in batches
    const BATCH_SIZE = 5
    const batches = []
    const allSerialNumbers: number[] = []
    let allSuccessful = true
    let lastSuccessfulResult: any = null

    for (let i = 0; i < serialNumbers.length; i += BATCH_SIZE) {
      const batchSerialNumbers = serialNumbers.slice(i, i + BATCH_SIZE)
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1
      
      // Update progress for each batch
      const batchProgress = 50 + (i / serialNumbers.length) * 30 // 50-80% for NFT delivery
      await updateProgressWithDetails(job, socketService, userId, 'delivering_nfts', batchProgress, 
        `Processing batch ${batchNumber}: ${batchSerialNumbers.length} NFTs`, {
        currentBatch: batchNumber,
        totalBatches: Math.ceil(serialNumbers.length / BATCH_SIZE),
        processedTokens: i,
        totalTokens: serialNumbers.length,
        serialNumbers: batchSerialNumbers
      })
      
      try {
        const batchResult = await hederaTokenRepository.purchaseToken({
          tokenId: tokenId,
          serialNumbers: batchSerialNumbers,
          investorAccountId: investorInfo.hederaAccountId || '',
          investorPrivateKey,
          pawnShopAccountId: process.env.ADMIN_HEDERA_ACCOUNT_ID || '',
          pawnShopPrivateKey,
          freezeKey
        })

        batches.push({
          batchNumber,
          serialNumbers: batchSerialNumbers,
          transferTransactionId: batchResult.transferTransactionId,
          transferReceipt: batchResult.transferReceipt,
          success: true
        })

        allSerialNumbers.push(...batchSerialNumbers)
        lastSuccessfulResult = batchResult
        
      } catch (batchError) {
        console.error(`Batch ${batchNumber} failed:`, batchError)
        
        batches.push({
          batchNumber,
          serialNumbers: batchSerialNumbers,
          transferTransactionId: '',
          transferReceipt: null,
          success: false,
          error: batchError instanceof Error ? batchError.message : 'Unknown error occurred'
        })
        
        allSuccessful = false
      }
    }

    // Stage 5: Freeze Tokens (85%)
    let freezeResult: any = null
    if (allSuccessful && allSerialNumbers.length > 0) {
      await updateProgress(job, socketService, userId, 'freezing_tokens', 85, 'Securing tokens in your account...')
      
      try {
        freezeResult = await hederaTokenRepository.freezeToken({
          tokenId: tokenId,
          accountId: investorInfo.hederaAccountId || '',
          freezeKey
        })
      } catch (freezeError) {
        console.error('Failed to freeze token:', freezeError)
      }
    }

    // Stage 6: Update Database (95%)
    await updateProgress(job, socketService, userId, 'updating_database', 95, 'Updating system records and balances...')
    
    // Update SAG soldShare
    const existingSagData = await getSagByTokenId(tokenId)
    if (existingSagData && existingSagData.length > 0) {
      const currentSagProperties = existingSagData[0].sagProperties as any
      await updateSag(existingSagData[0].sagId, { 
        sagProperties: { 
          ...currentSagProperties, 
          soldShare: (currentSagProperties?.soldShare || 0) + actualAmount
        } 
      })
    }

    // Update balances
    const [tokenTotalSupply, investorFungibleBalance, pawnshopFungibleBalance] = await Promise.all([
      hederaTokenRepository.checkTokenTotalSupply(process.env.FUNGIBLE_TOKEN_ID || ''),
      hederaTokenRepository.checkAccountBalance(investorInfo.hederaAccountId || '', process.env.FUNGIBLE_TOKEN_ID || ''),
      hederaTokenRepository.checkAccountBalance(process.env.ADMIN_HEDERA_ACCOUNT_ID || '', process.env.FUNGIBLE_TOKEN_ID || '')
    ])

    await db.transaction(async (tx) => {
      await updateFungibleTokenAmount(
        process.env.FUNGIBLE_TOKEN_ID || '', 
        (tokenTotalSupply.checkTokenTotalSupply / 100).toString(), 
        tx
      )
      
      await new HederaAccountRepository().updateAccountBalance(
        investorInfo.hederaAccountId || '', 
        (parseInt(investorFungibleBalance) / 100).toString(), 
        tx
      )

      await new HederaAccountRepository().updateAccountBalance(
        process.env.ADMIN_HEDERA_ACCOUNT_ID || '', 
        (parseInt(pawnshopFungibleBalance) / 100).toString(), 
        tx
      )
    })

    // Stage 7: Complete (100%)
    await updateProgress(job, socketService, userId, 'complete', 100, 'Token purchase completed successfully!')

    // Emit completion event
    socketService.emitTokenPurchaseComplete(userId, {
      jobId: job.id || '',
      tokenId: tokenId,
      serialNumbers: allSerialNumbers,
      investorAccountId: investorInfo.hederaAccountId || '',
      timestamp: new Date().toISOString(),
      data: {
        transferTransactionId: lastSuccessfulResult?.transferTransactionId,
        freezeTransactionId: freezeResult?.transactionId,
        associationTransactionId: associationResult.associationTransactionId,
        batches: batches
      }
    })

    return {
      success: allSuccessful,
      tokenId: tokenId,
      serialNumbers: allSerialNumbers,
      investorAccountId: investorInfo.hederaAccountId || '',
      transferTransactionId: lastSuccessfulResult?.transferTransactionId,
      freezeTransactionId: freezeResult?.transactionId,
      associationTransactionId: associationResult.associationTransactionId,
      batches: batches
    }

  } catch (error) {
    console.error('Error processing async token purchase:', error)
    
    // Emit error event
    socketService.emitTokenPurchaseError(userId, {
      jobId: job.id || '',
      tokenId: tokenId,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    })

    return {
      success: false,
      tokenId: tokenId,
      serialNumbers: [],
      investorAccountId: '',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Update job progress and emit Socket.IO event
 */
async function updateProgress(
  job: Job<AsyncTokenPurchaseJobData>,
  socketService: any,
  userId: string,
  stage: TokenPurchaseProgressData['stage'],
  progress: number,
  message: string
): Promise<void> {
  await job.updateProgress(progress)
  
  const progressData: TokenPurchaseProgressData = {
    jobId: job.id || '',
    tokenId: job.data.tokenId,
    stage,
    progress,
    message,
    timestamp: new Date().toISOString(),
  }
  
  socketService.emitTokenPurchaseProgress(userId, progressData)
}

/**
 * Update job progress with detailed information
 */
async function updateProgressWithDetails(
  job: Job<AsyncTokenPurchaseJobData>,
  socketService: any,
  userId: string,
  stage: TokenPurchaseProgressData['stage'],
  progress: number,
  message: string,
  details?: TokenPurchaseProgressData['details']
): Promise<void> {
  await job.updateProgress(progress)
  
  const progressData: TokenPurchaseProgressData = {
    jobId: job.id || '',
    tokenId: job.data.tokenId,
    stage,
    progress,
    message,
    timestamp: new Date().toISOString(),
    details
  }
  
  socketService.emitTokenPurchaseProgress(userId, progressData)
}

