import { useState, useEffect, useRef } from 'react'
import { socketService, TokenPurchaseProgressData, TokenPurchaseCompleteData, TokenPurchaseErrorData } from '@/lib/socket'

export interface UseTokenPurchaseSocketOptions {
  userId: string
  onProgress?: (data: TokenPurchaseProgressData) => void
  onComplete?: (data: TokenPurchaseCompleteData) => void
  onError?: (data: TokenPurchaseErrorData) => void
  autoConnect?: boolean
}

export interface UseTokenPurchaseSocketReturn {
  isConnected: boolean
  isConnecting: boolean
  connect: () => Promise<void>
  disconnect: () => void
  lastProgress: TokenPurchaseProgressData | null
  lastComplete: TokenPurchaseCompleteData | null
  lastError: TokenPurchaseErrorData | null
}

export function useTokenPurchaseSocket({
  userId,
  onProgress,
  onComplete,
  onError,
  autoConnect = true,
}: UseTokenPurchaseSocketOptions): UseTokenPurchaseSocketReturn {
  
  const [isConnecting, setIsConnecting] = useState(false)
  const [lastProgress, setLastProgress] = useState<TokenPurchaseProgressData | null>(null)
  const [lastComplete, setLastComplete] = useState<TokenPurchaseCompleteData | null>(null)
  const [lastError, setLastError] = useState<TokenPurchaseErrorData | null>(null)
  
  const callbacksRef = useRef({ onProgress, onComplete, onError })

  // Update callbacks ref when they change
  useEffect(() => {
    callbacksRef.current = { onProgress, onComplete, onError }
  }, [onProgress, onComplete, onError])

  const connect = async () => {
    if (socketService.connected || isConnecting) return

    setIsConnecting(true)
    try {
      await socketService.connect(userId)
    } catch (error) {
      console.error('Failed to connect to socket:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = () => {
    socketService.disconnect()
  }

  useEffect(() => {
    if (autoConnect && userId) {
      connect()

      return () => {
        disconnect()
      }
    }
  }, [userId, autoConnect])

  useEffect(() => {
    if (!socketService.connected) return

    const handleProgress = (data: TokenPurchaseProgressData) => {
      setLastProgress(data)
      callbacksRef.current.onProgress?.(data)
    }

    const handleComplete = (data: TokenPurchaseCompleteData) => {
      setLastComplete(data)
      callbacksRef.current.onComplete?.(data)
    }

    const handleError = (data: TokenPurchaseErrorData) => {
      setLastError(data)
      callbacksRef.current.onError?.(data)
    }

    socketService.onTokenPurchaseProgress(handleProgress)
    socketService.onTokenPurchaseComplete(handleComplete)
    socketService.onTokenPurchaseError(handleError)

    return () => {
      socketService.offTokenPurchaseProgress(handleProgress)
      socketService.offTokenPurchaseComplete(handleComplete)
      socketService.offTokenPurchaseError(handleError)
    }
  }, [socketService.connected])

  return {
    isConnected: socketService.connected,
    isConnecting,
    connect,
    disconnect,
    lastProgress,
    lastComplete,
    lastError,
  }
}

