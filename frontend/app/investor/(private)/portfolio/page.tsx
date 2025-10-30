"use client"

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import apiInstance from '@/lib/axios-v1'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronLeft, ChevronRight, ExternalLinkIcon, TrendingUp, Calendar, Wallet } from 'lucide-react'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectLabel, SelectItem } from "@/components/ui/select"
import { InvestorPageLayout } from "@/components/investor/page-layout"
import { InvestorPageHeader } from "@/components/investor/page-header"
import { investorStyles } from "@/components/investor/styles"

interface NFTHolding {
  account_id: string
  created_timestamp: string
  delegating_spender: string | null
  deleted: boolean
  metadata: string
  modified_timestamp: string
  serial_number: number
  spender: string | null
  token_id: string
}

interface InvestorNFTsResponse {
  success: boolean
  data: {
    nfts: NFTHolding[]
  }
}

interface TokenInfo {
  tokenId: string
  remainSupply: string
  totalSupply: string
  treasuryAccountId: string
  createdAt: string
  expiredAt: string
}

interface TokenResponse {
  success: boolean
  data: TokenInfo
}

// Portfolio Summary Card Component
function PortfolioSummary({ nfts }: { nfts: NFTHolding[] }) {
  const totalInvestments = nfts.length
  const uniqueTokens = new Set(nfts.map(nft => nft.token_id)).size
  
  return (
    <div className={`${investorStyles.grid.stats} mb-6`}>
      <Card className={investorStyles.card.base}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-sm text-muted-foreground">Total Holdings</p>
              <p className={investorStyles.text.value}>{totalInvestments}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className={investorStyles.card.base}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-sm text-muted-foreground">Unique NFTs</p>
              <p className={investorStyles.text.value}>{uniqueTokens}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className={investorStyles.card.base}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gold" />
            <div>
              <p className="text-sm text-muted-foreground">Active Investments</p>
              <p className={investorStyles.text.value}>{uniqueTokens}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Individual NFT Holding Card Component
function NFTHoldingCard({ nft }: { nft: NFTHolding }) {
  const { data: tokenInfo, isLoading: tokenLoading } = useQuery({
    queryKey: ['token-info', nft.token_id],
    queryFn: async (): Promise<TokenResponse> => {
      const response = await apiInstance.get(`/token/${nft.token_id}`)
      return response.data
    },
  })

  const createdDate = new Date(parseFloat(nft.created_timestamp) * 1000)
  const modifiedDate = new Date(parseFloat(nft.modified_timestamp) * 1000)
  
  // Calculate time held
  const timeHeld = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
  
  // Decode metadata (base64)
  let decodedMetadata = ''
  try {
    decodedMetadata = atob(nft.metadata)
  } catch (e) {
    decodedMetadata = 'Unable to decode'
  }

  return (
    <Card className={`${investorStyles.card.interactive} border-l-4 border-l-emerald-500`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className={investorStyles.text.cardTitle}>NFT Share #{nft.serial_number}</CardTitle>
            <CardDescription className="mt-1">Token ID: {nft.token_id}</CardDescription>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className={`text-xs ${investorStyles.badge.success} px-2 py-1 rounded-full`}>
              Active
            </span>
            <span className="text-xs text-muted-foreground">
              {timeHeld} days held
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Account ID:</span>
            <span className="text-sm font-medium">{nft.account_id}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Serial Number:</span>
            <span className="text-sm font-medium">#{nft.serial_number}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Created:</span>
            <span className="text-sm font-medium">{createdDate.toLocaleDateString()}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Last Modified:</span>
            <span className="text-sm font-medium">{modifiedDate.toLocaleDateString()}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Token Link:</span>
            <span className="text-sm font-medium">
              <a 
                className="text-blue-600 flex gap-1 items-center" 
                href={`${process.env.NEXT_PUBLIC_ENV_URL}/${nft.token_id}`} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                View on Explorer
                <ExternalLinkIcon size={14} />
              </a>
            </span>
          </div>

          {/* Token Supply Information */}
          {tokenLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : tokenInfo ? (
            <div className="bg-muted p-3 rounded-lg space-y-2 mt-3">
              <h4 className="font-medium text-sm">Token Information</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Supply:</span>
                  <span className="font-medium">{tokenInfo.data.totalSupply}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Remaining:</span>
                  <span className="font-medium text-green-600">{tokenInfo.data.remainSupply}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Your Share:</span>
                  <span className="font-medium text-blue-600">1 of {tokenInfo.data.totalSupply}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ownership:</span>
                  <span className="font-medium">{(1 / parseInt(tokenInfo.data.totalSupply) * 100).toFixed(2)}%</span>
                </div>
              </div>
              
              {tokenInfo.data.expiredAt && (
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Expires:</span>
                    <span className="font-medium text-orange-600">
                      {new Date(parseFloat(tokenInfo.data.expiredAt) * 1000).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* Metadata */}
          {decodedMetadata && decodedMetadata !== 'Unable to decode' && (
            <div className="bg-blue-50 p-2 rounded text-xs">
              <span className="text-muted-foreground">Metadata:</span>
              <p className="font-mono text-blue-800 break-all">{decodedMetadata}</p>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          {/* <Button variant="outline" size="sm" className="flex-1">
            View Details
          </Button>
          <Button size="sm" className="flex-1" disabled>
            Manage
          </Button> */}
        </div>
      </CardContent>
    </Card>
  )
}

function InvestorPortfolio() {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)

  const { data, isLoading, error } = useQuery({
    queryKey: ['investor-nfts'],
    queryFn: async (): Promise<InvestorNFTsResponse> => {
      const response = await apiInstance.get('/investor/nfts')
      return response.data
    },
  })

  if (isLoading) {
    return (
      <InvestorPageLayout>
        <InvestorPageHeader 
          title="My Portfolio" 
          description="Track your NFT investments and returns."
        />
        
        {/* Loading Summary Cards */}
        <div className={`${investorStyles.grid.stats} mb-6`}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={`summary-loading-${i}`}>
              <CardContent className="p-4">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Loading NFT Cards */}
        <div className={investorStyles.grid.responsive}>
          {Array.from({ length: 6 }).map((_, i) => (
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
                  <Skeleton className="h-16 w-full" />
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
        <InvestorPageHeader title="My Portfolio" />
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Failed to load portfolio</p>
          <Button className={investorStyles.button.primary} onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </InvestorPageLayout>
    )
  }

  const nfts = data?.data?.nfts || []
  
  // Group NFTs by token_id for better organization
  // const groupedNFTs = nfts.reduce((acc, nft) => {
  //   if (!acc[nft.token_id]) {
  //     acc[nft.token_id] = []
  //   }
  //   acc[nft.token_id].push(nft)
  //   return acc
  // }, {} as Record<string, NFTHolding[]>)

  // Pagination for display
  const totalItems = nfts.length
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedNFTs = nfts.slice(startIndex, endIndex)
  const totalPages = Math.ceil(totalItems / pageSize)

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setCurrentPage(1)
  }

  return (
    <InvestorPageLayout>
      <InvestorPageHeader 
        title="My Portfolio" 
        description="Track your NFT investments and returns."
      />

      {/* Portfolio Summary */}
      <PortfolioSummary nfts={nfts} />

      {/* Page Size Selector */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Show:</span>
          <Select 
            value={pageSize.toString()} 
            onValueChange={(value) => handlePageSizeChange(Number(value))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Items per page</SelectLabel>
                <SelectItem value="6">6</SelectItem>
                <SelectItem value="12">12</SelectItem>
                <SelectItem value="24">24</SelectItem>
                <SelectItem value="48">48</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">per page</span>
          
          <div className="text-sm text-muted-foreground ml-4">
            Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} holdings
          </div>
        </div>
      </div>

      {nfts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No NFT investments found</p>
          <p className="text-sm text-muted-foreground mb-4">Start investing in NFTs to build your portfolio</p>
          <Button asChild>
            <a href="/investor/browse">Browse NFTs</a>
          </Button>
        </div>
      ) : (
        <>
          {/* NFT Holdings Grid */}
          <div className={`${investorStyles.grid.responsive} mb-8`}>
            {paginatedNFTs.map((nft) => (
              <NFTHoldingCard key={`${nft.token_id}-${nft.serial_number}`} nft={nft} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
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
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Page Info */}
          <div className="text-center mt-4 text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
        </>
      )}
    </InvestorPageLayout>
  )
}

export default InvestorPortfolio