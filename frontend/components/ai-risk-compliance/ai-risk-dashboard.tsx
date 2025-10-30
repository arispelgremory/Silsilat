"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Brain,
  Shield,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Users,
  FileText,
  Wallet,
  Clock,
  Eye,
  Activity,
  BarChart3,
  Zap,
} from "lucide-react"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"

// Mock data for AI Risk Dashboard
const riskMetrics = {
  overallRiskScore: 72,
  kycComplianceRate: 94.5,
  amlAlertsToday: 12,
  sagRiskFlags: 8,
  walletAnomalies: 3,
  defaultPredictions: 15,
}

const riskTrendData = [
  { date: "2024-01-01", riskScore: 65, alerts: 8 },
  { date: "2024-01-02", riskScore: 68, alerts: 12 },
  { date: "2024-01-03", riskScore: 71, alerts: 15 },
  { date: "2024-01-04", riskScore: 69, alerts: 9 },
  { date: "2024-01-05", riskScore: 72, alerts: 11 },
  { date: "2024-01-06", riskScore: 74, alerts: 14 },
  { date: "2024-01-07", riskScore: 72, alerts: 12 },
]

const recentAlerts = [
  {
    id: 1,
    type: "High Risk SAG",
    message: "SAG #10295 flagged for 85% raise ratio",
    severity: "high",
    timestamp: "2 minutes ago",
    status: "pending",
  },
  {
    id: 2,
    type: "Wallet Anomaly",
    message: "Wallet 0x123...abc shows velocity alert",
    severity: "medium",
    timestamp: "5 minutes ago",
    status: "investigating",
  },
  {
    id: 3,
    type: "KYC Alert",
    message: "Document verification failed for user ID 4521",
    severity: "high",
    timestamp: "8 minutes ago",
    status: "pending",
  },
  {
    id: 4,
    type: "AML Match",
    message: "Potential PEP match detected",
    severity: "critical",
    timestamp: "12 minutes ago",
    status: "escalated",
  },
]

const aiModels = [
  {
    name: "KYC Document Intelligence",
    accuracy: 98.5,
    status: "active",
    lastTrained: "2024-01-15",
    predictions: 1247,
  },
  {
    name: "SAG Risk Evaluator",
    accuracy: 94.2,
    status: "active",
    lastTrained: "2024-01-14",
    predictions: 892,
  },
  {
    name: "Default Prediction Engine",
    accuracy: 87.8,
    status: "active",
    lastTrained: "2024-01-13",
    predictions: 456,
  },
  {
    name: "Wallet Behavior Analyzer",
    accuracy: 91.3,
    status: "active",
    lastTrained: "2024-01-12",
    predictions: 2341,
  },
]

export function AiRiskDashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("7d")

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-blue-100 text-blue-800 border-blue-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "escalated":
        return "bg-red-500"
      case "investigating":
        return "bg-yellow-500"
      case "resolved":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="h-6 w-6 text-emerald-600" />
            AI Risk & Compliance Dashboard
          </h1>
          <p className="text-gray-600">
            Real-time AI-powered risk monitoring and compliance management for Suyula Liquid
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-100 text-green-700">
            <Activity className="h-3 w-3 mr-1" />
            All Systems Operational
          </Badge>
        </div>
      </div>

      {/* Critical Alerts */}
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-800">Critical Risk Alerts</AlertTitle>
        <AlertDescription className="text-red-700">
          4 high-priority items require immediate attention: 1 AML match, 2 high-risk SAGs, and 1 wallet anomaly.
        </AlertDescription>
      </Alert>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Overall Risk Score</CardTitle>
            <Shield className="h-5 w-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{riskMetrics.overallRiskScore}/100</div>
            <Progress value={riskMetrics.overallRiskScore} className="mt-2" />
            <div className="text-xs text-gray-500 mt-1">Moderate Risk Level</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">KYC Compliance Rate</CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{riskMetrics.kycComplianceRate}%</div>
            <Progress value={riskMetrics.kycComplianceRate} className="mt-2" />
            <div className="text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +2.1% from last week
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Alerts</CardTitle>
            <AlertTriangle className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{riskMetrics.amlAlertsToday}</div>
            <div className="text-xs text-orange-600 mt-1">Requires attention</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">AI Predictions Today</CardTitle>
            <Brain className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">4,936</div>
            <div className="text-xs text-purple-600 mt-1">
              <Zap className="h-3 w-3 inline mr-1" />
              Real-time analysis
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Risk Trends Chart */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Risk Trends & AI Performance</CardTitle>
              <CardDescription>Platform risk score and alert volume over time</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="risk-trends" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="risk-trends">Risk Trends</TabsTrigger>
                  <TabsTrigger value="ai-performance">AI Performance</TabsTrigger>
                </TabsList>
                <TabsContent value="risk-trends" className="space-y-4">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={riskTrendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="riskScore"
                          stroke="#10b981"
                          fill="#10b981"
                          fillOpacity={0.2}
                          name="Risk Score"
                        />
                        <Area
                          type="monotone"
                          dataKey="alerts"
                          stroke="#f59e0b"
                          fill="#f59e0b"
                          fillOpacity={0.2}
                          name="Alerts"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
                <TabsContent value="ai-performance" className="space-y-4">
                  <div className="space-y-4">
                    {aiModels.map((model, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{model.name}</div>
                          <div className="text-sm text-gray-500">
                            Last trained: {model.lastTrained} • {model.predictions} predictions
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-medium">{model.accuracy}%</div>
                            <div className="text-xs text-gray-500">Accuracy</div>
                          </div>
                          <Badge variant="outline" className="bg-green-100 text-green-700">
                            {model.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Risk Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Category Breakdown</CardTitle>
              <CardDescription>Current risk distribution across different categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                  <XCircle className="h-8 w-8 text-red-600" />
                  <div>
                    <div className="font-medium text-red-800">High Risk SAGs</div>
                    <div className="text-sm text-red-600">{riskMetrics.sagRiskFlags} active flags</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                  <Wallet className="h-8 w-8 text-yellow-600" />
                  <div>
                    <div className="font-medium text-yellow-800">Wallet Anomalies</div>
                    <div className="text-sm text-yellow-600">{riskMetrics.walletAnomalies} detected</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                  <Clock className="h-8 w-8 text-orange-600" />
                  <div>
                    <div className="font-medium text-orange-800">Default Risk</div>
                    <div className="text-sm text-orange-600">{riskMetrics.defaultPredictions} predictions</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Alerts Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent AI Alerts</CardTitle>
              <CardDescription>Latest risk detections and compliance flags</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentAlerts.map((alert) => (
                  <div key={alert.id} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={getSeverityColor(alert.severity)}>{alert.type}</Badge>
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(alert.status)}`} />
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{alert.message}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{alert.timestamp}</span>
                      <span className="capitalize">{alert.status}</span>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4 bg-transparent">
                <Eye className="h-4 w-4 mr-2" />
                View All Alerts
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>AI Risk Actions</CardTitle>
              <CardDescription>Quick access to risk management tools</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start bg-emerald-600 hover:bg-emerald-700">
                <Brain className="h-4 w-4 mr-2" />
                Run Full Risk Scan
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Shield className="h-4 w-4 mr-2" />
                Review KYC Queue
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <FileText className="h-4 w-4 mr-2" />
                Generate Risk Report
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <BarChart3 className="h-4 w-4 mr-2" />
                Model Performance
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
