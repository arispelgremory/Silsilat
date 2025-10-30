import express from 'express';
import { getAllUserAccess } from '@/features/rbac/rbac.controller.js';

const router = express.Router();

router.get('/', getAllUserAccess);

export default router;