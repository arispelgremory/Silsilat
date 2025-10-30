import { Router } from 'express';
import { createTopic, setTopicMessage } from './topic.controller';
import { uploadMetadata } from '../token/token.controller';

const router = Router();

router.post('/create', (req, res) => {createTopic(req, res);});
router.post('/ipfs/upload', (req, res) => {uploadMetadata(req, res);});
router.post('/setmessage', (req, res) => {setTopicMessage(req, res);});
export default router;
