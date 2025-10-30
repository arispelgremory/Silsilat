import { Router } from 'express';
import { schedulerController } from './scheduler.controller.js';
import authenticateJWT from '../../middleware/authenticate-jwt.js';

const router = Router();

/**
 * @route POST /api/v1/scheduler/trigger-daily-check
 * @desc Manually trigger the daily token check
 * @access Private
 * @body { force?: boolean }
 */
router.post('/trigger-daily-check', schedulerController.triggerDailyCheck.bind(schedulerController));

/**
 * @route POST /api/v1/scheduler/trigger-repayment
 * @desc Manually trigger repayment for a specific token
 * @access Private
 * @body { tokenId: string, sagId?: string, pawnshopAccountId?: string }
 */
router.post('/trigger-repayment', schedulerController.triggerRepayment.bind(schedulerController));

/**
 * @route GET /api/v1/scheduler/status
 * @desc Get scheduler status and queue information
 * @access Private
 */
router.get('/status', schedulerController.getSchedulerStatus.bind(schedulerController));

/**
 * @route GET /api/v1/scheduler/job/:jobId
 * @desc Get job details by ID
 * @access Private
 */
router.get('/job/:jobId', schedulerController.getJobDetails.bind(schedulerController));

/**
 * @route DELETE /api/v1/scheduler/job/:jobId
 * @desc Cancel a job by ID
 * @access Private
 */
router.delete('/job/:jobId', schedulerController.cancelJob.bind(schedulerController));

/**
 * @route POST /api/v1/scheduler/cleanup-stalled
 * @desc Clean up stalled jobs
 * @access Private
 */
router.post('/cleanup-stalled', schedulerController.cleanupStalled.bind(schedulerController));

/**
 * @route POST /api/v1/scheduler/process-job/:jobId
 * @desc Manually process a specific job
 * @access Private
 */
router.post('/process-job/:jobId', schedulerController.processJob.bind(schedulerController));

/**
 * @route GET /api/v1/scheduler/health
 * @desc Get detailed queue health information
 * @access Private
 */
router.get('/health', schedulerController.getQueueHealth.bind(schedulerController));

export default router;
