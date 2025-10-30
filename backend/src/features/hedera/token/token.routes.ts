import { Router } from 'express';
import { hederaTokenController } from './token.controller';

const router = Router();

router.get('/:tokenId', (req, res) => {hederaTokenController.getToken(req, res);});
router.post('/mint', (req, res) => {hederaTokenController.mintToken(req, res);});
router.post('/fungible/create', (req, res) => {hederaTokenController.createFungibleToken(req, res);});
router.post('/fungible/mint', (req, res) => {hederaTokenController.mintFungibleToken(req, res);});
export default router;
