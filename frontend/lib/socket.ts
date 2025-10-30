import { io, Socket } from 'socket.io-client'

export interface RepaymentProgressData {
  jobId: string
  tokenId: string
  stage: 'queued' | 'validating' | 'calculating' | 'transferring' | 'processing_nft' | 'updating_status'
  progress: number // 0-100
  message: string
  timestamp: string
}

export interface RepaymentCompleteData {
  jobId: string
  tokenId: string
  success: boolean
  data?: {
    totalHolders: number
    totalTokensProcessed: number
    unfreezeTransactions: string[]
    transferTransactions: string[]
    burnTransaction: string
  }
  error?: string
  timestamp: string
}

export interface RepaymentErrorData {
  error: string
  timestamp: string
}

export interface SAGCreationProgressData {
  jobId: string
  sagId: string
  stage: 'queued' | 'validating' | 'creating_sag' | 'creating_token' | 'uploading_metadata' | 'minting_tokens' | 'updating_sag' | 'complete'
  progress: number // 0-100
  message: string
  timestamp: string
  details?: {
    currentStep?: string
    totalSteps?: number
    completedSteps?: number
    currentBatch?: number
    totalBatches?: number
    currentTokens?: number
    totalTokens?: number
    processedTokens?: number
  }
}

export interface SAGCreationCompleteData {
  jobId: string
  sagId: string
  tokenId: string
  timestamp: string
  data?: {
    transactionHash?: string
    tokenId?: string
    sagId?: string
  }
}

export interface SAGCreationErrorData {
  jobId: string
  sagId: string
  error: string
  timestamp: string
}

export interface TokenPurchaseProgressData {
  jobId: string
  tokenId: string
  stage: 'queued' | 'validating' | 'checking_balance' | 'processing_payment' | 'delivering_nfts' | 'freezing_tokens' | 'updating_database' | 'complete'
  progress: number // 0-100
  message: string
  timestamp: string
  details?: {
    currentBatch?: number
    totalBatches?: number
    processedTokens?: number
    totalTokens?: number
    serialNumbers?: number[]
  }
}

export interface TokenPurchaseCompleteData {
  jobId: string
  tokenId: string
  serialNumbers: number[]
  investorAccountId: string
  timestamp: string
  data?: {
    transferTransactionId?: string
    freezeTransactionId?: string
    associationTransactionId?: string
    batches?: any[]
  }
}

export interface TokenPurchaseErrorData {
  jobId: string
  tokenId: string
  error: string
  timestamp: string
}

class SocketService {
  private socket: Socket | null = null
  private isConnected = false

  connect(userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve()
        return
      }

      const serverUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'
      this.socket = io(serverUrl, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true,
      })

      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket?.id)
        this.isConnected = true
        
        // Join user room
        this.socket?.emit('join-user-room', userId)
        resolve()
      })

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
        this.isConnected = false
        reject(error)
      })

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason)
        this.isConnected = false
      })
    })
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }

  onRepaymentProgress(callback: (data: RepaymentProgressData) => void): void {
    this.socket?.on('repayment-progress', callback)
  }

  onRepaymentComplete(callback: (data: RepaymentCompleteData) => void): void {
    this.socket?.on('repayment-complete', callback)
  }

  onRepaymentError(callback: (data: RepaymentErrorData) => void): void {
    this.socket?.on('repayment-error', callback)
  }

  // SAG Creation event handlers
  onSAGCreationProgress(callback: (data: SAGCreationProgressData) => void): void {
    this.socket?.on('sag-creation-progress', callback)
  }

  onSAGCreationComplete(callback: (data: SAGCreationCompleteData) => void): void {
    this.socket?.on('sag-creation-complete', callback)
  }

  onSAGCreationError(callback: (data: SAGCreationErrorData) => void): void {
    this.socket?.on('sag-creation-error', callback)
  }

  // Token Purchase event handlers
  onTokenPurchaseProgress(callback: (data: TokenPurchaseProgressData) => void): void {
    this.socket?.on('token-purchase-progress', callback)
  }

  onTokenPurchaseComplete(callback: (data: TokenPurchaseCompleteData) => void): void {
    this.socket?.on('token-purchase-complete', callback)
  }

  onTokenPurchaseError(callback: (data: TokenPurchaseErrorData) => void): void {
    this.socket?.on('token-purchase-error', callback)
  }

  offRepaymentProgress(callback?: (data: RepaymentProgressData) => void): void {
    if (callback) {
      this.socket?.off('repayment-progress', callback)
    } else {
      this.socket?.off('repayment-progress')
    }
  }

  offRepaymentComplete(callback?: (data: RepaymentCompleteData) => void): void {
    if (callback) {
      this.socket?.off('repayment-complete', callback)
    } else {
      this.socket?.off('repayment-complete')
    }
  }

  offRepaymentError(callback?: (data: RepaymentErrorData) => void): void {
    if (callback) {
      this.socket?.off('repayment-error', callback)
    } else {
      this.socket?.off('repayment-error')
    }
  }

  // SAG Creation event cleanup handlers
  offSAGCreationProgress(callback?: (data: SAGCreationProgressData) => void): void {
    if (callback) {
      this.socket?.off('sag-creation-progress', callback)
    } else {
      this.socket?.off('sag-creation-progress')
    }
  }

  offSAGCreationComplete(callback?: (data: SAGCreationCompleteData) => void): void {
    if (callback) {
      this.socket?.off('sag-creation-complete', callback)
    } else {
      this.socket?.off('sag-creation-complete')
    }
  }

  offSAGCreationError(callback?: (data: SAGCreationErrorData) => void): void {
    if (callback) {
      this.socket?.off('sag-creation-error', callback)
    } else {
      this.socket?.off('sag-creation-error')
    }
  }

  // Token Purchase event cleanup handlers
  offTokenPurchaseProgress(callback?: (data: TokenPurchaseProgressData) => void): void {
    if (callback) {
      this.socket?.off('token-purchase-progress', callback)
    } else {
      this.socket?.off('token-purchase-progress')
    }
  }

  offTokenPurchaseComplete(callback?: (data: TokenPurchaseCompleteData) => void): void {
    if (callback) {
      this.socket?.off('token-purchase-complete', callback)
    } else {
      this.socket?.off('token-purchase-complete')
    }
  }

  offTokenPurchaseError(callback?: (data: TokenPurchaseErrorData) => void): void {
    if (callback) {
      this.socket?.off('token-purchase-error', callback)
    } else {
      this.socket?.off('token-purchase-error')
    }
  }

  get connected(): boolean {
    return this.isConnected && this.socket?.connected === true
  }
}

// Singleton instance
export const socketService = new SocketService()
