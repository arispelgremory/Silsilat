import express from 'express';
import { pawnshopController } from './pawnshop.controller.js';

const pawnshopRoutes = express.Router();

/**
 * @route POST /pawnshop/repayment
 * @desc Process repayment synchronously: Get all token holders, unfreeze tokens, transfer to pawnshop, and burn them
 * @access Private (requires JWT token)
 */
// pawnshopRoutes.post('/repayment', pawnshopController.processRepayment.bind(pawnshopController));

/**
 * @route POST /pawnshop/repayment/async
 * @desc Process repayment asynchronously using BullMQ and Socket.IO
 * @access Private (requires JWT token)
 */
pawnshopRoutes.post('/repayment', pawnshopController.processRepaymentAsync.bind(pawnshopController));

/**
 * @route GET /pawnshop/repayment/status/:jobId
 * @desc Get repayment job status by job ID
 * @access Private (requires JWT token)
 */
pawnshopRoutes.get('/repayment/status/:jobId', pawnshopController.getRepaymentStatus.bind(pawnshopController));

/**
 * @route GET /pawnshop/repayment/holders/:tokenId
 * @desc Get all token holders for a specific token ID
 * @access Private (requires JWT token)
 */
pawnshopRoutes.get('/repayment/holders/:tokenId', pawnshopController.getTokenHolders.bind(pawnshopController));

export { pawnshopRoutes };
