"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  Brain,
  Shield,
  AlertTriangle,
  TrendingUp,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Zap,
  Target,
  Activity,
} from "lucide-react"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"

// Mock data for AI Risk Dashboard
const riskTrendData = [
  { month: "Jan", highRisk: 12, mediumRisk: 28, lowRisk: 145 },
  { month: "Feb", highRisk: 8, mediumRisk: 32, lowRisk: 167 },
  { month: "Mar", highRisk: 15, mediumRisk: 25, lowRisk: 189 },
  { month: "Apr", highRisk: 6, mediumRisk: 38, lowRisk: 201 },
  { month: "May", highRisk: 11, mediumRisk: 29, lowRisk: 223 },
  { month: "Jun", highRisk: 4, mediumRisk: 35, lowRisk: 245 },
]

const aiPerformanceData = [
  { metric: "KYC Accuracy", value: 98.5 },
  { metric: "AML Detection", value: 94.2 },
  { metric: "SAG Risk Scoring", value: 96.8 },
  { metric: "Default Prediction", value: 89.3 },
  { metric: "Fraud Detection", value: 97.1 },
]

export default function AiRiskCompliancePage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("7d")

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
            Comprehensive AI-powered risk management and compliance monitoring for Suyula Liquid
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
        <AlertTitle className="text-red-800">High Priority Alerts</AlertTitle>
        <AlertDescription className="text-red-700">
          3 wallets flagged for suspicious activity, 2 SAG listings require immediate risk review, 1 AML match needs
          investigation
        </AlertDescription>
      </Alert>

      {/* AI Performance Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">KYC AI Accuracy</CardTitle>
            <Shield className="h-5 w-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">98.5%</div>
            <Progress value={98.5} className="mt-2" />
            <div className="text-xs text-emerald-600 mt-1">+0.3% from last week</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">AML Detection Rate</CardTitle>
            <Eye className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">94.2%</div>
            <Progress value={94.2} className="mt-2" />
            <div className="text-xs text-blue-600 mt-1">+1.2% from last week</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">SAG Risk Scoring</CardTitle>
            <Target className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">96.8%</div>
            <Progress value={96.8} className="mt-2" />
            <div className="text-xs text-purple-600 mt-1">+0.8% from last week</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Default Prediction</CardTitle>
            <TrendingUp className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">89.3%</div>
            <Progress value={89.3} className="mt-2" />
            <div className="text-xs text-orange-600 mt-1">+2.1% from last week</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Fraud Detection</CardTitle>
            <Zap className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">97.1%</div>
            <Progress value={97.1} className="mt-2" />
            <div className="text-xs text-red-600 mt-1">+0.5% from last week</div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Risk Monitoring */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Risk Trend Analysis</CardTitle>
              <CardDescription>AI-powered risk classification over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={riskTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="highRisk" stackId="1" stroke="#ef4444" fill="#fecaca" />
                  <Area type="monotone" dataKey="mediumRisk" stackId="1" stroke="#f59e0b" fill="#fed7aa" />
                  <Area type="monotone" dataKey="lowRisk" stackId="1" stroke="#10b981" fill="#bbf7d0" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Model Performance</CardTitle>
              <CardDescription>Accuracy metrics across different AI systems</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {aiPerformanceData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      <span className="font-medium">{item.metric}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={item.value} className="w-24" />
                      <span className="text-sm font-medium w-12">{item.value}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Live Risk Alerts</CardTitle>
              <CardDescription>Real-time AI-generated alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium text-red-800">High Risk Wallet</div>
                  <div className="text-sm text-red-600">Wallet 0x7A2...B4C flagged for velocity anomaly</div>
                  <div className="text-xs text-red-500 mt-1">2 minutes ago</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium text-yellow-800">SAG Risk Score</div>
                  <div className="text-sm text-yellow-600">SAG-2024-0847 scored 85% risk - manual review required</div>
                  <div className="text-xs text-yellow-500 mt-1">5 minutes ago</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Eye className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium text-blue-800">AML Match</div>
                  <div className="text-sm text-blue-600">Potential PEP match detected - investigation initiated</div>
                  <div className="text-xs text-blue-500 mt-1">12 minutes ago</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium text-green-800">KYC Verified</div>
                  <div className="text-sm text-green-600">Batch of 23 KYC applications auto-approved</div>
                  <div className="text-xs text-green-500 mt-1">18 minutes ago</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>AI system health monitoring</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">KYC AI Engine</span>
                <Badge variant="outline" className="bg-green-100 text-green-700">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Online
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">AML Screening</span>
                <Badge variant="outline" className="bg-green-100 text-green-700">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Online
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Risk Scoring</span>
                <Badge variant="outline" className="bg-green-100 text-green-700">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Online
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Wallet Monitor</span>
                <Badge variant="outline" className="bg-yellow-100 text-yellow-700">
                  <Clock className="h-3 w-3 mr-1" />
                  Maintenance
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Compliance Bot</span>
                <Badge variant="outline" className="bg-green-100 text-green-700">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Online
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>AI Risk Management Actions</CardTitle>
          <CardDescription>Quick access to AI-powered compliance tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button className="h-20 flex-col gap-2 bg-emerald-600 hover:bg-emerald-700">
              <Shield className="h-6 w-6" />
              <span>Run KYC Batch</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
              <Eye className="h-6 w-6" />
              <span>AML Screening</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
              <Target className="h-6 w-6" />
              <span>Risk Analysis</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
              <BarChart3 className="h-6 w-6" />
              <span>Generate Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
