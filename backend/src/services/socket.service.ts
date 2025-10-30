import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { Server as HTTPSServer } from 'https';

export interface SocketService {
  io: SocketIOServer;
  emitRepaymentProgress: (userId: string, data: RepaymentProgressData) => void;
  emitRepaymentComplete: (userId: string, data: RepaymentCompleteData) => void;
  emitRepaymentError: (userId: string, error: string) => void;
  emitSagCreationProgress: (userId: string, data: SagCreationProgressData) => void;
  emitSagCreationComplete: (userId: string, data: SagCreationCompleteData) => void;
  emitSagCreationError: (userId: string, error: string) => void;
  emitTokenPurchaseProgress: (userId: string, data: TokenPurchaseProgressData) => void;
  emitTokenPurchaseComplete: (userId: string, data: TokenPurchaseCompleteData) => void;
  emitTokenPurchaseError: (userId: string, data: TokenPurchaseErrorData) => void;
}

export interface RepaymentProgressData {
  jobId: string;
  tokenId: string;
  stage: 'queued' | 'validating' | 'calculating' | 'transferring' | 'processing_nft' | 'unfreezing' | 'transferring_nfts' | 'burning' | 'updating_status' | 'complete';
  progress: number; // 0-100
  message: string;
  details?: {
    currentStep?: string;
    totalSteps?: number;
    completedSteps?: number;
    currentBatch?: number;
    totalBatches?: number;
    currentAccount?: string;
    totalAccounts?: number;
    processedAccounts?: number;
    currentTokens?: number;
    totalTokens?: number;
    processedTokens?: number;
  };
  timestamp: string;
}

export interface RepaymentCompleteData {
  jobId: string;
  tokenId: string;
  success: boolean;
  data?: {
    totalHolders: number;
    totalTokensProcessed: number;
    unfreezeTransactions: Array<{
      accountId: string;
      transactionId: string;
      receipt: any;
    }>;
    transferTransactions: Array<{
      accountId: string;
      serialNumbers: number[];
      transactionId: string;
      receipt: any;
    }>;
    burnTransaction: {
      transactionId: string;
      receipt: any;
      totalBurned: number;
    };
  };
  error?: string;
  timestamp: string;
}

export interface SagCreationProgressData {
  jobId: string;
  sagId: string;
  stage: 'queued' | 'validating' | 'processing' | 'creating_sag' | 'creating_token' | 'uploading_metadata' | 'minting_tokens' | 'evaluating_gold' | 'updating_sag' | 'complete';
  progress: number; // 0-100
  message: string;
  details?: {
    currentStep?: string;
    totalSteps?: number;
    completedSteps?: number;
    currentBatch?: number;
    totalBatches?: number;
    currentTokens?: number;
    totalTokens?: number;
    processedTokens?: number;
  };
  timestamp: string;
}

export interface SagCreationCompleteData {
  jobId: string;
  sagId: string;
  success: boolean;
  data?: {
    sag: any;
    token: {
      tokenId: string;
      transactionId: string;
    };
    minting: {
      totalProcessed: number;
      totalFailed: number;
      batches: number;
      serialNumbers: number[];
      summary: string;
    };
    goldEvaluation?: {
      risk_level: string;
      ltv: number;
      collateral_value_myr: number;
      action: string;
      rationale: string;
      eval_id: string;
    };
  };
  error?: string;
  timestamp: string;
}

export interface TokenPurchaseProgressData {
  jobId: string;
  tokenId: string;
  stage: 'queued' | 'validating' | 'checking_balance' | 'processing_payment' | 'delivering_nfts' | 'freezing_tokens' | 'updating_database' | 'complete';
  progress: number; // 0-100
  message: string;
  timestamp: string;
  details?: {
    currentBatch?: number;
    totalBatches?: number;
    processedTokens?: number;
    totalTokens?: number;
    serialNumbers?: number[];
  };
}

export interface TokenPurchaseCompleteData {
  jobId: string;
  tokenId: string;
  serialNumbers: number[];
  investorAccountId: string;
  timestamp: string;
  data?: {
    transferTransactionId?: string;
    freezeTransactionId?: string;
    associationTransactionId?: string;
    batches?: any[];
  };
}

export interface TokenPurchaseErrorData {
  jobId: string;
  tokenId: string;
  error: string;
  timestamp: string;
}

class SocketServiceImpl implements SocketService {
  public io: SocketIOServer;

  constructor(server: HTTPServer | HTTPSServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Handle user authentication/room joining
      socket.on('join-user-room', (userId: string) => {
        socket.join(`user-${userId}`);
        console.log(`User ${userId} joined their room`);
      });

      // Handle user leaving room
      socket.on('leave-user-room', (userId: string) => {
        socket.leave(`user-${userId}`);
        console.log(`User ${userId} left their room`);
      });

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
  }

  emitRepaymentProgress(userId: string, data: RepaymentProgressData): void {
    this.io.to(`user-${userId}`).emit('repayment-progress', data);
    console.log(`Emitted repayment progress to user ${userId}:`, data);
  }

  emitRepaymentComplete(userId: string, data: RepaymentCompleteData): void {
    this.io.to(`user-${userId}`).emit('repayment-complete', data);
    console.log(`Emitted repayment complete to user ${userId}:`, data);
  }

  emitRepaymentError(userId: string, error: string): void {
    this.io.to(`user-${userId}`).emit('repayment-error', {
      error,
      timestamp: new Date().toISOString(),
    });
    console.log(`Emitted repayment error to user ${userId}:`, error);
  }

  emitSagCreationProgress(userId: string, data: SagCreationProgressData): void {
    this.io.to(`user-${userId}`).emit('sag-creation-progress', data);
    console.log(`Emitted SAG creation progress to user ${userId}:`, data);
  }

  emitSagCreationComplete(userId: string, data: SagCreationCompleteData): void {
    this.io.to(`user-${userId}`).emit('sag-creation-complete', data);
    console.log(`Emitted SAG creation complete to user ${userId}:`, data);
  }

  emitSagCreationError(userId: string, error: string): void {
    this.io.to(`user-${userId}`).emit('sag-creation-error', {
      error,
      timestamp: new Date().toISOString(),
    });
    console.log(`Emitted SAG creation error to user ${userId}:`, error);
  }

  emitTokenPurchaseProgress(userId: string, data: TokenPurchaseProgressData): void {
    this.io.to(`user-${userId}`).emit('token-purchase-progress', data);
    console.log(`Emitted token purchase progress to user ${userId}:`, data);
  }

  emitTokenPurchaseComplete(userId: string, data: TokenPurchaseCompleteData): void {
    this.io.to(`user-${userId}`).emit('token-purchase-complete', data);
    console.log(`Emitted token purchase complete to user ${userId}:`, data);
  }

  emitTokenPurchaseError(userId: string, data: TokenPurchaseErrorData): void {
    this.io.to(`user-${userId}`).emit('token-purchase-error', data);
    console.log(`Emitted token purchase error to user ${userId}:`, data);
  }
}

let socketServiceInstance: SocketService | null = null;

export function initializeSocketService(server: HTTPServer | HTTPSServer): SocketService {
  if (!socketServiceInstance) {
    socketServiceInstance = new SocketServiceImpl(server);
  }
  return socketServiceInstance;
}

export function getSocketService(): SocketService {
  if (!socketServiceInstance) {
    throw new Error('Socket service not initialized. Call initializeSocketService first.');
  }
  return socketServiceInstance;
}
