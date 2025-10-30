import { Queue, Worker, Job } from 'bullmq';
import { hederaTokenRepository } from '../features/hedera/token/token.repository.js';
import { pawnshopController } from '../features/pawnshop/pawnshop.controller.js';
import { HederaAccountRepository } from '../features/hedera/account/account.repository.js';
import { decryptPrivateKey } from '../util/encryption.js';
import { PrivateKey } from '@hashgraph/sdk';
import { updateSag } from '../features/sag/sag.repository.js';
import { processAsyncRepayment, AsyncRepaymentJobData } from '../services/async-repayment.service.js';
import { processAsyncSagCreation, AsyncSagCreationJobData } from '../services/async-sag-creation.service.js';
import { processAsyncTokenPurchase, AsyncTokenPurchaseJobData } from '../services/async-token-purchase.service.js';
import { processGoldPriceJob, GoldPriceJobData } from '../services/async-gold-price.service.js';

// Redis connection configuration
const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
};

// Queue names
export const QUEUE_NAMES = {
  REPAYMENT: 'repayment-queue',
  SAG_CREATION: 'sag-creation-queue',
  TOKEN_PURCHASE: 'token-purchase-queue',
  SCHEDULER: 'token-scheduler-queue',
  GOLD_PRICE: 'gold-price-queue'
} as const;

// Job types
export const JOB_TYPES = {
  DAILY_TOKEN_CHECK: 'daily-token-check',
  PROCESS_REPAYMENT: 'process-repayment',
  CREATE_SAG: 'create-sag',
  PURCHASE_TOKEN: 'purchase-token',
  FETCH_GOLD_PRICE: 'fetch-gold-price'
} as const;

// Repayment job data interface
export interface RepaymentJobData {
  tokenId: string;
  expiredAt: Date;
  createdBy: string;
  sagId?: string;
  pawnshopAccountId?: string;
}

// Create queues
export const repaymentQueue = new Queue(QUEUE_NAMES.REPAYMENT, {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 50,      // Keep last 50 failed jobs
    attempts: 3,           // Retry failed jobs 3 times
    backoff: {
      type: 'exponential',
      delay: 2000,         // Start with 2 second delay
    },
  },
});

export const sagCreationQueue = new Queue(QUEUE_NAMES.SAG_CREATION, {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: 50,  // Keep last 50 completed jobs
    removeOnFail: 25,      // Keep last 25 failed jobs
    attempts: 2,           // Retry failed jobs 2 times
    backoff: {
      type: 'exponential',
      delay: 3000,         // Start with 3 second delay
    },
  },
});

export const tokenPurchaseQueue = new Queue(QUEUE_NAMES.TOKEN_PURCHASE, {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 50,      // Keep last 50 failed jobs
    attempts: 3,           // Retry failed jobs 3 times
    backoff: {
      type: 'exponential',
      delay: 2000,         // Start with 2 second delay
    },
  },
});

export const schedulerQueue = new Queue(QUEUE_NAMES.SCHEDULER, {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 5,
    attempts: 2,
  },
});

export const goldPriceQueue = new Queue(QUEUE_NAMES.GOLD_PRICE, {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: 30,  // Keep last 30 completed jobs
    removeOnFail: 15,      // Keep last 15 failed jobs
    attempts: 3,           // Retry failed jobs 3 times
    backoff: {
      type: 'exponential',
      delay: 2000,         // Start with 2 second delay
    },
  },
});

// Note: QueueScheduler is not needed in BullMQ v5 for delayed jobs

/**
 * Daily token expiration checker worker
 * Runs at 12:00 AM UTC+8 every day
 */
