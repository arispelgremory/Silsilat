import { Request, Response } from 'express';
import { schedulerQueue, repaymentQueue, JOB_TYPES, cleanupStalledJobs, processJobManually, getQueueHealth } from '../../bullmq/scheduler.js';
import { hederaTokenRepository } from '../hedera/token/token.repository.js';
import { z } from 'zod';

// Validation schemas
const ManualRepaymentSchema = z.object({
  tokenId: z.string().min(1, 'Token ID is required'),
  sagId: z.string().optional(),
  pawnshopAccountId: z.string().optional(),
});

const ManualDailyCheckSchema = z.object({
  force: z.boolean().optional().default(false),
});

export class SchedulerController {
  /**
   * Manually trigger the daily token check
   * POST /api/v1/scheduler/trigger-daily-check
   */
  async triggerDailyCheck(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = ManualDailyCheckSchema.parse(req.body);
      
      console.log(`[${new Date().toISOString()}] Manual daily token check triggered`);
      
      // Add the daily check job to the scheduler queue
      const job = await schedulerQueue.add(
        JOB_TYPES.DAILY_TOKEN_CHECK,
        { manual: true, force: validatedData.force },
        {
          jobId: `manual-daily-check-${Date.now()}`,
          priority: 1, // Higher priority for manual triggers
        }
      );
      
      res.status(200).json({
        success: true,
        message: 'Daily token check triggered successfully',
        data: {
          jobId: job.id,
          status: 'queued',
          timestamp: new Date().toISOString(),
        }
      });
      
    } catch (error) {
      console.error('Error triggering daily check:', error);
      
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }

  /**
   * Manually trigger repayment for a specific token
   * POST /api/v1/scheduler/trigger-repayment
   */
  async triggerRepayment(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = ManualRepaymentSchema.parse(req.body);
      
      // Verify the token exists and get its details
      const token = await hederaTokenRepository.getTokenByTokenId(validatedData.tokenId);
      if (!token) {
        res.status(404).json({
          success: false,
          error: 'Token not found'
        });
        return;
      }
      
      console.log(`[${new Date().toISOString()}] Manual repayment triggered for token ${validatedData.tokenId}`);
      
      // Add the repayment job to the repayment queue
      const job = await repaymentQueue.add(
        JOB_TYPES.PROCESS_REPAYMENT,
        {
          tokenId: validatedData.tokenId,
          expiredAt: token.expiredAt,
          createdBy: token.createdBy,
          sagId: validatedData.sagId,
          pawnshopAccountId: validatedData.pawnshopAccountId,
        },
        {
          jobId: `manual-repayment-${validatedData.tokenId}-${Date.now()}`,
          priority: 1, // Higher priority for manual triggers
        }
      );
      
      res.status(200).json({
        success: true,
        message: 'Repayment triggered successfully',
        data: {
          jobId: job.id,
          tokenId: validatedData.tokenId,
          status: 'queued',
          timestamp: new Date().toISOString(),
          tokenInfo: {
            tokenId: token.tokenId,
            expiredAt: token.expiredAt,
            status: token.status,
            createdBy: token.createdBy,
          }
        }
      });
      
    } catch (error) {
      console.error('Error triggering repayment:', error);
      
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }

