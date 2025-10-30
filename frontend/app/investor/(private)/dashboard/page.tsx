"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WalletIcon, TrendingUpIcon, DollarSignIcon, ClockIcon } from "lucide-react"
import { InvestorPageLayout } from "@/components/investor/page-layout"
import { InvestorPageHeader } from "@/components/investor/page-header"
import { investorStyles } from "@/components/investor/styles"

export default function InvestorDashboard() {
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")

  const handleConnectWallet = async () => {
    try {
      // Simulate wallet connection
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setWalletConnected(true)
      setWalletAddress("0.0.12345")
    } catch (error) {
      console.error("Failed to connect wallet:", error)
    }
  }

  const sagInvestments = [
    {
      id: "10293",
      duration: "6 Months",
      annualReturn: "6%",
      subscribed: 78,
      expectedROI: "RM 210",
      minInvestment: "RM 1,000",
      totalValue: "RM 50,000",
      status: "Active",
    },
    {
      id: "10294",
      duration: "12 Months",
      annualReturn: "6%",
      subscribed: 45,
      expectedROI: "RM 420",
      minInvestment: "RM 2,000",
      totalValue: "RM 100,000",
      status: "Active",
    },
  ]

  return (
    <InvestorPageLayout>
      <InvestorPageHeader 
        title="Investor Dashboard" 
        description="Manage your Shariah-compliant jewelry investments"
      />

      <div className={investorStyles.grid.responsive}>
        {/* SAG Investment Cards */}
        {sagInvestments.map((sag) => (
          <Card key={sag.id} className={investorStyles.card.base}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className={investorStyles.text.cardTitle}>SAG #{sag.id}</CardTitle>
                  <Badge variant="outline" className={investorStyles.badge.success}>
                    {sag.status}
                  </Badge>
                </div>
                <CardDescription>
                  {sag.duration} @ {sag.annualReturn} Annual Return
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subscribed</span>
                    <span className="font-medium">{sag.subscribed}%</span>
                  </div>
                  <Progress value={sag.subscribed} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Expected ROI:</p>
                    <p className="font-semibold text-emerald-600">{sag.expectedROI}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Min Investment:</p>
                    <p className="font-semibold">{sag.minInvestment}</p>
                  </div>
                </div>

                <Button className={`w-full ${investorStyles.button.accent}`} disabled={!walletConnected}>
                  {walletConnected ? "Invest Now" : "Connect Wallet First"}
                </Button>
              </CardContent>
            </Card>
          ))}

        {/* Wallet Connection Card */}
        <Card className={investorStyles.card.base}>
          <CardHeader>
            <CardTitle className={`${investorStyles.text.cardTitle} flex items-center gap-2`}>
                <WalletIcon className="h-5 w-5" />
                Wallet Connection
              </CardTitle>
              <CardDescription>Connect your Hedera wallet</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {walletConnected ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center p-4 bg-emerald-50 rounded-md">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                      <span className="font-medium text-emerald-800">Wallet Connected</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Wallet Address:</p>
                    <p className="font-mono text-sm bg-gray-100 p-2 rounded">{walletAddress}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Balance:</p>
                    <p className="font-semibold">100.00 HBAR</p>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center">
                    <WalletIcon className="h-8 w-8 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Connect wallet to start investing</h3>
                    <p className="text-sm text-muted-foreground mt-1">Secure connection to your Hedera wallet</p>
                  </div>
                </div>
              )}

            <Button
              onClick={handleConnectWallet}
              className={`w-full ${investorStyles.button.primary}`}
              disabled={walletConnected}
            >
              {walletConnected ? "Wallet Connected" : "Connect Wallet"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Investment Portfolio */}
      <Card className={investorStyles.card.base}>
        <CardHeader>
          <CardTitle className={investorStyles.text.cardTitle}>Investment Portfolio</CardTitle>
          <CardDescription>Track your investment performance</CardDescription>
        </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="active">Active Investments</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className={investorStyles.grid.stats}>
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSignIcon className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm font-medium">Total Invested</span>
                    </div>
                    <p className={investorStyles.text.value}>RM 0</p>
                  </div>

                  <div className={`${investorStyles.background.warning} p-4 rounded-lg`}>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUpIcon className="h-4 w-4 text-gold" />
                      <span className="text-sm font-medium">Expected Returns</span>
                    </div>
                    <p className={`text-2xl font-bold ${investorStyles.text.accent}`}>RM 0</p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <ClockIcon className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Active Investments</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-800">0</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="active">
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No active investments yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Connect your wallet and start investing in SAG opportunities
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="history">
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No investment history</p>
                </div>
              </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
    </InvestorPageLayout>
  )
}
