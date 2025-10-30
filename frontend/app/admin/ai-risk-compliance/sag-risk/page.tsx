"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Shield, AlertTriangle, CheckCircle, Clock, Gem, TrendingUp } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const riskDistributionData = [
  { name: "Low Risk", value: 65, color: "#10B981" },
  { name: "Medium Risk", value: 25, color: "#F59E0B" },
  { name: "High Risk", value: 10, color: "#EF4444" },
]

const categoryRiskData = [
  { category: "Gold Jewelry", low: 45, medium: 15, high: 5 },
  { category: "Diamond Rings", low: 20, medium: 8, high: 3 },
  { category: "Silver Items", low: 30, medium: 12, high: 2 },
  { category: "Precious Stones", low: 15, medium: 10, high: 8 },
]

const pendingEvaluations = [
  {
    id: "SAG001",
    itemType: "Gold Necklace",
    submittedBy: "Ahmad Rahman",
    estimatedValue: "RM 8,500",
    riskScore: 25,
    status: "processing",
    factors: ["Market Volatility", "Authentication"],
    submissionDate: "2024-01-15",
  },
  {
    id: "SAG002",
    itemType: "Diamond Ring",
    submittedBy: "Siti Nurhaliza",
    estimatedValue: "RM 15,000",
    riskScore: 75,
    status: "high_risk",
    factors: ["Certification Missing", "Price Anomaly"],
    submissionDate: "2024-01-14",
  },
  {
    id: "SAG003",
    itemType: "Silver Bracelet",
    submittedBy: "Raj Kumar",
    estimatedValue: "RM 2,200",
    riskScore: 15,
    status: "approved",
    factors: ["Standard Valuation"],
    submissionDate: "2024-01-13",
  },
]

export default function SAGRiskPage() {
  const getRiskColor = (score: number) => {
    if (score >= 70) return "bg-red-100 text-red-800"
    if (score >= 40) return "bg-orange-100 text-orange-800"
    return "bg-green-100 text-green-800"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "high_risk":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4" />
      case "processing":
        return <Clock className="h-4 w-4" />
      case "high_risk":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">SAG Listing Risk Evaluation</h1>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Evaluations</p>
                <p className="text-2xl font-bold">1,247</p>
                <p className="text-xs text-green-600">↑ 12% this month</p>
              </div>
              <Gem className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Processing Time</p>
                <p className="text-2xl font-bold">2.3h</p>
                <p className="text-xs text-green-600">↓ 0.5h improvement</p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Risk Items</p>
                <p className="text-2xl font-bold text-red-600">18</p>
                <p className="text-xs text-muted-foreground">Requiring review</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">AI Accuracy</p>
                <p className="text-2xl font-bold text-green-600">96.8%</p>
                <p className="text-xs text-green-600">↑ 2.1% this quarter</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
            <CardDescription>Current portfolio risk breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: {
                  label: "Items",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {riskDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="flex justify-center gap-4 mt-4">
              {riskDistributionData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm">
                    {item.name}: {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Risk Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Risk by Category</CardTitle>
            <CardDescription>Risk distribution across jewelry categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                low: {
                  label: "Low Risk",
                  color: "#10B981",
                },
                medium: {
                  label: "Medium Risk",
                  color: "#F59E0B",
                },
                high: {
                  label: "High Risk",
                  color: "#EF4444",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryRiskData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="low" stackId="a" fill="var(--color-low)" />
                  <Bar dataKey="medium" stackId="a" fill="var(--color-medium)" />
                  <Bar dataKey="high" stackId="a" fill="var(--color-high)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Pending Evaluations */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Risk Evaluations</CardTitle>
          <CardDescription>Items currently under AI risk assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingEvaluations.map((item) => (
              <div key={item.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{item.itemType}</p>
                      <Badge className={getStatusColor(item.status)}>
                        {getStatusIcon(item.status)}
                        {item.status.replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      ID: {item.id} • Submitted by {item.submittedBy}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{item.estimatedValue}</p>
                    <p className="text-sm text-muted-foreground">{item.submissionDate}</p>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Risk Score</span>
                    <span className="text-sm font-bold">{item.riskScore}/100</span>
                  </div>
                  <Progress value={item.riskScore} className="h-2" />
                </div>

                <div className="mb-3">
                  <p className="text-sm font-medium mb-1">Risk Factors:</p>
                  <div className="flex gap-1">
                    {item.factors.map((factor, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {factor}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                  <Button size="sm" variant="outline">
                    Manual Review
                  </Button>
                  {item.status === "high_risk" && (
                    <Button size="sm" variant="destructive">
                      Reject Listing
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
