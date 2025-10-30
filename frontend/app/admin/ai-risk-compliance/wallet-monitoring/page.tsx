"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Wallet, AlertTriangle, Eye, Search, Activity, DollarSign, Shield } from "lucide-react"
import { XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const transactionVolumeData = [
  { time: "00:00", volume: 12000, suspicious: 150 },
  { time: "04:00", volume: 8000, suspicious: 80 },
  { time: "08:00", volume: 25000, suspicious: 300 },
  { time: "12:00", volume: 35000, suspicious: 450 },
  { time: "16:00", volume: 28000, suspicious: 320 },
  { time: "20:00", volume: 18000, suspicious: 200 },
]

const suspiciousTransactions = [
  {
    id: "TX001",
    wallet: "0x1234...5678",
    amount: "RM 85,000",
    type: "Large Transfer",
    riskScore: 95,
    timestamp: "2024-01-15 14:30:22",
    flags: ["Unusual Amount", "New Wallet", "Rapid Succession"],
    status: "flagged",
  },
  {
    id: "TX002",
    wallet: "0x9876...4321",
    amount: "RM 12,500",
    type: "Multiple Small",
    riskScore: 78,
    timestamp: "2024-01-15 13:45:11",
    flags: ["Structuring Pattern", "Multiple Recipients"],
    status: "investigating",
  },
  {
    id: "TX003",
    wallet: "0x5555...7777",
    amount: "RM 45,000",
    type: "Cross-border",
    riskScore: 82,
    timestamp: "2024-01-15 12:15:33",
    flags: ["High-risk Country", "Unusual Time"],
    status: "blocked",
  },
]

const monitoredWallets = [
  {
    address: "0x1234567890abcdef",
    owner: "Ahmad Rahman",
    balance: "RM 125,000",
    riskLevel: "Medium",
    lastActivity: "2 hours ago",
    transactionCount: 47,
    flags: 2,
  },
  {
    address: "0x9876543210fedcba",
    owner: "Siti Nurhaliza",
    balance: "RM 89,500",
    riskLevel: "Low",
    lastActivity: "1 day ago",
    transactionCount: 23,
    flags: 0,
  },
  {
    address: "0x5555777799991111",
    owner: "Unknown",
    balance: "RM 250,000",
    riskLevel: "High",
    lastActivity: "30 minutes ago",
    transactionCount: 156,
    flags: 8,
  },
]

export default function WalletMonitoringPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const getRiskColor = (level: string) => {
    switch (level) {
      case "High":
        return "bg-red-100 text-red-800"
      case "Medium":
        return "bg-orange-100 text-orange-800"
      case "Low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "flagged":
        return "bg-red-100 text-red-800"
      case "investigating":
        return "bg-orange-100 text-orange-800"
      case "blocked":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Wallet className="h-6 w-6 text-purple-600" />
        <h1 className="text-2xl font-bold">Wallet & Transaction Monitoring</h1>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Wallets</p>
                <p className="text-2xl font-bold">2,847</p>
                <p className="text-xs text-green-600">↑ 5.2% this week</p>
              </div>
              <Wallet className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Daily Volume</p>
                <p className="text-2xl font-bold">RM 2.1M</p>
                <p className="text-xs text-blue-600">↑ 12% from yesterday</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Suspicious Activity</p>
                <p className="text-2xl font-bold text-red-600">23</p>
                <p className="text-xs text-red-600">↑ 8 new alerts</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Detection Rate</p>
                <p className="text-2xl font-bold text-green-600">97.3%</p>
                <p className="text-xs text-green-600">↑ 1.1% improvement</p>
              </div>
              <Shield className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Volume Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Real-time Transaction Monitoring</CardTitle>
          <CardDescription>Transaction volume and suspicious activity detection</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              volume: {
                label: "Transaction Volume (RM)",
                color: "hsl(var(--chart-1))",
              },
              suspicious: {
                label: "Suspicious Transactions",
                color: "hsl(var(--chart-2))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={transactionVolumeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="volume"
                  stackId="1"
                  stroke="var(--color-volume)"
                  fill="var(--color-volume)"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="suspicious"
                  stackId="2"
                  stroke="var(--color-suspicious)"
                  fill="var(--color-suspicious)"
                  fillOpacity={0.8}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Tabs defaultValue="suspicious" className="space-y-4">
        <TabsList>
          <TabsTrigger value="suspicious">Suspicious Transactions</TabsTrigger>
          <TabsTrigger value="wallets">Monitored Wallets</TabsTrigger>
        </TabsList>

        <TabsContent value="suspicious" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Flagged Transactions</CardTitle>
              <CardDescription>AI-detected suspicious transaction patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {suspiciousTransactions.map((tx) => (
                  <div key={tx.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">Transaction {tx.id}</p>
                          <Badge className={getStatusColor(tx.status)}>{tx.status.toUpperCase()}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Wallet: {tx.wallet} • {tx.timestamp}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{tx.amount}</p>
                        <p className="text-sm text-red-600">Risk: {tx.riskScore}/100</p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm font-medium mb-1">Risk Flags:</p>
                      <div className="flex gap-1 flex-wrap">
                        {tx.flags.map((flag, index) => (
                          <Badge key={index} variant="destructive" className="text-xs">
                            {flag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="mr-1 h-3 w-3" />
                        View Details
                      </Button>
                      <Button size="sm" variant="outline">
                        Block Wallet
                      </Button>
                      <Button size="sm" variant="outline">
                        Generate Report
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wallets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Wallet Monitoring</CardTitle>
              <CardDescription>Real-time wallet activity and risk assessment</CardDescription>
              <div className="flex gap-2">
                <Input
                  placeholder="Search wallet address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Button variant="outline">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monitoredWallets.map((wallet, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-mono text-sm">{wallet.address}</p>
                          <Badge className={getRiskColor(wallet.riskLevel)}>{wallet.riskLevel} Risk</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Owner: {wallet.owner}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{wallet.balance}</p>
                        <p className="text-sm text-muted-foreground">{wallet.lastActivity}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                      <div>
                        <p className="text-muted-foreground">Transactions</p>
                        <p className="font-medium">{wallet.transactionCount}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Risk Flags</p>
                        <p className="font-medium text-red-600">{wallet.flags}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <p className="font-medium text-green-600">Active</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Activity className="mr-1 h-3 w-3" />
                        View Activity
                      </Button>
                      <Button size="sm" variant="outline">
                        Set Alert
                      </Button>
                      {wallet.riskLevel === "High" && (
                        <Button size="sm" variant="destructive">
                          Restrict Wallet
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
