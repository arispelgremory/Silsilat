import { 
  TokenMintTransaction, 
  TokenId, 
  Hbar, 
  TransactionResponse, 
  TransactionReceipt,
  PrivateKey 
} from '@hashgraph/sdk';
import { HederaClient } from '../features/hedera/hedera.client.js';

interface ConcurrentMintParams {
  tokenId: string;
  amount: number;
  supplyKey: string; // Serialized private key
  metadata?: string;
  maxConcurrentWorkers?: number;
}

interface ConcurrentMintResult {
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
}

interface BatchResult {
  batchNumber: number;
  serialNumbers: number[];
  transactionId: string;
  receipt: TransactionReceipt;
  success: boolean;
  error?: string;
}

export class ConcurrentMintService {
  private readonly maxConcurrentWorkers: number;
  private readonly batchSize: number = 5; // Hedera limit
  private hederaClient: HederaClient;

  constructor(maxConcurrentWorkers: number = 5) {
    this.maxConcurrentWorkers = maxConcurrentWorkers;
    this.hederaClient = new HederaClient();
  }

  async mintConcurrently(params: ConcurrentMintParams): Promise<ConcurrentMintResult> {
    const { tokenId, amount, supplyKey, metadata, maxConcurrentWorkers = this.maxConcurrentWorkers } = params;
    
    // Calculate number of batches needed
    const totalBatches = Math.ceil(amount / this.batchSize);
    const batches: Array<{ batchNumber: number; batchSize: number }> = [];
    
    for (let i = 0; i < totalBatches; i++) {
      const remaining = amount - (i * this.batchSize);
      const currentBatchSize = Math.min(this.batchSize, remaining);
      batches.push({ batchNumber: i + 1, batchSize: currentBatchSize });
    }

    // Process batches in chunks of maxConcurrentWorkers
    const results: BatchResult[] = [];
    
    for (let i = 0; i < batches.length; i += maxConcurrentWorkers) {
      const batchChunk = batches.slice(i, i + maxConcurrentWorkers);
      
      // Process this chunk of batches concurrently
      const chunkPromises = batchChunk.map(batch => 
        this.mintBatch(tokenId, batch.batchSize, supplyKey, metadata, batch.batchNumber)
      );
      
      const chunkResults = await Promise.allSettled(chunkPromises);
      
      // Process results
      chunkResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
          if (result.value.success) {
            console.log(`  Serial numbers: ${result.value.serialNumbers.join(', ')}`);
          } else {
            console.log(`  Error: ${result.value.error}`);
          }
        } else {
          const batchNumber = batchChunk[index].batchNumber;
          results.push({
            batchNumber,
            serialNumbers: [],
            transactionId: '',
            receipt: {} as TransactionReceipt,
            success: false,
            error: result.reason instanceof Error ? result.reason.message : 'Unknown error'
          });
          console.log(`Batch ${batchNumber} failed: ${result.reason}`);
        }
      });
    }

    // Process results
    const successfulBatches = results.filter(r => r.success);
    const failedBatches = results.filter(r => !r.success);
    
    const allSerialNumbers: number[] = [];
    const transactionIds: string[] = [];
    const receipts: TransactionReceipt[] = [];

    successfulBatches.forEach(result => {
      allSerialNumbers.push(...result.serialNumbers);
      transactionIds.push(result.transactionId);
      receipts.push(result.receipt);
    });

    const sortedResults = results.sort((a, b) => a.batchNumber - b.batchNumber);

    return {
      serialNumbers: allSerialNumbers,
      transactionIds,
      receipts,
      batches: sortedResults,
      success: failedBatches.length === 0,
      totalProcessed: allSerialNumbers.length,
      totalFailed: failedBatches.length
    };
  }

  private async mintBatch(
    tokenId: string, 
    batchSize: number, 
    supplyKey: string, 
    metadata: string | undefined, 
    batchNumber: number
  ): Promise<BatchResult> {
    try {
      const client = this.hederaClient.getClient();
      
      // Deserialize the private key
      const privateKey = PrivateKey.fromStringECDSA(supplyKey);

      // Build transaction for this batch
      const tokenMintTransaction = new TokenMintTransaction()
        .setTokenId(TokenId.fromString(tokenId))
        .setMaxTransactionFee(new Hbar(30));

      if (metadata) {
        const cidList: Buffer[] = [];
        for (let i = 0; i < batchSize; i++) {
          cidList.push(Buffer.from(metadata));
        }
        tokenMintTransaction.setMetadata(cidList);
      }

      // Retry strategy for transient errors
      const maxRetries = 5;
      let attempt = 0;
      const baseDelayMs = 500;

      while (true) {
        try {
          tokenMintTransaction.freezeWith(client);
          tokenMintTransaction.sign(privateKey);

          const transactionResponse: TransactionResponse = await tokenMintTransaction.execute(client);
          const receipt: TransactionReceipt = await transactionResponse.getReceipt(client);

          const serialNumbers = receipt.serials || [];
          if (serialNumbers.length === 0) {
            throw new Error('Token minting failed - no serial numbers returned');
          }

          return {
            batchNumber,
            serialNumbers: serialNumbers.map(sn => Number(sn)),
            transactionId: transactionResponse.transactionId.toString(),
            receipt,
            success: true
          };
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
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          throw new Error(`Failed to mint batch ${batchNumber}: ${message}`);
        }
      }
    } catch (error) {
      return {
        batchNumber,
        serialNumbers: [],
        transactionId: '',
        receipt: {} as TransactionReceipt,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}