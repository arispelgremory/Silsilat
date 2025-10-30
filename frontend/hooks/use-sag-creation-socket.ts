import { useState, useEffect, useRef } from 'react'
import { socketService, SAGCreationProgressData, SAGCreationCompleteData, SAGCreationErrorData } from '@/lib/socket'

export interface UseSAGCreationSocketOptions {
  userId: string
  onProgress?: (data: SAGCreationProgressData) => void
  onComplete?: (data: SAGCreationCompleteData) => void
  onError?: (data: SAGCreationErrorData) => void
  autoConnect?: boolean
}

export interface UseSAGCreationSocketReturn {
  isConnected: boolean
  isConnecting: boolean
  connect: () => Promise<void>
  disconnect: () => void
  lastProgress: SAGCreationProgressData | null
  lastComplete: SAGCreationCompleteData | null
  lastError: SAGCreationErrorData | null
}

export function useSAGCreationSocket({
  userId,
  onProgress,
  onComplete,
  onError,
  autoConnect = true,
}: UseSAGCreationSocketOptions): UseSAGCreationSocketReturn {
  
  const [isConnecting, setIsConnecting] = useState(false)
  const [lastProgress, setLastProgress] = useState<SAGCreationProgressData | null>(null)
  const [lastComplete, setLastComplete] = useState<SAGCreationCompleteData | null>(null)
  const [lastError, setLastError] = useState<SAGCreationErrorData | null>(null)
  
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

    const handleProgress = (data: SAGCreationProgressData) => {
      setLastProgress(data)
      callbacksRef.current.onProgress?.(data)
    }

    const handleComplete = (data: SAGCreationCompleteData) => {
      setLastComplete(data)
      callbacksRef.current.onComplete?.(data)
    }

    const handleError = (data: SAGCreationErrorData) => {
      setLastError(data)
      callbacksRef.current.onError?.(data)
    }

    socketService.onSAGCreationProgress(handleProgress)
    socketService.onSAGCreationComplete(handleComplete)
    socketService.onSAGCreationError(handleError)

    return () => {
      socketService.offSAGCreationProgress(handleProgress)
      socketService.offSAGCreationComplete(handleComplete)
      socketService.offSAGCreationError(handleError)
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