  /**
   * Get queue status and job information
   * GET /api/v1/scheduler/status
   */
  async getSchedulerStatus(req: Request, res: Response): Promise<void> {
    try {
      // Get scheduler queue status
      const schedulerWaiting = await schedulerQueue.getWaiting();
      const schedulerActive = await schedulerQueue.getActive();
      const schedulerCompleted = await schedulerQueue.getCompleted();
      const schedulerFailed = await schedulerQueue.getFailed();
      
      // Get repayment queue status
      const repaymentWaiting = await repaymentQueue.getWaiting();
      const repaymentActive = await repaymentQueue.getActive();
      const repaymentCompleted = await repaymentQueue.getCompleted();
      const repaymentFailed = await repaymentQueue.getFailed();
      
      // Get tokens expiring today
      const tokensExpiringToday = await hederaTokenRepository.getTokensExpiringToday();
      
      res.status(200).json({
        success: true,
        data: {
          scheduler: {
            waiting: schedulerWaiting.length,
            active: schedulerActive.length,
            completed: schedulerCompleted.length,
            failed: schedulerFailed.length,
            jobs: {
              waiting: schedulerWaiting.map(job => ({
                id: job.id,
                name: job.name,
                data: job.data,
                timestamp: job.timestamp,
              })),
              active: schedulerActive.map(job => ({
                id: job.id,
                name: job.name,
                data: job.data,
                timestamp: job.timestamp,
                progress: job.progress,
              })),
            }
          },
          repayment: {
            waiting: repaymentWaiting.length,
            active: repaymentActive.length,
            completed: repaymentCompleted.length,
            failed: repaymentFailed.length,
            jobs: {
              waiting: repaymentWaiting.map(job => ({
                id: job.id,
                name: job.name,
                data: job.data,
                timestamp: job.timestamp,
              })),
              active: repaymentActive.map(job => ({
                id: job.id,
                name: job.name,
                data: job.data,
                timestamp: job.timestamp,
                progress: job.progress,
              })),
            }
          },
          tokens: {
            expiringToday: tokensExpiringToday.length,
            tokens: tokensExpiringToday.map(token => ({
              tokenId: token.tokenId,
              expiredAt: token.expiredAt,
              status: token.status,
              createdBy: token.createdBy,
            }))
          }
        }
      });
      
    } catch (error) {
      console.error('Error getting scheduler status:', error);
      
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }

  /**
   * Get job details by ID
   * GET /api/v1/scheduler/job/:jobId
   */
  async getJobDetails(req: Request, res: Response): Promise<void> {
    try {
      const { jobId } = req.params;
      
      if (!jobId) {
        res.status(400).json({
          success: false,
          error: 'Job ID is required'
        });
        return;
      }
      
      // Try to find the job in both queues
      let job = await schedulerQueue.getJob(jobId);
      let queueName = 'scheduler';
      
      if (!job) {
        job = await repaymentQueue.getJob(jobId);
        queueName = 'repayment';
      }
      
      if (!job) {
        res.status(404).json({
          success: false,
          error: 'Job not found'
        });
        return;
      }
      
      const jobState = await job.getState();
      
      res.status(200).json({
        success: true,
        data: {
          id: job.id,
          name: job.name,
          queue: queueName,
          state: jobState,
          data: job.data,
          progress: job.progress,
          returnvalue: job.returnvalue,
          failedReason: job.failedReason,
          timestamp: job.timestamp,
          processedOn: job.processedOn,
          finishedOn: job.finishedOn,
          attemptsMade: job.attemptsMade,
          opts: job.opts,
        }
      });
      
    } catch (error) {
      console.error('Error getting job details:', error);
      
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }

  /**
   * Cancel a job by ID
   * DELETE /api/v1/scheduler/job/:jobId
   */
  async cancelJob(req: Request, res: Response): Promise<void> {
    try {
      const { jobId } = req.params;
      
      if (!jobId) {
        res.status(400).json({
          success: false,
          error: 'Job ID is required'
        });
        return;
      }
      
      // Try to cancel the job in both queues
      let job = await schedulerQueue.getJob(jobId);
      let queueName = 'scheduler';
      
      if (!job) {
        job = await repaymentQueue.getJob(jobId);
        queueName = 'repayment';
      }
      
      if (!job) {
        res.status(404).json({
          success: false,
          error: 'Job not found'
        });
        return;
      }
      
      const jobState = await job.getState();
      
      if (jobState === 'completed' || jobState === 'failed') {
        res.status(400).json({
          success: false,
          error: 'Cannot cancel a completed or failed job'
        });
        return;
      }
      
      await job.remove();
      
      res.status(200).json({
        success: true,
        message: 'Job cancelled successfully',
        data: {
          jobId: job.id,
          queue: queueName,
          state: jobState,
        }
      });
      
    } catch (error) {
      console.error('Error cancelling job:', error);
      
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }

  /**
   * Clean up stalled jobs
   * POST /api/v1/scheduler/cleanup-stalled
   */
  async cleanupStalled(req: Request, res: Response): Promise<void> {
    try {
      console.log(`[${new Date().toISOString()}] Manual cleanup of stalled jobs triggered`);
      
      await cleanupStalledJobs();
      
      res.status(200).json({
        success: true,
        message: 'Stalled jobs cleanup completed',
        timestamp: new Date().toISOString(),
      });
      
    } catch (error) {
      console.error('Error cleaning up stalled jobs:', error);
      
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }

  /**
   * Manually process a specific job
   * POST /api/v1/scheduler/process-job/:jobId
   */
  async processJob(req: Request, res: Response): Promise<void> {
    try {
      const { jobId } = req.params;
      
      if (!jobId) {
        res.status(400).json({
          success: false,
          error: 'Job ID is required'
        });
        return;
      }
      
      console.log(`[${new Date().toISOString()}] Manual job processing triggered for job ${jobId}`);
      
      await processJobManually(jobId);
      
      res.status(200).json({
        success: true,
        message: 'Job processing initiated',
        data: {
          jobId,
          timestamp: new Date().toISOString(),
        }
      });
      
    } catch (error) {
      console.error('Error processing job:', error);
      
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }

  /**
   * Get detailed queue health information
   * GET /api/v1/scheduler/health
   */
  async getQueueHealth(req: Request, res: Response): Promise<void> {
    try {
      const health = await getQueueHealth();
      
      res.status(200).json({
        success: true,
        data: {
          ...health,
          scheduler: {
            ...health.scheduler,
            counts: {
              waiting: health.scheduler.waiting.length,
              active: health.scheduler.active.length,
              completed: health.scheduler.completed.length,
              failed: health.scheduler.failed.length,
              delayed: health.scheduler.delayed.length,
            }
          },
          repayment: {
            ...health.repayment,
            counts: {
              waiting: health.repayment.waiting.length,
              active: health.repayment.active.length,
              completed: health.repayment.completed.length,
              failed: health.repayment.failed.length,
              delayed: health.repayment.delayed.length,
            }
          }
        }
      });
      
    } catch (error) {
      console.error('Error getting queue health:', error);
      
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }
}

export const schedulerController = new SchedulerController();
