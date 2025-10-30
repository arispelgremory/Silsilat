import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Clock, Loader2, AlertCircle, Coins, ExternalLinkIcon } from 'lucide-react'
import { TokenPurchaseProgressData, TokenPurchaseCompleteData, TokenPurchaseErrorData } from '@/lib/socket'

interface TokenPurchaseProgressTrackerProps {
  isVisible: boolean
  onClose: () => void
  progressData: TokenPurchaseProgressData | null
  completeData: TokenPurchaseCompleteData | null
  errorData: TokenPurchaseErrorData | null
}

const stageLabels = {
  queued: 'Queued',
  validating: 'Validating',
  checking_balance: 'Checking Balance',
  processing_payment: 'Processing Payment',
  delivering_nfts: 'Delivering NFTs',
  freezing_tokens: 'Freezing Tokens',
  updating_database: 'Updating Database',
  complete: 'Complete',
}

const stageDescriptions = {
  queued: 'Your token purchase request has been queued for processing',
  validating: 'Validating purchase parameters and user permissions',
  checking_balance: 'Verifying your wallet balance and available tokens',
  processing_payment: 'Processing payment transfer to pawnshop',
  delivering_nfts: 'Transferring NFT tokens to your account',
  freezing_tokens: 'Securing tokens in your account',
  updating_database: 'Updating system records and balances',
  complete: 'Token purchase completed successfully',
}

export function TokenPurchaseProgressTracker({
  isVisible,
  onClose,
  progressData,
  completeData,
  errorData,
}: TokenPurchaseProgressTrackerProps) {
  const [showDetails, setShowDetails] = useState(false)

  if (!isVisible) return null

  const getStatusIcon = () => {
    if (errorData) return <XCircle className="h-5 w-5 text-red-500" />
    if (completeData) return <CheckCircle className="h-5 w-5 text-green-500" />
    if (progressData) return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
    return <Clock className="h-5 w-5 text-gray-500" />
  }

  const getStatusColor = () => {
    if (errorData) return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700'
    if (completeData) return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700'
    return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700'
  }

  const getStatusText = () => {
    if (errorData) return 'Purchase Failed'
    if (completeData) return 'Purchase Complete'
    if (progressData) return 'Processing Purchase'
    return 'Initializing...'
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className={`w-80 ${getStatusColor()}`}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon()}
              <div>
                <CardTitle className="text-lg">{getStatusText()}</CardTitle>
                <CardDescription>
                  {progressData?.tokenId || completeData?.tokenId || errorData?.tokenId || 'Processing...'}
                </CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Progress Bar */}
          {progressData && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{progressData.progress}%</span>
              </div>
              <Progress value={progressData.progress} className="h-2" />
            </div>
          )}

          {/* Current Stage */}
          {progressData && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {stageLabels[progressData.stage]}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {progressData.message}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {stageDescriptions[progressData.stage]}
              </p>
              
              {/* Batch Progress */}
              {progressData.details && (
                <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded text-xs">
                  {progressData.details.currentBatch && progressData.details.totalBatches && (
                    <div className="flex justify-between mb-1">
                      <span className="text-muted-foreground">Batch Progress:</span>
                      <span className="font-medium">
                        {progressData.details.currentBatch} / {progressData.details.totalBatches}
                      </span>
                    </div>
                  )}
                  {progressData.details.processedTokens && progressData.details.totalTokens && (
                    <div className="flex justify-between mb-1">
                      <span className="text-muted-foreground">Tokens Processed:</span>
                      <span className="font-medium">
                        {progressData.details.processedTokens} / {progressData.details.totalTokens}
                      </span>
                    </div>
                  )}
                  {progressData.details.serialNumbers && progressData.details.serialNumbers.length > 0 && (
                    <div>
                      <span className="text-muted-foreground">Serial Numbers:</span>
                      <div className="text-xs font-mono bg-gray-100 dark:bg-gray-700 p-1 rounded mt-1">
                        {progressData.details.serialNumbers.slice(0, 5).join(', ')}
                        {progressData.details.serialNumbers.length > 5 && '...'}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Error Display */}
          {errorData && (
            <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg border border-red-200 dark:border-red-700">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    Purchase Failed
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                    {errorData.error}
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    {new Date(errorData.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Success Display */}
          {completeData && (
            <div className="space-y-3">
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg border border-green-200 dark:border-green-700">
                <div className="flex items-start gap-2">
                  <Coins className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      Tokens Purchased Successfully
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                      {completeData.serialNumbers.length} NFT{completeData.serialNumbers.length !== 1 ? 's' : ''} added to your account
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      {new Date(completeData.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Purchase Details */}
              {completeData.data && (
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDetails(!showDetails)}
                    className="w-full"
                  >
                    {showDetails ? 'Hide' : 'Show'} Transaction Details
                  </Button>

                  {showDetails && (
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Token ID:</span>
                        <span className="font-medium">{completeData.tokenId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Serial Numbers:</span>
                        <span className="font-medium">{completeData.serialNumbers.join(', ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Investor Account:</span>
                        <span className="font-medium">{completeData.investorAccountId}</span>
                      </div>
                      {completeData.data.transferTransactionId && (
                        <div className="space-y-1">
                          <p className="text-muted-foreground">Transfer Transaction:</p>
                          <div className="text-xs font-mono bg-gray-100 dark:bg-gray-700 p-1 rounded break-all">
                            {completeData.data.transferTransactionId}
                          </div>
                        </div>
                      )}
                      {completeData.data.freezeTransactionId && (
                        <div className="space-y-1">
                          <p className="text-muted-foreground">Freeze Transaction:</p>
                          <div className="text-xs font-mono bg-gray-100 dark:bg-gray-700 p-1 rounded break-all">
                            {completeData.data.freezeTransactionId}
                          </div>
                        </div>
                      )}
                      {completeData.data.associationTransactionId && (
                        <div className="space-y-1">
                          <p className="text-muted-foreground">Association Transaction:</p>
                          <div className="text-xs font-mono bg-gray-100 dark:bg-gray-700 p-1 rounded break-all">
                            {completeData.data.associationTransactionId}
                          </div>
                        </div>
                      )}
                      {completeData.tokenId && (
                        <div className="pt-2">
                          <Button asChild size="sm" variant="outline" className="w-full">
                            <a 
                              href={`${process.env.NEXT_PUBLIC_ENV_URL}/${completeData.tokenId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2"
                            >
                              <ExternalLinkIcon className="h-3 w-3" />
                              View Token on HashScan
                            </a>
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {(completeData || errorData) && (
              <Button onClick={onClose} className="flex-1">
                Close
              </Button>
            )}
            {progressData && !completeData && !errorData && (
              <Button variant="outline" onClick={onClose} className="flex-1">
                Minimize
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

