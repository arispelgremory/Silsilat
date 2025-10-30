import { Router } from 'express';
import { dbHealthCheck, healthCheck } from '@/features/health/health.controller.js';

const router = Router();

// Define routes
router.get('', healthCheck);
router.get('/db', dbHealthCheck);

export default router;