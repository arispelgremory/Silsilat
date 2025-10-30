"use client"

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import apiInstance from '@/lib/axios-v1'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronLeft, ChevronRight, ExternalLinkIcon, TrendingUp, DollarSign, Loader2 } from 'lucide-react'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectLabel, SelectItem } from "@/components/ui/select"
import { Label } from '@/components/ui/label'
import { Dialog, DialogHeader, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { InvestorPageLayout } from "@/components/investor/page-layout"
import { InvestorPageHeader } from "@/components/investor/page-header"
import { investorStyles } from "@/components/investor/styles"

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

// Investment Dialog Component
function InvestmentDialog({ sag }: { sag: SAG }) {
  const [isOpen, setIsOpen] = useState(false)
  const [investmentAmount, setInvestmentAmount] = useState(1)
  const [isInvesting, setIsInvesting] = useState(false)

  const { data: tokenInfo, isLoading: tokenLoading, error: tokenError } = useQuery({
    queryKey: ['token-info', sag.tokenId],
    queryFn: async (): Promise<TokenResponse> => {
      const response = await apiInstance.get(`/token/${sag.tokenId}`)
      return response.data
    },
    enabled: isOpen && !!sag.tokenId, // Only fetch when dialog is open and tokenId exists
  })

  const sharePrice = sag.sagProperties.valuation / sag.sagProperties.mintShare
  const monthlyReturn = (sharePrice * sag.sagProperties.investorRoiPercentage) / 100
  const totalReturn = sharePrice + (monthlyReturn * sag.sagProperties.tenorM)
  const totalInvestment = sharePrice * investmentAmount
  const totalExpectedReturn = totalReturn * investmentAmount
  const totalProfit = totalExpectedReturn - totalInvestment

  const handleInvest = async () => {
    setIsInvesting(true)
    // try {
    //   // TODO: Implement investment API call
    //   toast.success(`Successfully invested in ${investmentAmount} shares of ${sag.sagName}!`)
    //   setIsOpen(false)
    // } catch (error) {
    //   toast.error('Failed to process investment. Please try again.')
    // } finally {
    //   setIsInvesting(false)
    // }

    const investShare = apiInstance.post('/investor/purchase-token', {
      "tokenId": sag.tokenId,
      "amount": investmentAmount,
      "totalValue": totalInvestment.toFixed(2)
    });

    toast.promise(investShare, {
      loading: 'Investing...',
      success: () => {
        return `Successfully invested in ${investmentAmount} shares of ${sag.sagName}!`
      },
      error: 'Failed to process investment. Please try again.',
      finally: () => {
        setIsInvesting(false)
        setIsOpen(false)
      }
    })


  }

  const remainingShares = tokenInfo?.data ? parseInt(tokenInfo.data.remainingSupply) : 0
  const maxInvestment = Math.min(remainingShares, 100) // Limit to 100 shares max per investment

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className={`flex-1 ${investorStyles.button.primary}`}>
          Invest Now
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Invest in {sag.sagName}</DialogTitle>
          <DialogDescription>
            {sag.sagDescription} • {sag.sagProperties.assetType}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
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
              disabled={isInvesting || remainingShares === 0}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isInvesting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Investing...
                </>
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

function InvestorBrowse() {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)

  const { data, isLoading, error } = useQuery({
    queryKey: ['browse-sags', currentPage, pageSize],
    queryFn: async (): Promise<SAGResponse> => {
      const response = await apiInstance.get(`/sag?page_size=${pageSize}&page_number=${currentPage}`)
      return response.data
    },
  })

  if (isLoading) {
    return (
      <InvestorPageLayout>
        <InvestorPageHeader 
          title="Browse NFTs" 
          description="Discover NFTs available for funding."
        />
        <div className={`${investorStyles.grid.responsive} xl:grid-cols-4`}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={`loading-card-${i}`}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </InvestorPageLayout>
    )
  }

  if (error) {
    return (
      <InvestorPageLayout>
        <InvestorPageHeader title="Browse NFTs" />
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Failed to load NFTs</p>
          <Button className={investorStyles.button.primary} onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </InvestorPageLayout>
    )
  }

  const sags = data?.data || []
  const pagination = data?.pagination

  // Filter only NFTs with minting enabled for investors
  const availableNFTs = sags.filter(sag => sag.sagProperties.enableMinting)

  // Use the pagination data from API
  const totalPages = pagination?.totalPages || 1
  const hasNextPage = pagination?.hasNextPage || false
  const hasPrevPage = pagination?.hasPrevPage || false

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setCurrentPage(1) // Reset to first page when changing page size
  }

  const calculateMonthlyReturn = (sag: SAG) => {
    const mintValue = sag.sagProperties.valuation / sag.sagProperties.mintShare
    return (mintValue * sag.sagProperties.investorRoiPercentage) / 100
  }

  const calculateTotalReturn = (sag: SAG) => {
    const mintValue = sag.sagProperties.valuation / sag.sagProperties.mintShare
    const monthlyReturn = calculateMonthlyReturn(sag)
    return mintValue + (monthlyReturn * sag.sagProperties.tenorM)
  }

  return (
    <InvestorPageLayout>
      <InvestorPageHeader 
        title="Browse NFTs" 
        description="Discover NFTs available for funding."
      />

      {/* Page Size Selector */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Show:</span>

          <Select
            onValueChange={(value) => handlePageSizeChange(Number(value))}
            defaultValue={pageSize.toString()}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select your page size" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Pages</SelectLabel>
                <SelectItem value="6">6</SelectItem>
                <SelectItem value="12">12</SelectItem>
                <SelectItem value="24">24</SelectItem>
                <SelectItem value="48">48</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <span className="text-sm text-muted-foreground">per page</span>

          {pagination && (
            <div className="text-sm text-muted-foreground">
              Showing {((pagination.currentPage - 1) * pageSize) + 1} to {Math.min(pagination.currentPage * pageSize, pagination.totalCount)}
              {` of ${pagination.totalCount}`} results ({availableNFTs.length} available for investment)
            </div>
          )}
        </div>
      </div>

      {availableNFTs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No NFTs available for investment</p>
          <p className="text-sm text-muted-foreground">Check back later for new investment opportunities</p>
        </div>
      ) : (
        <>
          <div className={`${investorStyles.grid.responsive} xl:grid-cols-4 mb-8`}>
            {availableNFTs.map((sag) => (
              <Card key={sag.sagId} className={`${investorStyles.card.interactive} border-l-4 border-l-emerald-500`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className={investorStyles.text.cardTitle}>{sag.sagName}</CardTitle>
                      <CardDescription className="mt-1">{sag.sagDescription}</CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-xs ${investorStyles.badge.success} px-2 py-1 rounded-full`}>
                        Available
                      </span>
                      <span className={`text-xs ${investorStyles.badge.info} px-2 py-1 rounded-full`}>
                        {sag.sagType}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Asset Type:</span>
                      <span className="text-sm font-medium">{sag.sagProperties.assetType}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Share Price:</span>
                      <span className="text-sm font-medium text-green-600">
                        {sag.sagProperties.currency} {(sag.sagProperties.valuation / sag.sagProperties.mintShare).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Available Shares:</span>
                      <span className="text-sm font-medium">{sag.sagProperties.mintShare.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Monthly ROI:</span>
                      <span className="text-sm font-medium text-green-600">{sag.sagProperties.investorRoiPercentage}%</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Duration:</span>
                      <span className="text-sm font-medium">{sag.sagProperties.tenorM} months</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Weight (Karat):</span>
                      <span className="text-sm font-medium">{sag.sagProperties.weightG}g ({sag.sagProperties.karat}K)</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Token ID:</span>
                      <span className="text-sm font-medium text-xs">
                        {sag.tokenId ? (
                          <a className="text-blue-600 flex gap-1" href={`${process.env.NEXT_PUBLIC_ENV_URL}/${sag.tokenId}`} target="_blank" rel="noopener noreferrer">
                            {sag.tokenId}
                            <ExternalLinkIcon size={14} />
                          </a>
                        ) : (
                          <>-</>
                        )}
                      </span>
                    </div>

                    {/* Investment Summary */}
                    <div className="border-t pt-3 mt-3">
                      <div className="grid grid-cols-2 gap-2 text-xs">
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
                  </div>

                  <div className="flex gap-2 mt-4">
                    {/* <Button variant="outline" size="sm" className="flex-1">
                      View Details
                    </Button> */}
                    <InvestmentDialog sag={sag} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!hasPrevPage}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage < 3) {
                  pageNum = i + 1
                } else if (currentPage > totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!hasNextPage}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Page Info */}
          <div className="text-center mt-4 text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
        </>
      )}
    </InvestorPageLayout>
  )
}

export default InvestorBrowse
