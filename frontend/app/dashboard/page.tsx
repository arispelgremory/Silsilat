'use client';

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { WalletBalance } from "@/components/dashboard/wallet-balance"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { PaymentSchedule } from "@/components/dashboard/payment-schedule"
import { NFTCollateral } from "@/components/dashboard/nft-collateral"
import { Overview } from "@/components/dashboard/overview"
import { AlertCircle, ArrowRight, Bell, Clock, CreditCard } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAuth } from "@/hooks/use-auth"

export default function DashboardPage() {
  const { isAuthenticated } = useAuth()

  console.log("isAuthenticated", isAuthenticated);

  return (
    <ProtectedRoute requiredRole="investor">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <DashboardHeader />

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="loans">Wallet</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="nfts">NFT Collateral</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2</div>
                  <p className="text-xs text-muted-foreground">Total value: RM 12,500</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Next Payment</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">15 Apr</div>
                  <p className="text-xs text-muted-foreground">Amount: RM 1,250</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">NFT Collateral</CardTitle>
                  <svg
                    className="h-4 w-4 text-muted-foreground"
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M11 5.08V2a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h1" />
                    <path d="M18 9h2a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1v-2" />
                    <path d="M14 15h-3V8a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-3Z" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2</div>
                  <p className="text-xs text-muted-foreground">Secure on Hedera</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Notifications</CardTitle>
                  <Bell className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">2 unread messages</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Overview</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <Overview />
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <RecentActivity />
                </CardContent>
              </Card>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Payment Reminder</AlertTitle>
              <AlertDescription>
                Your next payment of RM 1,250 is due on April 15, 2025. Please ensure your account has sufficient funds.
              </AlertDescription>
            </Alert>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Payment Schedule</CardTitle>
                  <CardDescription>Your upcoming payments for all active loans</CardDescription>
                </CardHeader>
                <CardContent>
                  <PaymentSchedule />
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    <Link href="/dashboard/payments" className="flex items-center justify-center gap-2">
                      View All Payments <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>NFT Collateral</CardTitle>
                  <CardDescription>Your jewelry secured as NFTs</CardDescription>
                </CardHeader>
                <CardContent>
                  <NFTCollateral />
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    <Link href="/dashboard/nfts" className="flex items-center justify-center gap-2">
                      View All NFTs <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="loans" className="space-y-4">
            <h2 className="text-xl font-bold">Wallet Balance</h2>
            <div className="grid gap-4">
              <WalletBalance />
            </div>
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <h2 className="text-xl font-bold">Payment History</h2>
            <Card>
              <CardHeader>
                <CardTitle>Payment Schedule</CardTitle>
                <CardDescription>Your upcoming and past payments</CardDescription>
              </CardHeader>
              <CardContent>
                <PaymentSchedule showAll={true} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nfts" className="space-y-4">
            <h2 className="text-xl font-bold">NFT Collateral</h2>
            <Card>
              <CardHeader>
                <CardTitle>Your Jewelry NFTs</CardTitle>
                <CardDescription>Digital representation of your jewelry collateral</CardDescription>
              </CardHeader>
              <CardContent>
                <NFTCollateral showAll={true} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}
