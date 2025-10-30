"use client"

import { useEffect, useState } from "react"
import { useQuery, useQueryClient } from '@tanstack/react-query'
import apiInstance from '@/lib/axios-v1'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CreditCard, CheckCircle, AlertTriangle, DollarSign, Calendar, FileText, Wallet, RefreshCw, ExternalLinkIcon } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/hooks/use-auth"
import { TopUpDialog } from "@/components/dashboard/topup-dialog"
import Link from "next/link"
import { TokenResponse } from "@/types/sag"
import { useSocketRepayment } from '@/hooks/use-socket-repayment'
import { RepaymentProgressTracker } from '@/components/repayment-progress-tracker'
import { UserProfile } from "@/lib/auth/auth-service"

interface SAGProperties {
  loan?: number
  karat: number
  tenorM: number
  weightG: number
  currency: string
  assetType: string
  mintShare: number
  valuation: number
  enableMinting: boolean
  loanPercentage?: number
  pawnerInterestP?: number
  investorFinancingType: string
  investorRoiPercentage: number
  investorRoiFixedAmount?: number
}

interface SAG {
  sagId: string
  tokenId: string
  sagName: string
  sagDescription: string
  sagProperties: SAGProperties
  sagType: string
  certNo: string
  status?: 'active' | 'closed'
  createdAt?: string
}

