import { Request, Response } from 'express';
import { goldPriceQueue, JOB_TYPES } from '../../bullmq/scheduler.js';

/**
 * Manually trigger gold price fetch
 * POST /api/v1/gold-price/fetch
 */
export const fetchGoldPriceController = async (req: Request, res: Response) => {
  try {
    const { force = false } = req.body;
    
    // Add job to gold price queue
    const job = await goldPriceQueue.add(
      JOB_TYPES.FETCH_GOLD_PRICE,
      {
        manual: true,
        force: Boolean(force)
      },
      {
        jobId: `manual-gold-price-fetch-${Date.now()}`,
        priority: 1, // High priority for manual jobs
      }
    );
    
    res.status(200).json({
      success: true,
      message: 'Gold price fetch job queued successfully',
      data: {
        jobId: job.id,
        manual: true,
        force: Boolean(force)
      }
    });
  } catch (error) {
    console.error('Error queuing gold price fetch job:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to queue gold price fetch job'
    });
  }
};

/**
 * Get gold price queue status
 * GET /api/v1/gold-price/queue-status
 */
export const getGoldPriceQueueStatusController = async (req: Request, res: Response) => {
  try {
    const waiting = await goldPriceQueue.getWaiting();
    const active = await goldPriceQueue.getActive();
    const completed = await goldPriceQueue.getCompleted();
    const failed = await goldPriceQueue.getFailed();
    const delayed = await goldPriceQueue.getDelayed();
    const paused = await goldPriceQueue.isPaused();
    
    res.status(200).json({
      success: true,
      data: {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        delayed: delayed.length,
        paused
      },
      message: 'Gold price queue status retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting gold price queue status:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get queue status'
    });
  }
};
