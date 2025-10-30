import express from 'express';
import { handleUpload } from './upload.controller.js';

const router = express.Router();

router.post('/', (req, res) => handleUpload(req as any, res));

export default router;