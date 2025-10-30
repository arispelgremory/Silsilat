"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, TrendingUp, TrendingDown } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const defaultTrendData = [
  { month: "Jan", predicted: 2.1, actual: 1.8 },
  { month: "Feb", predicted: 2.3, actual: 2.1 },
  { month: "Mar", predicted: 2.8, actual: 2.5 },
  { month: "Apr", predicted: 3.2, actual: 3.0 },
  { month: "May", predicted: 3.5, actual: 3.3 },
  { month: "Jun", predicted: 3.8, actual: null },
]

const riskFactorData = [
  { factor: "Payment History", weight: 35, impact: "High" },
  { factor: "Debt-to-Income", weight: 25, impact: "High" },
  { factor: "Employment Status", weight: 20, impact: "Medium" },
  { factor: "Collateral Value", weight: 15, impact: "Medium" },
  { factor: "Credit Utilization", weight: 5, impact: "Low" },
]

const highRiskLoans = [
  {
    id: "L001",
    borrower: "Ahmad Rahman",
    amount: "RM 45,000",
    riskScore: 85,
    probability: "78%",
    daysOverdue: 15,
    factors: ["Payment History", "Employment"],
  },
  {
    id: "L002",
    borrower: "Siti Nurhaliza",
    amount: "RM 32,000",
    riskScore: 82,
    probability: "74%",
    daysOverdue: 8,
    factors: ["Debt-to-Income", "Credit Score"],
  },
  {
    id: "L003",
    borrower: "Raj Kumar",
    amount: "RM 28,500",
    riskScore: 79,
    probability: "71%",
    daysOverdue: 22,
    factors: ["Payment History", "Collateral"],
  },
]

export default function DefaultPredictionPage() {
  const getRiskColor = (score: number) => {
    if (score >= 80) return "text-red-600 bg-red-50"
    if (score >= 60) return "text-orange-600 bg-orange-50"
    return "text-green-600 bg-green-50"
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-6 w-6 text-red-600" />
        <h1 className="text-2xl font-bold">Default Prediction Engine</h1>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Default Rate</p>
                <p className="text-2xl font-bold text-red-600">3.3%</p>
                <p className="text-xs text-green-600">↓ 0.2% from last month</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Predicted Next Month</p>
                <p className="text-2xl font-bold text-orange-600">3.8%</p>
                <p className="text-xs text-red-600">↑ 0.5% increase</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Risk Loans</p>
                <p className="text-2xl font-bold">47</p>
                <p className="text-xs text-muted-foreground">Requiring attention</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Model Accuracy</p>
                <p className="text-2xl font-bold text-green-600">94.7%</p>
                <p className="text-xs text-green-600">↑ 1.2% improvement</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Default Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Default Rate Trend & Predictions</CardTitle>
          <CardDescription>Historical data vs AI predictions</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              predicted: {
                label: "Predicted Rate",
                color: "hsl(var(--chart-1))",
              },
              actual: {
                label: "Actual Rate",
                color: "hsl(var(--chart-2))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={defaultTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="var(--color-actual)"
                  strokeWidth={2}
                  name="Actual Rate (%)"
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="var(--color-predicted)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Predicted Rate (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Factors */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Factor Weights</CardTitle>
            <CardDescription>AI model feature importance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {riskFactorData.map((factor, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{factor.factor}</span>
                    <div className="flex items-center gap-2">
                      <Badge className={getImpactColor(factor.impact)}>{factor.impact}</Badge>
                      <span className="text-sm font-bold">{factor.weight}%</span>
                    </div>
                  </div>
                  <Progress value={factor.weight} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* High Risk Loans */}
        <Card>
          <CardHeader>
            <CardTitle>High Risk Loans</CardTitle>
            <CardDescription>Loans with highest default probability</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {highRiskLoans.map((loan) => (
                <div key={loan.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{loan.borrower}</p>
                      <p className="text-sm text-muted-foreground">ID: {loan.id}</p>
                    </div>
                    <Badge className={getRiskColor(loan.riskScore)}>{loan.probability} Risk</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Amount</p>
                      <p className="font-medium">{loan.amount}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Days Overdue</p>
                      <p className="font-medium text-red-600">{loan.daysOverdue}</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground mb-1">Risk Factors:</p>
                    <div className="flex gap-1">
                      {loan.factors.map((factor, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {factor}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="outline">
                      Contact Borrower
                    </Button>
                    <Button size="sm" variant="outline">
                      Review Case
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
