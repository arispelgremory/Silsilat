"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogHeader, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectLabel, SelectItem } from "@/components/ui/select"
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2, Eye, TrendingUp, DollarSign, ExternalLinkIcon, Star, Shield } from "lucide-react"
import { SAGResponse, SAGWithTokenData } from "@/types/sag"
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import apiInstance from '@/lib/axios-v1'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'
import Link from 'next/link'
import { Badge } from "@/components/ui/badge"

interface InvestorDashboardProps {
  // No props needed - will fetch data internally
}

interface TokenInfo {
  tokenId: string
  remainingSupply: string
  totalSupply: string
  treasuryAccountId: string
  createdAt: string
  expiredAt: string
}

interface TokenResponse {
  success: boolean
  data: TokenInfo
}

// Risk Rating Utility Functions
function getRiskStars(risk_level?: string): number {
  if (!risk_level) return 3 // Default to 3 stars if no risk level

  switch (risk_level.toUpperCase()) {
    case 'VERY_LOW':
      return 5
    case 'LOW':
      return 4
    case 'MEDIUM':
      return 3
    case 'HIGH':
      return 2
    case 'VERY_HIGH':
      return 1
    default:
      return 3
  }
}

function getRiskColor(risk_level?: string): { bg: string; text: string; border: string } {
  if (!risk_level) return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' }

  switch (risk_level.toUpperCase()) {
    case 'VERY_LOW':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' }
    case 'LOW':
      return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' }
    case 'MEDIUM':
      return { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' }
    case 'HIGH':
      return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' }
    case 'VERY_HIGH':
      return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' }
    default:
      return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' }
  }
}

// Risk Badge Component with Stars
function RiskBadge({ risk_level, ltv, compact = false }: { risk_level?: string; ltv?: number; compact?: boolean }) {
  const stars = getRiskStars(risk_level)
  const colors = getRiskColor(risk_level)

  if (!risk_level) {
    return (
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Shield className="h-3 w-3" />
        <span>No Risk Data</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${compact ? 'text-xs' : 'text-sm'}`}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} ${
              i < stars 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
      </div>
      <Badge variant="outline" className={`${colors.bg} ${colors.text} ${colors.border}`}>
        {risk_level.replace('_', ' ')}
      </Badge>
      {ltv !== undefined && !compact && (
        <span className="text-xs text-muted-foreground">
          LTV: {(ltv * 100).toFixed(1)}%
        </span>
      )}
    </div>
  )
}

// View More Opportunities Dialog
function ViewMoreOpportunitiesDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 6

  const { data: moreOpportunities, isLoading, error } = useQuery({
    queryKey: ['more-opportunities', currentPage],
    queryFn: async (): Promise<SAGResponse> => {
      const response = await apiInstance.get(`/sag?page_size=${pageSize}&page_number=${currentPage}&status=active&enableMinting=true`)
      return response.data
    },
    enabled: isOpen, // Only fetch when dialog is open
  })

  const sags = moreOpportunities?.data || []
  const pagination = moreOpportunities?.pagination

  const calculateMonthlyReturn = (sag: SAGWithTokenData) => {
    const mintValue = sag.sagProperties.valuation / sag.sagProperties.mintShare
    return (mintValue * sag.sagProperties.investorRoiPercentage) / 100
  }

  const calculateTotalReturn = (sag: SAGWithTokenData) => {
    const mintValue = sag.sagProperties.valuation / sag.sagProperties.mintShare
    const monthlyReturn = calculateMonthlyReturn(sag)
    return mintValue + (monthlyReturn * sag.sagProperties.tenorM)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-gold text-gold hover:bg-gold/10">
          <Eye className="h-4 w-4 mr-2" />
          View More Opportunities
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-gold" />
            More Investment Opportunities
          </DialogTitle>
          <DialogDescription>
            Discover additional SAG investment opportunities available for funding
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={`loading-${i}`} className="border-gold/20">
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Failed to load investment opportunities</p>
              <Button onClick={() => window.location.reload()} className="bg-brightGold hover:bg-gold text-deepGreen">
                Try Again
              </Button>
            </div>
          ) : sags.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No additional investment opportunities available</p>
              <p className="text-sm text-muted-foreground">Check back later for new listings</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sags.map((sag) => (
                  <Card key={sag.sagId} className="border-gold/20 hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-deepGreen text-base">
                            {sag.sagName || `SAG #${sag.sagId.slice(-8)}`}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {sag.sagDescription || `${sag.sagProperties.assetType} • ${sag.sagProperties.tenorM} months`}
                          </CardDescription>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${sag.status === 'active' ? 'bg-green-100 text-green-700' :
                            sag.status === 'closed' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                          }`}>
                          {sag.status}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Asset:</span>
                            <span className="font-medium">{sag.sagProperties.assetType}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Weight:</span>
                            <span className="font-medium">{sag.sagProperties.weightG}g</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Karat:</span>
                            <span className="font-medium">{sag.sagProperties.karat}K</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Duration:</span>
                            <span className="font-medium">{sag.sagProperties.tenorM}m</span>
                          </div>
                        </div>

                        <div className="border-t pt-2 space-y-2">
                          {/* Risk Assessment Card */}
                          {sag.sagProperties.risk_level && (
                            <div className={`p-2 rounded-lg mb-2 ${getRiskColor(sag.sagProperties.risk_level).bg} border ${getRiskColor(sag.sagProperties.risk_level).border}`}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium flex items-center gap-1">
                                  <Shield className="h-3 w-3" />
                                  Risk Rating
                                </span>
                                <div className="flex items-center gap-0.5">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-3 w-3 ${
                                        i < getRiskStars(sag.sagProperties.risk_level)
                                          ? 'fill-yellow-400 text-yellow-400' 
                                          : 'fill-gray-300 text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <Badge variant="outline" className={`${getRiskColor(sag.sagProperties.risk_level).bg} ${getRiskColor(sag.sagProperties.risk_level).text} ${getRiskColor(sag.sagProperties.risk_level).border} text-[10px] px-1.5 py-0.5`}>
                                  {sag.sagProperties.risk_level?.replace('_', ' ')}
                                </Badge>
                                {sag.sagProperties.ltv && (
                                  <span className="text-muted-foreground">
                                    LTV: {(sag.sagProperties.ltv * 100).toFixed(1)}%
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Share Price:</span>
                            <span className="font-semibold text-green-600">
                              {sag.sagProperties.currency} {(sag.sagProperties.valuation / sag.sagProperties.mintShare).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Monthly ROI:</span>
                            <span className="font-semibold text-green-600">{sag.sagProperties.investorRoiPercentage}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Available Shares:</span>
                            <span className="font-semibold">{sag.sagProperties.mintShare.toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Investment Summary */}
                        <div className="bg-blue-50 p-2 rounded text-xs">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3 text-green-600" />
                              <span className="text-muted-foreground">Monthly:</span>
                              <span className="font-medium text-green-600">
                                {sag.sagProperties.currency} {calculateMonthlyReturn(sag).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3 text-blue-600" />
                              <span className="text-muted-foreground">Total:</span>
                              <span className="font-medium text-blue-600">
                                {sag.sagProperties.currency} {calculateTotalReturn(sag).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground">Token:</span>
                          {sag.tokenId ? (
                            <a
                              className="text-blue-600 flex items-center gap-1 hover:underline"
                              href={`${process.env.NEXT_PUBLIC_ENV_URL}/${sag.tokenId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {sag.tokenId.slice(0, 8)}...
                              <ExternalLinkIcon size={12} />
                            </a>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>

                        <DashboardInvestmentDialog sag={sag} onInvestmentStart={() => setIsOpen(false)} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={!pagination.hasPrevPage}
                  >
                    Previous
                  </Button>

                  <span className="text-sm text-muted-foreground">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={!pagination.hasNextPage}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Wallet Balance Interface
interface WalletBalanceResponse {
  success: boolean
  data: {
    balance: string
  }
}

// Investment Dialog Component for Dashboard
function DashboardInvestmentDialog({ sag, onInvestmentStart }: { sag: SAGWithTokenData, onInvestmentStart?: () => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [investmentAmount, setInvestmentAmount] = useState(1)
  const [isInvesting, setIsInvesting] = useState(false)
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuth()

  const { data: tokenInfo, isLoading: tokenLoading, error: tokenError } = useQuery({
    queryKey: ['token-info', sag.tokenId],
    queryFn: async (): Promise<TokenResponse> => {
      const response = await apiInstance.get(`/token/${sag.tokenId}`)
      return response.data
    },
    enabled: isOpen && !!sag.tokenId, // Only fetch when dialog is open and tokenId exists
  })

  // Fetch wallet balance
  const { data: walletBalance, isLoading: balanceLoading } = useQuery({
    queryKey: ['wallet-balance'],
    queryFn: async (): Promise<WalletBalanceResponse> => {
      const response = await apiInstance.get('/investor/wallet/balance')
      return response.data
    },
    staleTime: 30 * 1000, // 30 seconds
  })

  const sharePrice = sag.sagProperties.valuation / sag.sagProperties.mintShare
  const monthlyReturn = (sharePrice * sag.sagProperties.investorRoiPercentage) / 100
  const totalReturn = sharePrice + (monthlyReturn * sag.sagProperties.tenorM)
  const totalInvestment = sharePrice * investmentAmount
  const totalExpectedReturn = totalReturn * investmentAmount
  const totalProfit = totalExpectedReturn - totalInvestment

  // Check if user has sufficient balance
  const currentBalance = walletBalance?.data ? parseFloat(walletBalance.data.balance) : 0
  const hasInsufficientBalance = currentBalance < totalInvestment
  const balanceShortage = hasInsufficientBalance ? totalInvestment - currentBalance : 0

  const handleInvest = async () => {
    // Double-check balance before investing
    if (hasInsufficientBalance) {
      toast.error('Insufficient Balance', {
        description: `You need ${sag.sagProperties.currency} ${balanceShortage.toFixed(2)} more to complete this investment.`
      })
      return
    }
    setIsInvesting(true)

    try {
      // Make API call to purchase token using async endpoint
      const response = await apiInstance.post('/investor/purchase-token', {
        "tokenId": sag.tokenId,
        "amount": investmentAmount,
        "totalValue": totalInvestment
      })

      // Show success message
      if (response.data?.data?.jobId) {
        toast.success('Token purchase process started! You can track the progress in the bottom-right corner.')
        setIsOpen(false)
        
        // Close the parent dialog (View More Opportunities) if callback is provided
        onInvestmentStart?.()
        
        // Invalidate queries to refresh the data
        queryClient.invalidateQueries({ queryKey: ['wallet-balance'] })
        queryClient.invalidateQueries({ queryKey: ['more-opportunities'] })
      }
      
    } catch (error) {
      console.error('Error processing token purchase:', error)
      toast.error('Failed to initiate token purchase. Please try again.')
    } finally {
      setIsInvesting(false)
    }
  }

  const remainingShares = tokenInfo?.data ? parseInt(tokenInfo.data.remainingSupply) : 0
  const maxInvestment = Math.min(remainingShares, 100) // Limit to 100 shares max per investment

  // If user is not authenticated, show login button instead
  if (!isAuthenticated) {
    return (
      <Button
        asChild
        className="w-full bg-brightGold hover:bg-gold text-deepGreen"
        disabled={sag.status !== 'active' || !sag.sagProperties.enableMinting}
      >
        <Link href="/login">
          {sag.status !== 'active' 
            ? 'Closed' 
            : !sag.sagProperties.enableMinting 
            ? 'Minting Disabled'
            : 'Login to Invest'}
        </Link>
      </Button>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="w-full bg-brightGold hover:bg-gold text-deepGreen"
          disabled={!sag.sagProperties.enableMinting || (balanceLoading ? false : hasInsufficientBalance)}
        >
          {sag.status !== 'active' 
            ? 'Closed' 
            : !sag.sagProperties.enableMinting 
            ? 'Minting Disabled' 
            : balanceLoading
            ? 'Loading...'
            : hasInsufficientBalance 
            ? 'Insufficient Balance'
            : 'Invest Now'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Invest in {sag.sagName || `SAG #${sag.sagId.slice(-8)}`}</DialogTitle>
          <DialogDescription>
            {sag.sagDescription || `${sag.sagProperties.assetType} • ${sag.sagProperties.tenorM} months`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Risk Assessment */}
          {sag.sagProperties.risk_level && (
            <div className={`p-3 rounded-lg ${getRiskColor(sag.sagProperties.risk_level).bg} border ${getRiskColor(sag.sagProperties.risk_level).border}`}>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">Risk Assessment</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < getRiskStars(sag.sagProperties.risk_level)
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'fill-gray-300 text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <Badge variant="outline" className={`${getRiskColor(sag.sagProperties.risk_level).bg} ${getRiskColor(sag.sagProperties.risk_level).text} ${getRiskColor(sag.sagProperties.risk_level).border}`}>
                  {sag.sagProperties.risk_level?.replace('_', ' ')}
                </Badge>
                {sag.sagProperties.ltv && (
                  <span className="text-xs text-muted-foreground">
                    LTV: {(sag.sagProperties.ltv * 100).toFixed(1)}%
                  </span>
                )}
              </div>
              {sag.sagProperties.rationale && (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {sag.sagProperties.rationale}
                </p>
              )}
            </div>
          )}
          {/* Wallet Balance Information */}
          {balanceLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
            </div>
          ) : walletBalance ? (
            <div className={`p-3 rounded-lg space-y-2 ${hasInsufficientBalance ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Your Wallet Balance:</span>
                <span className={`font-bold text-lg ${hasInsufficientBalance ? 'text-red-600' : 'text-green-600'}`}>
                  {sag.sagProperties.currency} {currentBalance.toFixed(2)}
                </span>
              </div>
              {hasInsufficientBalance && (
                <div className="text-xs text-red-600 bg-red-100 p-2 rounded">
                  ⚠️ Insufficient balance. You need {sag.sagProperties.currency} {balanceShortage.toFixed(2)} more to invest.
                </div>
              )}
            </div>
          ) : null}

          {/* Token Supply Information */}
          {tokenLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : tokenError ? (
            <div className="text-sm text-red-600">
              Failed to load token information
            </div>
          ) : tokenInfo ? (
            <div className="bg-muted p-3 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Supply:</span>
                <span className="font-medium">{tokenInfo.data.totalSupply} shares</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Available:</span>
                <span className="font-medium text-green-600">{tokenInfo.data.remainingSupply} shares</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sold:</span>
                <span className="font-medium">{parseInt(tokenInfo.data.totalSupply) - parseInt(tokenInfo.data.remainingSupply)} shares</span>
              </div>
            </div>
          ) : null}

          {/* Investment Amount */}
          <div className="space-y-2">
            <Label htmlFor="investment-amount">Number of Shares</Label>
            <Select
              value={investmentAmount.toString()}
              onValueChange={(value) => setInvestmentAmount(parseInt(value))}
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder="Select number of shares" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Available Shares</SelectLabel>
                  {Array.from({ length: Math.min(maxInvestment, 20) }, (_, i) => i + 1).map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? 'share' : 'shares'}
                    </SelectItem>
                  ))}
                  {maxInvestment > 20 && (
                    <>
                      <SelectItem value="25">25 shares - {sag.sagProperties.currency} {(sharePrice * 25).toFixed(2)}</SelectItem>
                      <SelectItem value="50">50 shares - {sag.sagProperties.currency} {(sharePrice * 50).toFixed(2)}</SelectItem>
                      {maxInvestment >= 100 && (
                        <SelectItem value="100">100 shares - {sag.sagProperties.currency} {(sharePrice * 100).toFixed(2)}</SelectItem>
                      )}
                    </>
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>

            <p className="text-xs text-muted-foreground">
              Maximum: {maxInvestment} shares available
            </p>
          </div>

          {/* Investment Summary */}
          <div className="bg-blue-50 p-3 rounded-lg space-y-2">
            <h4 className="font-medium text-sm">Investment Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Share Price:</span>
                <span className="font-medium">{sag.sagProperties.currency} {sharePrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shares:</span>
                <span className="font-medium">{investmentAmount}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Investment:</span>
                <span className="font-medium">{sag.sagProperties.currency} {totalInvestment.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span className="font-medium">{sag.sagProperties.tenorM} months</span>
              </div>
              <div className="flex justify-between">
                <span>Monthly ROI:</span>
                <span className="font-medium text-green-600">{sag.sagProperties.investorRoiPercentage}%</span>
              </div>
              <div className="border-t pt-1 mt-2">
                <div className="flex justify-between">
                  <span>Expected Return:</span>
                  <span className="font-medium text-green-600">{sag.sagProperties.currency} {totalExpectedReturn.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Profit:</span>
                  <span className="font-medium text-green-600">{sag.sagProperties.currency} {totalProfit.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleInvest}
              disabled={isInvesting || remainingShares === 0 || hasInsufficientBalance}
              className={`flex-1 ${hasInsufficientBalance ? 'bg-gray-400 hover:bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {isInvesting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Investing...
                </>
              ) : hasInsufficientBalance ? (
                `Insufficient Balance`
              ) : (
                `Invest ${sag.sagProperties.currency} ${totalInvestment.toFixed(2)}`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function InvestorDashboard({ }: InvestorDashboardProps) {
  const { isAuthenticated } = useAuth()

  // Fetch SAG data from API
  const { data: sagsResponse, isLoading, error } = useQuery({
    queryKey: ['main-sags'],
    queryFn: async (): Promise<{ data: SAGWithTokenData[] }> => {
      const response = await apiInstance.get('/sag?page_size=3&status=active&enableMinting=true&sort_by=created_at&sort_order=DESC')
      return response.data
    },
  })

  const sags: SAGWithTokenData[] = sagsResponse?.data || []

  // Loading state
  if (isLoading) {
    return (
      <section className="py-16 bg-softBeige">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-deepGreen">Investor Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={`loading-${i}`} className="border-gold/20">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Error state
  if (error) {
    return (
      <section className="py-16 bg-softBeige">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-deepGreen">Investor Dashboard</h2>
          <div className="text-center py-12">
            <p className="text-red-600 text-lg mb-4">Failed to load investment opportunities</p>
            <Button onClick={() => window.location.reload()} className="bg-brightGold hover:bg-gold text-deepGreen">
              Try Again
            </Button>
          </div>
        </div>
      </section>
    )
  }

  // Handle case where no SAGs are available
  if (!sags || sags.length === 0) {
    return (
      <section className="py-16 bg-softBeige">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-deepGreen">Investor Dashboard</h2>
          <div className="text-center py-12">
            <p className="text-darkOlive text-lg mb-4">No investment opportunities available at the moment.</p>
            <p className="text-darkOlive">Please check back later for new SAG listings.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-softBeige">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-3xl font-bold text-center mb-12 text-deepGreen">Investor Dashboard</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sags.map((sag) => (
            <Card key={sag.sagId} className="border-gold/20">
              <CardHeader>
                <CardTitle className="text-deepGreen flex items-center justify-between">
                  <span>{sag.sagName || `SAG #${sag.sagId.slice(-8)}`}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${sag.status === 'active' ? 'bg-green-100 text-green-700' :
                      sag.status === 'closed' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                    }`}>
                    {sag.status}
                  </span>
                </CardTitle>
                <CardDescription>
                  {sag.sagProperties.tenorM} Months @ {sag.sagProperties.investorRoiPercentage}% ROI • {sag.sagProperties.assetType}
                </CardDescription>
                <div className="text-xs text-darkOlive mt-1">
                  Token: {sag.tokenId} • Cert: {sag.certNo}
                  {sag.tokenData ? (
                    <div className="mt-1">
                      Treasury: {sag.tokenData.treasuryAccountId}
                    </div>
                  ) : null}
                </div>
                
                {/* Risk Rating */}
                <div className="mt-3 pt-3 border-t">
                  <RiskBadge 
                    risk_level={sag.sagProperties.risk_level} 
                    ltv={sag.sagProperties.ltv}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Subscribed</span>
                      <span>
                        {sag.tokenData
                          ? `${Math.round(((parseInt(sag.tokenData.totalSupply) - parseInt(sag.tokenData.remainingSupply)) / parseInt(sag.tokenData.totalSupply)) * 100)}%`
                          : `${Math.round((sag.sagProperties.soldShare / sag.sagProperties.mintShare) * 100)}%`
                        }
                      </span>
                    </div>
                    <Progress
                      value={
                        sag.tokenData
                          ? ((parseInt(sag.tokenData.totalSupply) - parseInt(sag.tokenData.remainingSupply)) / parseInt(sag.tokenData.totalSupply)) * 100
                          : (sag.sagProperties.soldShare / sag.sagProperties.mintShare) * 100
                      }
                      className="h-2"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-darkOlive">Valuation:</span>
                      <span className="font-semibold">{sag.sagProperties.currency} {sag.sagProperties.valuation.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-darkOlive">Loan:</span>
                      <span className="font-semibold">{sag.sagProperties.currency} {sag.sagProperties.loan.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-darkOlive">Weight:</span>
                      <span className="font-semibold">{sag.sagProperties.weightG}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-darkOlive">Karat:</span>
                      <span className="font-semibold">{sag.sagProperties.karat}K</span>
                    </div>
                  </div>
                  <div className="border-t pt-2 space-y-2">
                    {/* Risk Assessment Card */}
                    {sag.sagProperties.risk_level && (
                      <div className={`p-3 rounded-lg ${getRiskColor(sag.sagProperties.risk_level).bg} border ${getRiskColor(sag.sagProperties.risk_level).border}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            Risk Rating
                          </span>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3.5 w-3.5 ${
                                  i < getRiskStars(sag.sagProperties.risk_level)
                                    ? 'fill-yellow-400 text-yellow-400' 
                                    : 'fill-gray-300 text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <Badge variant="outline" className={`${getRiskColor(sag.sagProperties.risk_level).bg} ${getRiskColor(sag.sagProperties.risk_level).text} ${getRiskColor(sag.sagProperties.risk_level).border}`}>
                            {sag.sagProperties.risk_level?.replace('_', ' ')}
                          </Badge>
                          {sag.sagProperties.ltv && (
                            <span className="text-muted-foreground">
                              LTV: {(sag.sagProperties.ltv * 100).toFixed(1)}%
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-darkOlive">Expected ROI:</span>
                      <span className="font-bold text-gold">
                        {sag.sagProperties.investorRoiPercentage}% ({sag.sagProperties.currency} {((sag.sagProperties.loan * sag.sagProperties.investorRoiPercentage) / 100).toLocaleString()})
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-darkOlive">{sag.sagProperties.investorFinancingType}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${sag.approvalStatus === 'approved' ? 'bg-green-100 text-green-700' :
                          sag.approvalStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                        }`}>
                        {sag.approvalStatus}
                      </span>
                    </div>
                  </div>
                  <DashboardInvestmentDialog sag={sag} />
                </div>
              </CardContent>
            </Card>
          ))}

        </div>

        {/* View More Opportunities Button */}
        {isAuthenticated ? (
            <div className="text-center mt-8">
              <ViewMoreOpportunitiesDialog />
            </div>
          ) : null}
      </div>
    </section>
  );
}
