"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Download, Calendar, CheckCircle, Clock, AlertTriangle, BarChart3 } from "lucide-react"

const monthlyReports = [
  {
    id: "RPT-2024-01",
    title: "January 2024 Compliance Report",
    type: "Monthly Regulatory",
    status: "completed",
    generatedDate: "2024-02-01",
    dueDate: "2024-02-05",
    size: "2.4 MB",
    sections: ["KYC Summary", "AML Alerts", "Transaction Analysis", "Risk Assessment"],
  },
  {
    id: "RPT-2024-02",
    title: "February 2024 Compliance Report",
    type: "Monthly Regulatory",
    status: "generating",
    generatedDate: null,
    dueDate: "2024-03-05",
    size: null,
    sections: ["KYC Summary", "AML Alerts", "Transaction Analysis", "Risk Assessment"],
  },
]

const auditReports = [
  {
    id: "AUD-2024-Q1",
    title: "Q1 2024 AI Model Audit",
    type: "AI Audit",
    status: "completed",
    generatedDate: "2024-01-31",
    findings: 3,
    recommendations: 5,
    modelAccuracy: 96.8,
  },
  {
    id: "AUD-2024-001",
    title: "KYC Process Audit",
    type: "Process Audit",
    status: "in_progress",
    generatedDate: null,
    findings: null,
    recommendations: null,
    modelAccuracy: null,
  },
]

const complianceMetrics = {
  kycCompletion: 98.5,
  amlScreening: 99.2,
  riskAssessment: 97.8,
  documentVerification: 96.4,
  transactionMonitoring: 99.7,
}

export default function ReportingPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "generating":
        return "bg-blue-100 text-blue-800"
      case "in_progress":
        return "bg-orange-100 text-orange-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "generating":
        return <Clock className="h-4 w-4 animate-spin" />
      case "in_progress":
        return <Clock className="h-4 w-4" />
      case "overdue":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <FileText className="h-6 w-6 text-green-600" />
        <h1 className="text-2xl font-bold">Automated Regulatory Reporting</h1>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Reports Generated</p>
                <p className="text-2xl font-bold">47</p>
                <p className="text-xs text-green-600">This month</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">On-time Delivery</p>
                <p className="text-2xl font-bold text-green-600">100%</p>
                <p className="text-xs text-green-600">Perfect record</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Generation Time</p>
                <p className="text-2xl font-bold">4.2min</p>
                <p className="text-xs text-green-600">↓ 2.1min faster</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Compliance Score</p>
                <p className="text-2xl font-bold text-green-600">98.5%</p>
                <p className="text-xs text-green-600">↑ 0.3% improvement</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Metrics Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Current Compliance Metrics</CardTitle>
          <CardDescription>Real-time compliance performance indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(complianceMetrics).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                  <span className="font-bold text-green-600">{value}%</span>
                </div>
                <Progress value={value} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="regulatory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="regulatory">Regulatory Reports</TabsTrigger>
          <TabsTrigger value="audit">Audit Reports</TabsTrigger>
          <TabsTrigger value="generate">Generate New</TabsTrigger>
        </TabsList>

        <TabsContent value="regulatory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Regulatory Reports</CardTitle>
              <CardDescription>Automated compliance reports for regulatory authorities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyReports.map((report) => (
                  <div key={report.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{report.title}</p>
                          <Badge className={getStatusColor(report.status)}>
                            {getStatusIcon(report.status)}
                            {report.status.replace("_", " ").toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          ID: {report.id} • Type: {report.type}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Due: {report.dueDate}</p>
                        {report.size && <p className="text-sm font-medium">{report.size}</p>}
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm font-medium mb-1">Report Sections:</p>
                      <div className="flex gap-1 flex-wrap">
                        {report.sections.map((section, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {section}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {report.status === "completed" && (
                        <>
                          <Button size="sm" variant="outline">
                            <Download className="mr-1 h-3 w-3" />
                            Download PDF
                          </Button>
                          <Button size="sm" variant="outline">
                            View Online
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Model & Process Audits</CardTitle>
              <CardDescription>Explainable AI and audit trail reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditReports.map((report) => (
                  <div key={report.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{report.title}</p>
                          <Badge className={getStatusColor(report.status)}>
                            {getStatusIcon(report.status)}
                            {report.status.replace("_", " ").toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          ID: {report.id} • Type: {report.type}
                        </p>
                      </div>
                      {report.modelAccuracy && (
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Model Accuracy</p>
                          <p className="text-lg font-bold text-green-600">{report.modelAccuracy}%</p>
                        </div>
                      )}
                    </div>

                    {report.status === "completed" && (
                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-muted-foreground">Findings</p>
                          <p className="font-medium text-orange-600">{report.findings}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Recommendations</p>
                          <p className="font-medium text-blue-600">{report.recommendations}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {report.status === "completed" && (
                        <>
                          <Button size="sm" variant="outline">
                            <Download className="mr-1 h-3 w-3" />
                            Download Report
                          </Button>
                          <Button size="sm" variant="outline">
                            View Findings
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="outline">
                        View Progress
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate New Report</CardTitle>
              <CardDescription>Create custom compliance and audit reports</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Report Type</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly Regulatory</SelectItem>
                      <SelectItem value="quarterly">Quarterly Summary</SelectItem>
                      <SelectItem value="audit">AI Model Audit</SelectItem>
                      <SelectItem value="custom">Custom Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Period</label>
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Current Month</SelectItem>
                      <SelectItem value="quarterly">Current Quarter</SelectItem>
                      <SelectItem value="yearly">Current Year</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Include Sections</label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">KYC Summary</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">AML Screening</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">Transaction Analysis</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">Risk Assessment</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">AI Model Performance</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Audit Trail</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2">
                <Button>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>
                <Button variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Recurring
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
