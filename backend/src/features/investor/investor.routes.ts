import express from 'express';
import { InvestorController } from './investor.controller.js';

const router = express.Router();
const investorController = new InvestorController();

// POST /investor/purchase-token
router.post('/purchase-token', investorController.purchaseTokenAsync.bind(investorController));
router.get('/nfts', investorController.getInvestorNFTInfo.bind(investorController));
router.post('/token/top-up', investorController.topUpToken.bind(investorController));
router.get('/wallet/balance', investorController.getInvestorWalletBalance.bind(investorController));

export { router as investorRoutes };