interface SAGResponse {
  success: boolean
  message: string
  data: SAG[]
  pagination: {
    count: number
    totalCount: number
    currentPage: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

interface RepaymentData {
  sagId: string
  sagName: string
  arRahnu: string
  amount: string
  dueDate: string
  status: "on-time" | "early" | "late"
  daysRemaining: number
  investorPayout: string
  invoiceSent: boolean
  lastPayment: string
  assetType: string
  weight: string
  karat: number
  tenor: number
  roiPercentage: number
  tokenId: string
}

// Helper function to calculate due date based on tenor
const calculateDueDate = (createdAt: string | undefined, tenorMonths: number): string => {
  if (!createdAt) {
    // If no creation date, use a mock date
    const today = new Date()
    today.setMonth(today.getMonth() + tenorMonths)
    return today.toISOString().split('T')[0]
  }
  const date = new Date(createdAt)
  date.setMonth(date.getMonth() + tenorMonths)
  return date.toISOString().split('T')[0]
}

// Helper function to calculate days remaining
const calculateDaysRemaining = (dueDate: string): number => {
  const today = new Date()
  const due = new Date(dueDate)
  const diffTime = due.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

// Helper function to determine repayment status
const getRepaymentStatus = (daysRemaining: number): "on-time" | "early" | "late" => {
  if (daysRemaining < 0) return "late"
  if (daysRemaining > 60) return "early"
  return "on-time"
}

// Transform SAG data to Repayment data
const transformSAGToRepayment = (sag: SAG): RepaymentData => {
  const loanAmount = sag.sagProperties.valuation * ((sag.sagProperties.loanPercentage || 70) / 100)
  const investorReturn = loanAmount * (1 + (sag.sagProperties.investorRoiPercentage / 100))
  const dueDate = calculateDueDate(sag.createdAt, sag.sagProperties.tenorM)
  const daysRemaining = calculateDaysRemaining(dueDate)
  const status = getRepaymentStatus(daysRemaining)
  
  // Generate a mock last payment date (1-2 months before due date)
  const lastPaymentDate = new Date(dueDate)
  lastPaymentDate.setMonth(lastPaymentDate.getMonth() - 1)

  return {
    sagId: sag.sagId,
    sagName: sag.sagName,
    arRahnu: sag.sagDescription || "Branch",
    amount: `${sag.sagProperties.currency} ${loanAmount.toLocaleString()}`,
    dueDate: dueDate,
    status: status,
    daysRemaining: daysRemaining,
    investorPayout: `${sag.sagProperties.currency} ${investorReturn.toLocaleString()}`,
    invoiceSent: status !== "late",
    lastPayment: lastPaymentDate.toISOString().split('T')[0],
    assetType: sag.sagProperties.assetType,
    weight: `${sag.sagProperties.weightG}g`,
    karat: sag.sagProperties.karat,
    tenor: sag.sagProperties.tenorM,
    roiPercentage: sag.sagProperties.investorRoiPercentage,
    tokenId: sag.tokenId,
  }
}

interface WalletBalanceResponse {
  success: boolean
  data: {
    balance: string
  }
}

export default function RepaymentPage() {
  const [selectedRepayment, setSelectedRepayment] = useState<RepaymentData | null>(null)
  const [showBuybackProgressTracker, setShowBuybackProgressTracker] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  
  // Fetch user profile from API
  const { data: userProfile, isLoading: userProfileLoading, error: userProfileError } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async (): Promise<UserProfile> => {
      const response = await apiInstance.get('/auth/user/profile')
      return response.data.data.userInfo
      // return response.data.data
    },
  })

  // Extract accountId from user profile
  // const accountId = userProfile?.userInfo?.accountId

  // Fetch active SAG listings from API
  const { data, isLoading, error } = useQuery({
    queryKey: ['repayment-sags'],
    queryFn: async (): Promise<SAGResponse> => {
      const response = await apiInstance.get('/sag?page_size=100&page_number=1&status=active')
      return response.data
    },
  })

  // Fetch wallet balance from API
  const { data: balanceData, isLoading: balanceLoading, refetch: refetchBalance } = useQuery({
    queryKey: ['wallet-balance'],
    queryFn: async (): Promise<WalletBalanceResponse> => {
      const response = await apiInstance.get('/investor/wallet/balance')
      return response.data
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  })

  const { data: tokenInfo, isLoading: tokenLoading, error: tokenError } = useQuery({
    queryKey: ['token-info', selectedRepayment?.tokenId],
    queryFn: async (): Promise<TokenResponse> => {
      const response = await apiInstance.get(`/token/${selectedRepayment?.tokenId}`)
      return response.data
    },
    enabled: !!selectedRepayment?.tokenId, // Only fetch when dialog is open and tokenId exists
  })

  // Socket.IO integration for buyback tracking
  const {
    isConnected,
    connect,
    lastProgress,
    lastComplete,
    lastError,
  } = useSocketRepayment({
    userId: userProfile?.accountId || '', // Use actual user ID or fallback
    onProgress: (data) => {
      console.log('Buyback progress:', data)
    },
    onComplete: (data) => {
      console.log('Buyback complete:', data)
      setIsProcessing(false)
      setShowBuybackProgressTracker(false)
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['repayment-sags'] })
      queryClient.invalidateQueries({ queryKey: ['wallet-balance'] })
      
      toast.success('SAG bought back successfully!')
    },
    onError: (data) => {
      console.log('Buyback error:', data)
      setIsProcessing(false)
      toast.error(`Failed to buy back SAG: ${data.error}`)
    },
    autoConnect: false, // We'll connect manually when needed
  })

  useEffect(() => {
    console.log('Progress', progress)
  }, [progress])

  const sags = data?.data || []
  const repaymentData = sags.map(transformSAGToRepayment)
  const walletBalance = balanceData?.data?.balance ? parseFloat(balanceData.data.balance) : 0

  const handleRefreshBalance = () => {
    refetchBalance()
    toast.success('Balance refreshed')
  }

  // Calculate statistics from real data
  const totalDue = repaymentData.reduce((sum, item) => {
    const amount = parseFloat(item.amount.replace(/[^\d.]/g, ''))
    return sum + amount
  }, 0)

