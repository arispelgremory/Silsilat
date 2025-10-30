import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Clock, Loader2, AlertCircle } from 'lucide-react'
import { RepaymentProgressData, RepaymentCompleteData, RepaymentErrorData } from '@/lib/socket'

interface RepaymentProgressTrackerProps {
  isVisible: boolean
  onClose: () => void
  progressData: RepaymentProgressData | null
  completeData: RepaymentCompleteData | null
  errorData: RepaymentErrorData | null
}

const stageLabels = {
  queued: 'Queued',
  validating: 'Validating',
  calculating: 'Calculating',
  transferring: 'Transferring',
  processing_nft: 'Processing NFT',
  updating_status: 'Updating Status',
}

const stageDescriptions = {
  queued: 'Your repayment request has been queued for processing',
  validating: 'Validating transaction parameters and user permissions',
  calculating: 'Calculating repayment amounts and investor distributions',
  transferring: 'Processing token transfers to investors',
  processing_nft: 'Updating NFT ownership and blockchain records',
  updating_status: 'Finalizing transaction and updating system status',
}

export function RepaymentProgressTracker({
  isVisible,
  onClose,
  progressData,
  completeData,
  errorData,
}: RepaymentProgressTrackerProps) {
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
    if (errorData) return 'Repayment Failed'
    if (completeData) return 'Repayment Complete'
    if (progressData) return 'Processing Repayment'
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
                  {progressData?.tokenId ? `Token: ${progressData.tokenId}` : 'Processing...'}
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
            </div>
          )}

          {/* Error Display */}
          {errorData && (
            <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg border border-red-200 dark:border-red-700">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    Repayment Failed
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
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      Repayment Successful
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                      {new Date(completeData.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Transaction Details */}
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
                        <span className="text-muted-foreground">Total Holders:</span>
                        <span className="font-medium">{completeData.data.totalHolders}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tokens Processed:</span>
                        <span className="font-medium">{completeData.data.totalTokensProcessed}</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Unfreeze Transactions:</p>
                        <div className="space-y-1">
                          {completeData.data.unfreezeTransactions.map((tx, index) => (
                            <div key={index} className="text-xs font-mono bg-gray-100 dark:bg-gray-700 p-1 rounded">
                              {tx}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Transfer Transactions:</p>
                        <div className="space-y-1">
                          {completeData.data.transferTransactions.map((tx, index) => (
                            <div key={index} className="text-xs font-mono bg-gray-100 dark:bg-gray-700 p-1 rounded">
                              {tx}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Burn Transaction:</p>
                        <div className="text-xs font-mono bg-gray-100 dark:bg-gray-700 p-1 rounded">
                          {completeData.data.burnTransaction}
                        </div>
                      </div>
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
