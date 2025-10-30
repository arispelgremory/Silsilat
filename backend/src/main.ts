import express from "express";
import ViteExpress from "vite-express";
import path from 'path';
import { fileURLToPath } from 'url';
import morgan from 'morgan';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';

// Load environment variables
dotenv.config();

// Router
import v1Router from "@/router/v1.js";

// BullMQ Scheduler
import { initializeScheduler, shutdownScheduler } from "@/bullmq/scheduler.js";

// Socket.IO Service
import { initializeSocketService } from "@/services/socket.service.js";

// Admin account initialization
import { initAccounts } from "@/scripts/init-accounts.js";
import { loadOrInitializeTopic } from "@/scripts/init-topic.js";
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const app = express();

// Helper function to run migrations
async function runMigrations(): Promise<void> {
  try {
    console.log('Running database migrations...');
    await execAsync('pnpm run migrate');
    console.log('✅ Migrations completed successfully');
  } catch (error) {
    console.warn('⚠️  Migrations warning (might already be applied):', error);
  }
}

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], // Allow frontend origins
  credentials: true, // Allow cookies and authorization headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], // Allow all common HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'], // Allow common headers
  optionsSuccessStatus: 200 // For legacy browser support
};

// Global middlewares
app.use(cors(corsOptions)); // Enable CORS with configuration
app.use(helmet()); // For security headers
app.use(morgan('dev')); // For logging requests
app.use(express.json()); // For parsing JSON request bodies
app.use(express.urlencoded({ extended: true })); // For parsing URL-encoded request bodies

// Serve static files
// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine public directory based on environment
// In Docker: UPLOADS_PATH is set to /app/public/uploads, so serve from /app/public
// In local dev: serve from dist/public
const publicDir = process.env.UPLOADS_PATH 
  ? path.dirname(process.env.UPLOADS_PATH)  // Extract /app/public from /app/public/uploads
  : path.join(process.cwd(), 'public'); // Local dev: use project root public

app.use(express.static(publicDir));

// Router
app.use('/api/v1', v1Router);

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO service
const socketService = initializeSocketService(server);

// Initialize BullMQ scheduler
initializeScheduler().catch((error) => {
  console.error('Failed to initialize BullMQ scheduler:', error);
  process.exit(1);
});

// Helper function to get or load FUNGIBLE_TOKEN_ID
async function loadFungibleTokenId(): Promise<string | null> {
  // If already set in env, use it
  if (process.env.FUNGIBLE_TOKEN_ID) {
    console.log(`✓ Using FUNGIBLE_TOKEN_ID from environment: ${process.env.FUNGIBLE_TOKEN_ID}`);
    return process.env.FUNGIBLE_TOKEN_ID;
  }
  
  // Try to retrieve from database
  try {
    const { hederaTokenRepository } = await import('@/features/hedera/token/token.repository.js');
    const lqtToken = await hederaTokenRepository.findFungibleTokenBySymbol('LQT');
    
    if (lqtToken) {
      process.env.FUNGIBLE_TOKEN_ID = lqtToken.tokenId;
      console.log(`✓ Loaded FUNGIBLE_TOKEN_ID from database: ${lqtToken.tokenId}`);
      return lqtToken.tokenId;
    }
    
    console.warn('⚠️  LQT token not found in database');
    return null;
  } catch (error) {
    console.error('⚠️  Could not load FUNGIBLE_TOKEN_ID from database:', error);
    return null;
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await shutdownScheduler();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await shutdownScheduler();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Start server
const PORT = process.env.PORT || 9487;

// Run migrations, initialize accounts, and load FUNGIBLE_TOKEN_ID before starting the server
runMigrations()
  .then(() => initAccounts())
  .then(async () => {
    // Load FUNGIBLE_TOKEN_ID after initialization
    const tokenId = await loadFungibleTokenId();
    
    if (!tokenId) {
      console.error('\n🚨 CRITICAL: FUNGIBLE_TOKEN_ID is not set!');
      console.error('   This is required for the application to function.');
      console.error('\n📋 To fix this, you have two options:');
      console.error('\n   Option 1: Set it in your .env file');
      console.error('   ----------------------------------------');
      console.error('   FUNGIBLE_TOKEN_ID=0.0.123456  # <-- Your LQT token ID');
      console.error('\n   Option 2: Create the LQT token manually');
      console.error('   ----------------------------------------');
      console.error('   Run: npm run init-accounts');
      console.error('   Or create it through the admin panel\n');
      process.exit(1);
    }
    
    // Initialize topic IDs
    console.log('\n📢 Initializing Hedera topics...');
    const outputTopicId = await loadOrInitializeTopic('OUTPUT_TOPIC_ID', 'OUTPUT_TOPIC');
    const inputTopicId = await loadOrInitializeTopic('INPUT_TOPIC_ID', 'INPUT_TOPIC');
    const overrideTopicId = await loadOrInitializeTopic('OVERRIDE_TOPIC_ID', 'OVERRIDE_TOPIC');
    
    console.log('\n✓ Topic initialization complete:');
    console.log(`  - OUTPUT_TOPIC_ID: ${outputTopicId || 'NOT SET'}`);
    console.log(`  - INPUT_TOPIC_ID: ${inputTopicId || 'NOT SET'}`);
    console.log(`  - OVERRIDE_TOPIC_ID: ${overrideTopicId || 'NOT SET'}`);
    
    server.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}...`);
      console.log(`Socket.IO server initialized and ready for connections`);
    });
  })
  .catch(async (error: unknown) => {
    console.error('Failed to run migrations or initialize accounts:', error);
    
    // Try to load FUNGIBLE_TOKEN_ID from database or env
    const tokenId = await loadFungibleTokenId();
    
    if (!tokenId) {
      console.error('\n🚨 CRITICAL: FUNGIBLE_TOKEN_ID is not set!');
      console.error('   This is required for the application to function.');
      console.error('\n📋 To fix this, you have two options:');
      console.error('\n   Option 1: Set it in your .env file');
      console.error('   ----------------------------------------');
      console.error('   FUNGIBLE_TOKEN_ID=0.0.123456  # <-- Your LQT token ID');
      console.error('\n   Option 2: Create the LQT token manually');
      console.error('   ----------------------------------------');
      console.error('   Run: npm run init-accounts');
      console.error('   Or create it through the admin panel\n');
      process.exit(1);
    }
    
    // Initialize topic IDs
    console.log('\n📢 Initializing Hedera topics...');
    const outputTopicId = await loadOrInitializeTopic('OUTPUT_TOPIC_ID', 'OUTPUT_TOPIC');
    const inputTopicId = await loadOrInitializeTopic('INPUT_TOPIC_ID', 'INPUT_TOPIC');
    const overrideTopicId = await loadOrInitializeTopic('OVERRIDE_TOPIC_ID', 'OVERRIDE_TOPIC');
    
    console.log('\n✓ Topic initialization complete:');
    console.log(`  - OUTPUT_TOPIC_ID: ${outputTopicId || 'NOT SET'}`);
    console.log(`  - INPUT_TOPIC_ID: ${inputTopicId || 'NOT SET'}`);
    console.log(`  - OVERRIDE_TOPIC_ID: ${overrideTopicId || 'NOT SET'}`);
    
    // Still start the server even if initialization fails
    server.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}...`);
      console.log(`Socket.IO server initialized and ready for connections`);
    });
  });