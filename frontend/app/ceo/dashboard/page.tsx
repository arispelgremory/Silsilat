import { Suspense } from "react"
import { Calendar } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview } from "@/components/overview"
import { RecentLoans } from "@/components/recent-loans"
import { FinancialReports } from "@/components/financial-reports"
import { StatsCards } from "@/components/stats-cards"
import { PageHeader } from "@/components/page-header"

export default function CeoDashboardPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <PageHeader />

      <main className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">CEO Dashboard</h2>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        <Suspense fallback={<div>Loading stats...</div>}>
          <StatsCards />
        </Suspense>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Daily Loan Activity</CardTitle>
              <CardDescription>Overview of active loans, repayments, and unclaimed assets</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <Overview />
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Financial Reports</CardTitle>
              <CardDescription>Download reports in PDF or Excel format</CardDescription>
            </CardHeader>
            <CardContent>
              <FinancialReports />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Recent Loans</CardTitle>
              <CardDescription>Latest loan applications and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentLoans />
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Auction Status</CardTitle>
              <CardDescription>Current auctions for unclaimed jewelry</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {/* Auction items would go here */}
                <div className="flex items-center">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Gold Necklace (24K)</p>
                    <p className="text-sm text-muted-foreground">Current bid: 2,500 HBAR</p>
                  </div>
                  <div className="ml-auto font-medium">Ends in 2 days</div>
                </div>
                <div className="flex items-center">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Diamond Ring (2.5 carat)</p>
                    <p className="text-sm text-muted-foreground">Current bid: 5,800 HBAR</p>
                  </div>
                  <div className="ml-auto font-medium">Ends in 5 days</div>
                </div>
                <div className="flex items-center">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">Gold Bracelet (22K)</p>
                    <p className="text-sm text-muted-foreground">Current bid: 1,200 HBAR</p>
                  </div>
                  <div className="ml-auto font-medium">Ends in 1 day</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
