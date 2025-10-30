import { useEffect, useRef, useState } from 'react'
import { socketService, RepaymentProgressData, RepaymentCompleteData, RepaymentErrorData } from '@/lib/socket'

export interface UseSocketRepaymentOptions {
  userId: string
  onProgress?: (data: RepaymentProgressData) => void
  onComplete?: (data: RepaymentCompleteData) => void
  onError?: (data: RepaymentErrorData) => void
  autoConnect?: boolean
}

export interface UseSocketRepaymentReturn {
  isConnected: boolean
  isConnecting: boolean
  connect: () => Promise<void>
  disconnect: () => void
  lastProgress: RepaymentProgressData | null
  lastComplete: RepaymentCompleteData | null
  lastError: RepaymentErrorData | null
}

export function useSocketRepayment({
  userId,
  onProgress,
  onComplete,
  onError,
  autoConnect = true,
}: UseSocketRepaymentOptions): UseSocketRepaymentReturn {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [lastProgress, setLastProgress] = useState<RepaymentProgressData | null>(null)
  const [lastComplete, setLastComplete] = useState<RepaymentCompleteData | null>(null)
  const [lastError, setLastError] = useState<RepaymentErrorData | null>(null)
  
  const callbacksRef = useRef({ onProgress, onComplete, onError })

  // Update callbacks ref when they change
  useEffect(() => {
    callbacksRef.current = { onProgress, onComplete, onError }
  }, [onProgress, onComplete, onError])

  const connect = async () => {
    if (isConnected || isConnecting) return

    setIsConnecting(true)
    try {
      await socketService.connect(userId)
      setIsConnected(true)
    } catch (error) {
      console.error('Failed to connect to socket:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = () => {
    socketService.disconnect()
    setIsConnected(false)
  }

  useEffect(() => {
    if (autoConnect && userId) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [userId, autoConnect])

  useEffect(() => {
    if (!isConnected) return

    const handleProgress = (data: RepaymentProgressData) => {
      setLastProgress(data)
      callbacksRef.current.onProgress?.(data)
    }

    const handleComplete = (data: RepaymentCompleteData) => {
      setLastComplete(data)
      callbacksRef.current.onComplete?.(data)
    }

    const handleError = (data: RepaymentErrorData) => {
      setLastError(data)
      callbacksRef.current.onError?.(data)
    }

    socketService.onRepaymentProgress(handleProgress)
    socketService.onRepaymentComplete(handleComplete)
    socketService.onRepaymentError(handleError)

    return () => {
      socketService.offRepaymentProgress(handleProgress)
      socketService.offRepaymentComplete(handleComplete)
      socketService.offRepaymentError(handleError)
    }
  }, [isConnected])

  return {
    isConnected,
    isConnecting,
    connect,
    disconnect,
    lastProgress,
    lastComplete,
    lastError,
  }
}