  const onTimeCount = repaymentData.filter(item => item.status === 'on-time' || item.status === 'early').length
  const lateCount = repaymentData.filter(item => item.status === 'late').length
  const dueTodayCount = repaymentData.filter(item => item.daysRemaining <= 1 && item.daysRemaining >= 0).length

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "early":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-700">
            Early
          </Badge>
        )
      case "on-time":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-700">
            On-Time
          </Badge>
        )
      case "late":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-700">
            Late
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleBuyBack = async (sagId: string, tokenId: string, investorPayout: string) => {
    setIsProcessing(true)
    setIsDialogOpen(false) // Close the dialog when buyback is initiated
    // Parse the investor payout amount (remove currency symbol and convert to number)
    const requiredAmount = parseFloat(investorPayout.replace(/[^\d.]/g, ''))
    
    // Check if balance is sufficient
    if (walletBalance < requiredAmount) {
      toast.error('Insufficient Balance', {
        description: `You need ${investorPayout} but only have RM ${walletBalance.toLocaleString()}. Please top up your account.`,
        duration: 5000,
      })
      setIsProcessing(false)
      return
    }
    
    try {
      // Connect to Socket.IO for real-time buyback tracking
      await connect();
      
      // Show progress tracker
      setShowBuybackProgressTracker(true);

      const response = await apiInstance.post('/pawnshop/repayment', {
        sagId: sagId,
        tokenId: tokenId,
        pawnshopAccountId: user?.hederaAccount?.hederaAccountId
      })
      
      // The Socket.IO events will handle the success/error states
      // and update the UI accordingly
      
    } catch (error) {
      console.error('Failed to initiate buyback:', error);
      setIsProcessing(false);
      setShowBuybackProgressTracker(false);
      toast.error('Failed to initiate buyback: ' + (error as Error).message);
    }
  }
  
  // Helper function to check if user has sufficient balance
  const hasSufficientBalance = (investorPayout: string): boolean => {
    // const requiredAmount = parseFloat(investorPayout.replace(/[^\d.]/g, ''))
    const requiredAmount = tokenInfo?.data ? parseInt(tokenInfo.data.remainingSupply) : 0
    return walletBalance >= requiredAmount
  }

  const handleSettlement = () => {
    // Check settlement
    const eventSource = new EventSource(`${process.env.NEXT_PUBLIC_API_URL}/v1/test/sse`);

    eventSource.onmessage = (event) => {
      console.log('Settlement', event.data)
      const data = JSON.parse(event.data);
    }

    eventSource.onerror = (event) => {
      console.error('Settlement error', event)
    }


    const promise = new Promise((resolve, reject) => {
      eventSource.onmessage = (event) => {
        console.log('Settlement', event.data)
        const data = JSON.parse(event.data);
        // setProgress(data.progress);

        if (data.type === 'complete') {
          setProgress(100);
          resolve(data)
        } else {
          setProgress(Number(data.progress) || 0);
          console.log('Setting progress', Number(data.progress))
        }

        // console.log('Progress', progress)
        // console.log('data', data.message);
        // console.log('Data', data)
        // console.log('event', event)
      }
    })

    toast.promise(promise, {
      loading: <><div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
        <div className="text-sm text-blue-500">Processing settlement... {progress}%</div>
      </div></>,
      success: () => {
        return 'Settlement processed successfully!'
      },
      error: () => {
        return 'Failed to process settlement!'
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Repayment & Settlement</h1>
          <p className="text-gray-600">Monitor repayments and manage settlements</p>
          <div className="mt-2 flex items-center gap-2">
            {balanceLoading ? (
              <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                <Wallet className="h-3 w-3 mr-1" />
                Loading balance...
              </Badge>
            ) : (
              <>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-base py-1.5 px-3">
                  <Wallet className="h-4 w-4 mr-2" />
                  Wallet Balance: RM {walletBalance.toLocaleString()}
                </Badge>
                <Button 
                  onClick={handleRefreshBalance} 
                  variant="ghost" 
                  size="sm"
                  disabled={balanceLoading}
                  className="h-7 w-7 p-0"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${balanceLoading ? 'animate-spin' : ''}`} />
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <TopUpDialog />
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <CreditCard className="h-4 w-4 mr-2" />
            Process Settlement
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-900 flex items-center justify-between">
              Wallet Balance
              <Wallet className="h-4 w-4 text-blue-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {balanceLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold text-blue-700">RM {walletBalance.toLocaleString()}</div>
            )}
            <p className="text-xs text-blue-600 mt-1">Available funds</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Due</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">RM {(totalDue / 1000000).toFixed(2)}M</div>
            )}
            <p className="text-xs text-gray-500">Across all SAGs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">On-Time Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-green-600">{onTimeCount}</div>
            )}
            <p className="text-xs text-gray-500">
              {repaymentData.length > 0 ? Math.round((onTimeCount / repaymentData.length) * 100) : 0}% success rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Late Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-red-600">{lateCount}</div>
            )}
            <p className="text-xs text-gray-500">Require attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Settlements Today</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-blue-600">{dueTodayCount}</div>
            )}
            <p className="text-xs text-gray-500">To be processed</p>
          </CardContent>
        </Card>
      </div>

      {/* Repayment Table */}
      <Card>
        <CardHeader>
          <CardTitle>Repayment Status</CardTitle>
          <CardDescription>Monitor all SAG repayments and settlements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SAG ID</TableHead>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Days Remaining</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Loading skeleton rows
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={`loading-${i}`}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                    </TableRow>
                  ))
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-red-600">
                      Failed to load repayment data. Please try again.
                    </TableCell>
                  </TableRow>
                ) : repaymentData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No active SAG listings with repayment schedules found.
                    </TableCell>
                  </TableRow>
                ) : (
                  repaymentData.map((repayment) => (
                    <TableRow key={repayment.sagId}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-medium">{repayment.sagId}</div>
                          <div className="text-xs text-gray-500">{repayment.sagName}</div>
                        </div>
                      </TableCell>
                      <TableCell>{repayment.arRahnu}</TableCell>
                      <TableCell>{repayment.amount}</TableCell>
                      <TableCell>{repayment.dueDate}</TableCell>
                      <TableCell>{getStatusBadge(repayment.status)}</TableCell>
                      <TableCell>
                        <span className={repayment.daysRemaining < 0 ? "text-red-600" : "text-gray-600"}>
                          {repayment.daysRemaining < 0
                            ? `${Math.abs(repayment.daysRemaining)} days overdue`
                            : `${repayment.daysRemaining} days`}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 items-center">
                          {!hasSufficientBalance(repayment.investorPayout) && (
                            <div className="relative group">
                              <AlertTriangle className="h-4 w-4 text-red-600" />
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                Insufficient balance
                              </div>
                            </div>
                          )}
                          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedRepayment(repayment)
                                  setIsDialogOpen(true)
                                }}
                                className="bg-transparent"
                              >
                                View Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Repayment Details - {selectedRepayment?.sagName}</DialogTitle>
                                <DialogDescription>Complete repayment and settlement information</DialogDescription>
                              </DialogHeader>
                              {selectedRepayment && (
                                <div className="space-y-6">
                                  <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                      <label className="text-sm font-medium">SAG ID</label>
                                      <p className="text-sm text-gray-600">{selectedRepayment.sagId}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">SAG Name</label>
                                      <p className="text-sm text-gray-600">{selectedRepayment.sagName}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Ar Rahnu Branch</label>
                                      <p className="text-sm text-gray-600">{selectedRepayment.arRahnu}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Asset Type</label>
                                      <p className="text-sm text-gray-600">{selectedRepayment.assetType} - {selectedRepayment.weight} ({selectedRepayment.karat}K)</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Loan Amount</label>
                                      <p className="text-sm text-gray-600">{selectedRepayment.amount}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Investor Payout</label>
                                      <p className="text-sm font-semibold text-green-700">{selectedRepayment.investorPayout}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">ROI Percentage</label>
                                      <p className="text-sm text-gray-600">{selectedRepayment.roiPercentage}%</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Tenor</label>
                                      <p className="text-sm text-gray-600">{selectedRepayment.tenor} months</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Due Date</label>
                                      <p className="text-sm text-gray-600">{selectedRepayment.dueDate}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Last Payment</label>
                                      <p className="text-sm text-gray-600">{selectedRepayment.lastPayment}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Status</label>
                                      <div className="mt-1">{getStatusBadge(selectedRepayment.status)}</div>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Invoice Status</label>
                                      <p className="text-sm text-gray-600">{selectedRepayment.invoiceSent ? "Sent ✓" : "Not Sent"}</p>
                                    </div>
                                  </div>

                                  <div className="border-t pt-4">
                                    <h4 className="font-medium mb-3">Settlement Actions</h4>
                                    <div className="flex gap-2 flex-wrap">
                                      <Button onClick={() => handleSettlement()} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Trigger Settlement
                                      </Button>
                                      <Button size="sm" variant="outline" className="bg-transparent">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Adjust Date
                                      </Button>
                                      <Button size="sm" variant="outline" className="bg-transparent">
                                        <FileText className="h-4 w-4 mr-2" />
                                        Send Invoice
                                      </Button>
                                      <Button size="sm" variant="outline" className="bg-transparent">
                                        <DollarSign className="h-4 w-4 mr-2" />
                                        Adjust Amount
                                      </Button>
                                    </div>
                                  </div>

                                  <div className="border-t pt-4">
                                    <h4 className="font-medium mb-3">Token/NFT Actions</h4>
                                    <div className="space-y-3">
                                      <div className="flex gap-2 items-start">
                                        <Button 
                                          onClick={() => handleBuyBack(selectedRepayment.sagId, selectedRepayment.tokenId, selectedRepayment.investorPayout)} 
                                          size="sm" 
                                          variant="destructive"
                                          disabled={!hasSufficientBalance(selectedRepayment.investorPayout) || isProcessing}
                                          className="flex-1"
                                        >
                                          <CheckCircle className="h-4 w-4 mr-2" />
                                          Buy Back & Burn Tokens
                                        </Button>
                                        <Button asChild size="sm" variant="outline" className="bg-transparent flex-1">
                                          <Link href={`${process.env.NEXT_PUBLIC_ENV_URL}/${selectedRepayment.tokenId}`} target="_blank">
                                            <ExternalLinkIcon className="h-4 w-4 mr-2" />
                                            View Token Status
                                          </Link>
                                        </Button>
                                      </div>
                                      
                                      {!hasSufficientBalance(selectedRepayment.investorPayout) && (
                                        <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm">
                                          <div className="flex items-start gap-2">
                                            <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1">
                                              <p className="font-medium text-red-800">Insufficient Balance</p>
                                              <p className="text-red-600 mt-1">
                                                Required: <span className="font-semibold">{selectedRepayment.investorPayout}</span>
                                              </p>
                                              <p className="text-red-600">
                                                Available: <span className="font-semibold">RM {walletBalance.toLocaleString()}</span>
                                              </p>
                                              <p className="text-red-600 mt-1">
                                                Shortfall: <span className="font-semibold">RM {(parseFloat(selectedRepayment.investorPayout.replace(/[^\d.]/g, '')) - walletBalance).toLocaleString()}</span>
                                              </p>
                                              <p className="text-red-600 mt-2 text-xs">
                                                Please top up your account to proceed with the buyback.
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          {repayment.status === "late" && (
                            <Button size="sm" variant="destructive">
                              <AlertTriangle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Bulk Settlement</CardTitle>
            <CardDescription>Process multiple settlements at once</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700">Process All Due Today</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Late Payment Alerts</CardTitle>
            <CardDescription>Send reminders to overdue accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full bg-transparent">
              Send Reminder Emails
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Settlement Reports</CardTitle>
            <CardDescription>Generate settlement reports</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full bg-transparent">
              Download Report
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Buyback Progress Tracker */}
      <RepaymentProgressTracker
        isVisible={showBuybackProgressTracker}
        onClose={() => setShowBuybackProgressTracker(false)}
        progressData={lastProgress}
        completeData={lastComplete}
        errorData={lastError}
      />
    </div>
  )
}