export const schedulerWorker = new Worker(
  QUEUE_NAMES.SCHEDULER,
  async (job: Job) => {
    const isManual = job.data?.manual === true;
    const force = job.data?.force === true;
    
    console.log(`[${new Date().toISOString()}] Starting ${isManual ? 'manual' : 'automatic'} daily token expiration check...`);
    
    try {
      // Get tokens expiring today
      const tokensExpiringToday = await hederaTokenRepository.getTokensExpiringToday();
      
      console.log(`Found ${tokensExpiringToday.length} tokens expiring today`);
      
      if (tokensExpiringToday.length === 0 && !force) {
        console.log('No tokens expiring today, skipping scheduling');
        return { 
          message: 'No tokens expiring today', 
          scheduledJobs: 0,
          isManual,
          force 
        };
      }
      
      if (force && tokensExpiringToday.length === 0) {
        console.log('Force mode enabled but no tokens expiring today');
        return { 
          message: 'Force mode enabled but no tokens expiring today', 
          scheduledJobs: 0,
          isManual,
          force 
        };
      }
      
      let scheduledJobs = 0;
      
      // Schedule repayment jobs for each token at their exact expiration time
      for (const token of tokensExpiringToday) {
        try {
          // Calculate delay until expiration time
          const now = new Date();
          const expirationTime = new Date(token.expiredAt);
          const delay = expirationTime.getTime() - now.getTime();
          
          // Only schedule if expiration is in the future
          if (delay > 0) {
            const jobData: RepaymentJobData = {
              tokenId: token.tokenId,
              expiredAt: token.expiredAt,
              createdBy: token.createdBy,
            };
            
            // Schedule the repayment job to run at the exact expiration time
            await repaymentQueue.add(
              JOB_TYPES.PROCESS_REPAYMENT,
              jobData,
              {
                delay,
                jobId: `repayment-${token.tokenId}-${expirationTime.getTime()}`, // Unique job ID
              }
            );
            
            console.log(`Scheduled repayment for token ${token.tokenId} at ${expirationTime.toISOString()}`);
            scheduledJobs++;
          } else {
            console.log(`Token ${token.tokenId} has already expired, processing immediately`);
            
            // Process immediately if already expired
            const jobData: RepaymentJobData = {
              tokenId: token.tokenId,
              expiredAt: token.expiredAt,
              createdBy: token.createdBy,
            };
            
            await repaymentQueue.add(
              JOB_TYPES.PROCESS_REPAYMENT,
              jobData,
              {
                jobId: `repayment-${token.tokenId}-immediate-${Date.now()}`,
              }
            );
            
            scheduledJobs++;
          }
        } catch (error) {
          console.error(`Failed to schedule repayment for token ${token.tokenId}:`, error);
        }
      }
      
      console.log(`Successfully scheduled ${scheduledJobs} repayment jobs`);
      return { 
        message: 'Daily token check completed', 
        scheduledJobs,
        tokensFound: tokensExpiringToday.length,
        isManual,
        force
      };
      
    } catch (error) {
      console.error('Error in daily token expiration check:', error);
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 1, // Process one job at a time for the scheduler
  }
);

/**
 * Repayment processor worker
 * Processes individual repayment jobs with Socket.IO progress updates
 */
export const repaymentWorker = new Worker(
  QUEUE_NAMES.REPAYMENT,
  async (job: Job<AsyncRepaymentJobData>) => {
    const { tokenId, sagId, userId, pawnshopAccountId } = job.data;
    
    console.log(`[${new Date().toISOString()}] Processing async repayment for token ${tokenId} by user ${userId}`);
    
    try {
      // Use the new async repayment processor with Socket.IO updates
      const result = await processAsyncRepayment(job);

      if (result.success) {
        // Update token status to indicate repayment processed
        await hederaTokenRepository.updateTokenStatus(tokenId, 'REPAYMENT_PROCESSED', userId);
        console.log(`Updated token ${tokenId} status to REPAYMENT_PROCESSED`);
      }

      console.log(`Async repayment processing completed for token ${tokenId}: ${result.success ? 'SUCCESS' : 'FAILED'}`);
      
      return {
        success: result.success,
        tokenId,
        totalHolders: result.totalHolders,
        totalTokensProcessed: result.totalTokensProcessed,
        unfreezeTransactions: result.unfreezeTransactions,
        transferTransactions: result.transferTransactions,
        burnTransaction: result.burnTransaction,
        error: result.error
      };
      
    } catch (error) {
      console.error(`Error processing async repayment for token ${tokenId}:`, error);
      
      // Update token status to indicate repayment failed
      await hederaTokenRepository.updateTokenStatus(tokenId, 'REPAYMENT_FAILED', userId);
      
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 3, // Process up to 3 repayment jobs concurrently (reduced for better performance)
  }
);

/**
 * SAG creation processor worker
 * Processes individual SAG creation jobs with Socket.IO progress updates
 */
export const sagCreationWorker = new Worker(
  QUEUE_NAMES.SAG_CREATION,
  async (job: Job<AsyncSagCreationJobData>) => {
    const { sagData, userId } = job.data; // userId is current login user id
    
    console.log(`[${new Date().toISOString()}] Processing async SAG creation for ${sagData.sagName} by user ${userId}`);
    
    try {
      // Use the new async SAG creation processor with Socket.IO updates
      const result = await processAsyncSagCreation(job);

      console.log(`Async SAG creation completed for ${sagData.sagName}: ${result.success ? 'SUCCESS' : 'FAILED'}`);
      
      return {
        success: result.success,
        sagId: result.sagId,
        tokenId: result.tokenId,
        transactionId: result.transactionId,
        totalMinted: result.totalMinted,
        totalBatches: result.totalBatches,
        serialNumbers: result.serialNumbers,
        error: result.error
      };
      
    } catch (error) {
      console.error(`Error processing async SAG creation for ${sagData.sagName}:`, error);
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 2, // Process up to 2 SAG creation jobs concurrently
  }
);

/**
 * Token purchase processor worker
 * Processes individual token purchase jobs with Socket.IO progress updates
 */
export const tokenPurchaseWorker = new Worker(
  QUEUE_NAMES.TOKEN_PURCHASE,
  async (job: Job<AsyncTokenPurchaseJobData>) => {
    const { tokenId, amount, totalValue, userId } = job.data;
    
    console.log(`[${new Date().toISOString()}] Processing async token purchase for token ${tokenId} by user ${userId}`);
    
    try {
      // Use the new async token purchase processor with Socket.IO updates
      const result = await processAsyncTokenPurchase(job);

      console.log(`Async token purchase completed for token ${tokenId}: ${result.success ? 'SUCCESS' : 'FAILED'}`);
      
      return {
        success: result.success,
        tokenId: result.tokenId,
        serialNumbers: result.serialNumbers,
        investorAccountId: result.investorAccountId,
        transferTransactionId: result.transferTransactionId,
        freezeTransactionId: result.freezeTransactionId,
        associationTransactionId: result.associationTransactionId,
        batches: result.batches,
        error: result.error
      };
      
    } catch (error) {
      console.error(`Error processing async token purchase for token ${tokenId}:`, error);
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 3, // Process up to 3 token purchase jobs concurrently
  }
);

/**
 * Gold price fetcher worker
 * Processes gold price fetching jobs
 */
export const goldPriceWorker = new Worker(
  QUEUE_NAMES.GOLD_PRICE,
  async (job: Job<GoldPriceJobData>) => {
    const { manual, force } = job.data;
    
    console.log(`[${new Date().toISOString()}] Processing gold price fetch job (manual: ${manual}, force: ${force})`);
    
    try {
      // Use the gold price processor
      const result = await processGoldPriceJob(job);

      console.log(`Gold price fetch completed: ${result.success ? 'SUCCESS' : 'FAILED'}`);
      
      return {
        success: result.success,
        message: result.message,
        goldPriceData: result.goldPriceData,
        error: result.error,
        isManual: result.isManual,
        force: result.force
      };
      
    } catch (error) {
      console.error(`Error processing gold price fetch job:`, error);
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 1, // Process one gold price job at a time
  }
);

/**
 * Schedule the daily token check job
 * Runs at 12:00 AM UTC+8 every day
 */
export async function scheduleDailyTokenCheck(): Promise<void> {
  try {
    // Schedule the daily check job using cron pattern
    await schedulerQueue.add(
      JOB_TYPES.DAILY_TOKEN_CHECK,
      {},
      {
        repeat: {
          pattern: '0 16 * * *', // Cron pattern for 12:00 AM UTC+8 (16:00 UTC)
          tz: 'Asia/Singapore', // UTC+8 timezone
        },
        jobId: 'daily-token-check',
      }
    );
    
    console.log('Daily token check scheduled to run at 12:00 AM UTC+8 every day');
  } catch (error) {
    console.error('Failed to schedule daily token check:', error);
    throw error;
  }
}

/**
 * Schedule the daily gold price fetch job
 * Runs at 9:00 AM UTC+8 every day
 */
export async function scheduleDailyGoldPriceFetch(): Promise<void> {
  try {
    // Schedule the daily gold price fetch job using cron pattern
    await goldPriceQueue.add(
      JOB_TYPES.FETCH_GOLD_PRICE,
      {},
      {
        repeat: {
          pattern: '0 1 * * *', // Cron pattern for 9:00 AM UTC+8 (01:00 UTC)
          tz: 'Asia/Singapore', // UTC+8 timezone
        },
        jobId: 'daily-gold-price-fetch',
      }
    );
    
    console.log('Daily gold price fetch scheduled to run at 9:00 AM UTC+8 every day');
  } catch (error) {
    console.error('Failed to schedule daily gold price fetch:', error);
    throw error;
  }
}

/**
 * Initialize the BullMQ scheduler system
 */
export async function initializeScheduler(): Promise<void> {
  try {
    console.log('Initializing BullMQ scheduler...');
    
    // Test Redis connection first
    console.log('Testing Redis connection...');
    try {
      await schedulerQueue.isPaused();
      console.log('Redis connection successful');
    } catch (redisError) {
      console.error('Redis connection failed:', redisError);
      throw new Error(`Redis connection failed: ${redisError instanceof Error ? redisError.message : 'Unknown error'}`);
    }
    
    // Start workers with better error handling
    console.log('Starting workers...');
    try {
      await schedulerWorker.waitUntilReady();
      console.log('Scheduler worker ready');
    } catch (workerError) {
      console.error('Scheduler worker failed to start:', workerError);
      throw workerError;
    }
    
    try {
      await repaymentWorker.waitUntilReady();
      console.log('Repayment worker ready');
    } catch (workerError) {
      console.error('Repayment worker failed to start:', workerError);
      throw workerError;
    }
    
    try {
      await sagCreationWorker.waitUntilReady();
      console.log('SAG creation worker ready');
    } catch (workerError) {
      console.error('SAG creation worker failed to start:', workerError);
      throw workerError;
    }
    
    try {
      await tokenPurchaseWorker.waitUntilReady();
      console.log('Token purchase worker ready');
    } catch (workerError) {
      console.error('Token purchase worker failed to start:', workerError);
      throw workerError;
    }
    
    try {
      await goldPriceWorker.waitUntilReady();
      console.log('Gold price worker ready');
    } catch (workerError) {
      console.error('Gold price worker failed to start:', workerError);
      throw workerError;
    }
    
    console.log('All workers started successfully');
    
    // Schedule the daily jobs
    await scheduleDailyTokenCheck();
    await scheduleDailyGoldPriceFetch();
    
    console.log('BullMQ scheduler initialized successfully');
  } catch (error) {
    console.error('Failed to initialize scheduler:', error);
    throw error;
  }
}

/**
 * Gracefully shutdown the scheduler system
 */
export async function shutdownScheduler(): Promise<void> {
  try {
    console.log('Shutting down BullMQ scheduler...');
    
    await schedulerWorker.close();
    await repaymentWorker.close();
    await sagCreationWorker.close();
    await tokenPurchaseWorker.close();
    await goldPriceWorker.close();
    await schedulerQueue.close();
    await repaymentQueue.close();
    await sagCreationQueue.close();
    await tokenPurchaseQueue.close();
    await goldPriceQueue.close();
    
    console.log('BullMQ scheduler shutdown complete');
  } catch (error) {
    console.error('Error during scheduler shutdown:', error);
  }
}

// Event listeners for monitoring
schedulerWorker.on('ready', () => {
  console.log('Scheduler worker is ready and listening for jobs');
});

schedulerWorker.on('error', (err) => {
  console.error('Scheduler worker error:', err);
});

schedulerWorker.on('completed', (job) => {
  console.log(`Scheduler job ${job.id} completed:`, job.returnvalue);
});

schedulerWorker.on('failed', (job, err) => {
  console.error(`Scheduler job ${job?.id} failed:`, err);
});

schedulerWorker.on('stalled', (jobId) => {
  console.warn(`Scheduler job ${jobId} stalled`);
});

repaymentWorker.on('ready', () => {
  console.log('Repayment worker is ready and listening for jobs');
});

repaymentWorker.on('error', (err) => {
  console.error('Repayment worker error:', err);
});

repaymentWorker.on('completed', (job) => {
  console.log(`Repayment job ${job.id} completed for token ${job.data.tokenId}:`, job.returnvalue);
});

repaymentWorker.on('failed', (job, err) => {
  console.error(`Repayment job ${job?.id} failed for token ${job?.data?.tokenId}:`, err);
});

repaymentWorker.on('stalled', (jobId) => {
  console.warn(`Repayment job ${jobId} stalled`);
});

repaymentWorker.on('progress', (job, progress) => {
  console.log(`Repayment job ${job.id} progress: ${progress}%`);
});

sagCreationWorker.on('ready', () => {
  console.log('SAG creation worker is ready and listening for jobs');
});

sagCreationWorker.on('error', (err) => {
  console.error('SAG creation worker error:', err);
});

sagCreationWorker.on('completed', (job) => {
  console.log(`SAG creation job ${job.id} completed for ${job.data.sagData.sagName}:`, job.returnvalue);
});

sagCreationWorker.on('failed', (job, err) => {
  console.error(`SAG creation job ${job?.id} failed for ${job?.data?.sagData?.sagName}:`, err);
});

sagCreationWorker.on('stalled', (jobId) => {
  console.warn(`SAG creation job ${jobId} stalled`);
});

sagCreationWorker.on('progress', (job, progress) => {
  console.log(`SAG creation job ${job.id} progress: ${progress}%`);
});

goldPriceWorker.on('ready', () => {
  console.log('Gold price worker is ready and listening for jobs');
});

goldPriceWorker.on('error', (err) => {
  console.error('Gold price worker error:', err);
});

goldPriceWorker.on('completed', (job) => {
  console.log(`Gold price job ${job.id} completed:`, job.returnvalue);
});

goldPriceWorker.on('failed', (job, err) => {
  console.error(`Gold price job ${job?.id} failed:`, err);
});

goldPriceWorker.on('stalled', (jobId) => {
  console.warn(`Gold price job ${jobId} stalled`);
});

goldPriceWorker.on('progress', (job, progress) => {
  console.log(`Gold price job ${job.id} progress: ${progress}%`);
});

// Queue event listeners
schedulerQueue.on('error', (err) => {
  console.error('Scheduler queue error:', err);
});

repaymentQueue.on('error', (err) => {
  console.error('Repayment queue error:', err);
});

sagCreationQueue.on('error', (err) => {
  console.error('SAG creation queue error:', err);
});

tokenPurchaseQueue.on('error', (err) => {
  console.error('Token purchase queue error:', err);
});

goldPriceQueue.on('error', (err) => {
  console.error('Gold price queue error:', err);
});

sagCreationQueue.on('waiting', (job: any) => {
  console.log(`SAG creation job ${job.id} is waiting for ${job.data?.sagData?.sagName}`);
});

schedulerQueue.on('waiting', (job: any) => {
  console.log(`Scheduler job ${job.id} is waiting`);
});

repaymentQueue.on('waiting', (job: any) => {
  console.log(`Repayment job ${job.id} is waiting for token ${job.data?.tokenId}`);
});

tokenPurchaseQueue.on('waiting', (job: any) => {
  console.log(`Token purchase job ${job.id} is waiting for token ${job.data?.tokenId}`);
});

goldPriceQueue.on('waiting', (job: any) => {
  console.log(`Gold price job ${job.id} is waiting`);
});

/**
 * Clean up stalled jobs and retry them
 */
export async function cleanupStalledJobs(): Promise<void> {
  try {
    console.log('Cleaning up stalled jobs...');
    
    // Clean stalled jobs from all queues
    const schedulerStalled = await schedulerQueue.clean(5000, 'active' as any);
    const schedulerWaiting = await schedulerQueue.clean(5000, 'waiting' as any);
    const repaymentStalled = await repaymentQueue.clean(5000, 'active' as any);
    const repaymentWaiting = await repaymentQueue.clean(5000, 'waiting' as any);
    const sagCreationStalled = await sagCreationQueue.clean(5000, 'active' as any);
    const sagCreationWaiting = await sagCreationQueue.clean(5000, 'waiting' as any);
    const tokenPurchaseStalled = await tokenPurchaseQueue.clean(5000, 'active' as any);
    const tokenPurchaseWaiting = await tokenPurchaseQueue.clean(5000, 'waiting' as any);
    const goldPriceStalled = await goldPriceQueue.clean(5000, 'active' as any);
    const goldPriceWaiting = await goldPriceQueue.clean(5000, 'waiting' as any);
    
    console.log(`Cleaned up stalled jobs - Scheduler: ${schedulerStalled.length} active, ${schedulerWaiting.length} waiting`);
    console.log(`Cleaned up stalled jobs - Repayment: ${repaymentStalled.length} active, ${repaymentWaiting.length} waiting`);
    console.log(`Cleaned up stalled jobs - SAG Creation: ${sagCreationStalled.length} active, ${sagCreationWaiting.length} waiting`);
    console.log(`Cleaned up stalled jobs - Token Purchase: ${tokenPurchaseStalled.length} active, ${tokenPurchaseWaiting.length} waiting`);
    console.log(`Cleaned up stalled jobs - Gold Price: ${goldPriceStalled.length} active, ${goldPriceWaiting.length} waiting`);
    
    // Retry stalled jobs
    for (const job of [...schedulerStalled, ...repaymentStalled, ...sagCreationStalled, ...tokenPurchaseStalled, ...goldPriceStalled]) {
      try {
        if (job && typeof job === 'object' && 'retry' in job) {
          await (job as any).retry();
          console.log(`Retried stalled job ${(job as any).id}`);
        }
      } catch (error) {
        console.error(`Failed to retry job ${(job as any)?.id}:`, error);
      }
    }
    
  } catch (error) {
    console.error('Error cleaning up stalled jobs:', error);
  }
}

/**
 * Manually process a specific job
 */
export async function processJobManually(jobId: string): Promise<void> {
  try {
    console.log(`Manually processing job ${jobId}...`);
    
    // Try to find the job in all queues
    let job = await schedulerQueue.getJob(jobId);
    let queueName = 'scheduler';
    
    if (!job) {
      job = await repaymentQueue.getJob(jobId);
      queueName = 'repayment';
    }
    
    if (!job) {
      job = await sagCreationQueue.getJob(jobId);
      queueName = 'sag-creation';
    }
    
    if (!job) {
      job = await tokenPurchaseQueue.getJob(jobId);
      queueName = 'token-purchase';
    }
    
    if (!job) {
      job = await goldPriceQueue.getJob(jobId);
      queueName = 'gold-price';
    }
    
    if (!job) {
      throw new Error('Job not found');
    }
    
    const jobState = await job.getState();
    console.log(`Job ${jobId} state: ${jobState}`);
    
    if (jobState === 'completed') {
      console.log(`Job ${jobId} is already completed`);
      return;
    }
    
    if (jobState === 'active') {
      console.log(`Job ${jobId} is already active`);
      return;
    }
    
    // Move job to active state and process
    await (job as any).moveToActive();
    console.log(`Job ${jobId} moved to active state`);
    
  } catch (error) {
    console.error(`Error manually processing job ${jobId}:`, error);
    throw error;
  }
}

/**
 * Get detailed queue health information
 */
export async function getQueueHealth(): Promise<{
  scheduler: any;
  repayment: any;
  sagCreation: any;
  tokenPurchase: any;
  goldPrice: any;
  redis: boolean;
}> {
  try {
    const schedulerStats = {
      waiting: await schedulerQueue.getWaiting(),
      active: await schedulerQueue.getActive(),
      completed: await schedulerQueue.getCompleted(),
      failed: await schedulerQueue.getFailed(),
      delayed: await schedulerQueue.getDelayed(),
      paused: await schedulerQueue.isPaused(),
    };
    
    const repaymentStats = {
      waiting: await repaymentQueue.getWaiting(),
      active: await repaymentQueue.getActive(),
      completed: await repaymentQueue.getCompleted(),
      failed: await repaymentQueue.getFailed(),
      delayed: await repaymentQueue.getDelayed(),
      paused: await repaymentQueue.isPaused(),
    };
    
    const sagCreationStats = {
      waiting: await sagCreationQueue.getWaiting(),
      active: await sagCreationQueue.getActive(),
      completed: await sagCreationQueue.getCompleted(),
      failed: await sagCreationQueue.getFailed(),
      delayed: await sagCreationQueue.getDelayed(),
      paused: await sagCreationQueue.isPaused(),
    };
    
    const tokenPurchaseStats = {
      waiting: await tokenPurchaseQueue.getWaiting(),
      active: await tokenPurchaseQueue.getActive(),
      completed: await tokenPurchaseQueue.getCompleted(),
      failed: await tokenPurchaseQueue.getFailed(),
      delayed: await tokenPurchaseQueue.getDelayed(),
      paused: await tokenPurchaseQueue.isPaused(),
    };
    
    const goldPriceStats = {
      waiting: await goldPriceQueue.getWaiting(),
      active: await goldPriceQueue.getActive(),
      completed: await goldPriceQueue.getCompleted(),
      failed: await goldPriceQueue.getFailed(),
      delayed: await goldPriceQueue.getDelayed(),
      paused: await goldPriceQueue.isPaused(),
    };
    
    // Test Redis connection
    let redisConnected = false;
    try {
      await schedulerQueue.isPaused();
      redisConnected = true;
    } catch (error) {
      redisConnected = false;
    }
    
    return {
      scheduler: schedulerStats,
      repayment: repaymentStats,
      sagCreation: sagCreationStats,
      tokenPurchase: tokenPurchaseStats,
      goldPrice: goldPriceStats,
      redis: redisConnected,
    };
    
  } catch (error) {
    console.error('Error getting queue health:', error);
    throw error;
  }
}