"use client"

import { useState, useEffect } from 'react'
import { useTokenPurchaseSocket } from '@/hooks/use-token-purchase-socket'
import { TokenPurchaseProgressTracker } from '@/components/token-purchase-progress-tracker'
import { useAuth } from '@/hooks/use-auth'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export function TokenPurchaseTrackerProvider() {
  const [showTracker, setShowTracker] = useState(false)
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Socket.IO integration for token purchase tracking
  const {
    isConnected,
    connect,
    lastProgress,
    lastComplete,
    lastError,
  } = useTokenPurchaseSocket({
    userId: user?.profile?.accountId || '',
    onProgress: (data) => {
      console.log('Token purchase progress:', data)
      setShowTracker(true)
    },
    onComplete: (data) => {
      console.log('Token purchase complete:', data)
      
      // Show success toast
      toast.success(`Successfully purchased ${data.serialNumbers.length} NFT${data.serialNumbers.length !== 1 ? 's' : ''}!`)
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['wallet-balance'] })
      queryClient.invalidateQueries({ queryKey: ['more-opportunities'] })
      queryClient.invalidateQueries({ queryKey: ['token-info'] })
      
      // Keep tracker visible for a few seconds to show completion
      setTimeout(() => {
        setShowTracker(false)
      }, 5000)
    },
    onError: (data) => {
      console.log('Token purchase error:', data)
      
      // Show error toast
      toast.error(`Failed to purchase tokens: ${data.error}`)
      
      // Keep tracker visible for a few seconds to show error
      setTimeout(() => {
        setShowTracker(false)
      }, 5000)
    },
    autoConnect: true, // Auto-connect when component mounts
  })

  // Auto-connect when user is available
  useEffect(() => {
    if (user?.profile?.accountId && !isConnected) {
      connect()
    }
  }, [user?.profile?.accountId, isConnected, connect])

  return (
    <TokenPurchaseProgressTracker
      isVisible={showTracker}
      onClose={() => setShowTracker(false)}
      progressData={lastProgress}
      completeData={lastComplete}
      errorData={lastError}
    />
  )
}
