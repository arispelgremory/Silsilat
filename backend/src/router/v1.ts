import express from 'express';

// Import feature routes
import { authRoutes } from '@/features/auth/index.js';
import { healthRoutes } from '@/features/health/index.js';
import { handleUpload } from '@/features/upload/index.js';
import { sagRoutes } from '@/features/sag/index.js';
import { tokenRoutes } from '@/features/hedera/token/index.js';
import { investorRoutes } from '@/features/investor/index.js';
import { pawnshopRoutes } from '@/features/pawnshop/index.js';
import { goldPriceRoutes } from '@/features/gold-price/index.js';
// import { schedulerRoutes } from '@/features/scheduler/index.js';
import authenticateJWT from '@/middleware/authenticate-jwt';
import topicRoutes from '@/features/hedera/topic/topic.routes';
import uploadRoutes from '@/features/upload/upload.routes';

const v1Router = express.Router();

// Use the feature routes
v1Router.use('/health', healthRoutes);

v1Router.use('/auth', authRoutes);

v1Router.use('/upload', uploadRoutes);

v1Router.use('/sag', sagRoutes);

v1Router.use('/token', tokenRoutes);

v1Router.use('/topic', topicRoutes);

// v1Router.use('/investor', authenticateJWT, investorRoutes);
v1Router.use('/investor', authenticateJWT, investorRoutes);

v1Router.use('/pawnshop', authenticateJWT, pawnshopRoutes);

v1Router.use('/gold-price', goldPriceRoutes);

// v1Router.use('/scheduler', schedulerRoutes);

export default v1Router;