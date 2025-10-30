"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, RefreshCw, ArrowUpRight, Link, ExternalLink } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import apiInstance from "@/lib/axios-v1"
import { TopUpDialog } from "@/components/dashboard/topup-dialog"

interface WalletBalanceResponse {
  success: boolean
  data: {
    balance: string
  }
}

export function WalletBalance() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['wallet-balance'],
    queryFn: async (): Promise<WalletBalanceResponse> => {
      const response = await apiInstance.get('/investor/wallet/balance')
      return response.data
    },
    staleTime: 30 * 1000, // 30 seconds - refresh more frequently for balance
    refetchOnWindowFocus: true,
  })

  const handleRefresh = () => {
    refetch()
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            MYR Stable Coin Balance
          </CardTitle>
          <CardDescription>Your wallet balance and transaction history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading balance...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            MYR Stable Coin Balance
          </CardTitle>
          <CardDescription>Your wallet balance and transaction history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8 text-red-600">
            <p>Failed to load wallet data</p>
            <Button onClick={handleRefresh} variant="outline" className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data?.data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            MYR Stable Coin Balance
          </CardTitle>
          <CardDescription>Your wallet balance and transaction history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8 text-muted-foreground">
            <p>No wallet data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const balance = parseFloat(data.data.balance)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              MYR Stable Coin Balance
            </CardTitle>
            <CardDescription>Your wallet balance and available funds</CardDescription>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Balance Display */}
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground mb-2">Available Balance</p>
          <div className="text-5xl font-bold text-emerald-600 mb-4">
            {balance.toLocaleString('en-MY', { 
              style: 'currency', 
              currency: 'MYR' 
            })}
          </div>
          <div className="flex items-center justify-center gap-2">
            {/* <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div> */}
            <span className="text-xs text-muted-foreground">
              <Link href="https://hashscan.io/hedera/account/0.0.12345" target="_blank">
                <ExternalLink className="h-4 w-4 mr-2" />
                Check your wallet in hashscan
              </Link>
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">This Month</p>
            <p className="text-lg font-semibold">-</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">Total Transactions</p>
            <p className="text-lg font-semibold">-</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <div className="flex-1">
            <TopUpDialog />
          </div>
          <Button variant="outline" className="flex-1">
            <ArrowUpRight className="h-4 w-4 mr-2" />
            Send MYR
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

