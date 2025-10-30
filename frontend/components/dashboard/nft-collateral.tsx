"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ExternalLink, Eye, Loader2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import apiInstance from "@/lib/axios-v1"

interface NFT {
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

interface NFTCollateralProps {
  showAll?: boolean
}

export function NFTCollateral({ showAll = false }: NFTCollateralProps) {
  const {
    data: nfts = [],
    isLoading: loading,
    error,
    isError
  } = useQuery({
    queryKey: ['nfts'],
    queryFn: async () => {
      const response = await apiInstance.get('/investor/nfts')
      if (response.data.success) {
        return response.data.data.nfts
      } else {
        throw new Error('Failed to fetch NFTs')
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3
  })

  const displayNFTs = showAll ? nfts : nfts.slice(0, 2)

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading NFTs...</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-center p-8 text-red-600">
        <p>{error?.message || 'Failed to fetch NFTs'}</p>
      </div>
    )
  }

  if (nfts.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        <p>No NFTs found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {displayNFTs.map((nft: NFT, index: number) => (
        <Card key={`${nft.token_id}-${nft.serial_number}`} className="border-gold/20 hover:border-gold/40 transition-all overflow-hidden group">
          <CardContent className="p-0 relative">
            {/* Large Background Image/Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-gold/20 via-brightGold/10 to-gold/5">
              <div className="absolute -right-8 -top-8 w-40 h-40 bg-gradient-to-br from-gold/30 to-brightGold/20 rounded-full blur-2xl" />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gold/10 font-bold text-8xl select-none">
                NFT
              </div>
            </div>
            
            {/* Content Overlay */}
            <div className="relative p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-16 h-16 bg-gradient-to-br from-gold to-brightGold rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                      <span className="text-white font-bold text-lg">NFT</span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-bold text-lg text-deepGreen">NFT #{nft.serial_number}</h3>
                        <Badge className={`text-xs ${nft.deleted ? 'bg-red-100 text-red-800' : 'bg-brightGold text-deepGreen'}`}>
                          {nft.deleted ? "Deleted" : "Active"}
                        </Badge>
                      </div>
                      <p className="text-sm text-darkOlive font-medium">Token ID: {nft.token_id}</p>
                    </div>
                  </div>
                </div>
                <Button size="sm" asChild className="bg-gold hover:bg-gold/90 text-white shadow-md">
                  <a href={`${process.env.NEXT_PUBLIC_ENV_URL}/${nft.token_id}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View NFT
                  </a>
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-gold/10">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Account ID</p>
                  <p className="text-sm font-medium text-deepGreen truncate">{nft.account_id}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Created</p>
                  <p className="text-sm font-medium text-deepGreen">
                    {new Date(parseInt(nft.created_timestamp) * 1000).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Modified</p>
                  <p className="text-sm font-medium text-deepGreen">
                    {new Date(parseInt(nft.modified_timestamp) * 1000).toLocaleDateString()}
                  </p>
                </div>
                {nft.metadata && (
                  <div className="sm:col-span-2">
                    <p className="text-xs text-muted-foreground mb-1">Metadata</p>
                    <p className="text-sm font-medium text-deepGreen truncate">
                      {nft.metadata.substring(0, 50)}...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
