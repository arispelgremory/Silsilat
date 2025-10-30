"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Scale, Shield, AlertTriangle, CheckCircle, FileText, Eye } from "lucide-react"

export default function CompliancePage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compliance & Risk</h1>
          <p className="text-gray-600">Monitor compliance status and manage risk assessments</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Scale className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Compliance Alerts */}
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-800">Compliance Issues Detected</AlertTitle>
        <AlertDescription className="text-red-700">
          3 high-priority compliance issues require immediate attention. Review and resolve to maintain platform
          integrity.
        </AlertDescription>
      </Alert>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Compliance Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">94%</div>
            <p className="text-xs text-gray-500">Platform health</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">3</div>
            <p className="text-xs text-gray-500">Require attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Risk Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">Medium</div>
            <p className="text-xs text-gray-500">Overall assessment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Last Audit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Dec 2024</div>
            <p className="text-xs text-gray-500">External review</p>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Dashboard */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Shariah Compliance</CardTitle>
            <CardDescription>Islamic finance compliance monitoring</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium text-green-800">Profit Rate Compliance</div>
                  <div className="text-sm text-green-600">All rates within Shariah limits</div>
                </div>
              </div>
              <Badge variant="outline" className="bg-green-100 text-green-700">
                Compliant
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium text-green-800">Asset Backing</div>
                  <div className="text-sm text-green-600">All tokens backed by physical gold</div>
                </div>
              </div>
              <Badge variant="outline" className="bg-green-100 text-green-700">
                Verified
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <div className="font-medium text-yellow-800">Documentation Review</div>
                  <div className="text-sm text-yellow-600">Quarterly review pending</div>
                </div>
              </div>
              <Badge variant="outline" className="bg-yellow-100 text-yellow-700">
                Pending
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Regulatory Compliance</CardTitle>
            <CardDescription>Malaysian regulatory requirements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium text-green-800">SC Malaysia</div>
                  <div className="text-sm text-green-600">Securities Commission compliance</div>
                </div>
              </div>
              <Badge variant="outline" className="bg-green-100 text-green-700">
                Current
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium text-green-800">BNM Guidelines</div>
                  <div className="text-sm text-green-600">Bank Negara Malaysia compliance</div>
                </div>
              </div>
              <Badge variant="outline" className="bg-green-100 text-green-700">
                Compliant
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <div className="font-medium text-red-800">AML/CFT</div>
                  <div className="text-sm text-red-600">Anti-money laundering update required</div>
                </div>
              </div>
              <Badge variant="outline" className="bg-red-100 text-red-700">
                Action Required
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Assessment */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Assessment Matrix</CardTitle>
          <CardDescription>Current risk levels across different categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-green-600" />
                <h4 className="font-medium">Operational Risk</h4>
              </div>
              <div className="text-2xl font-bold text-green-600 mb-1">Low</div>
              <p className="text-sm text-gray-600">Systems operating normally</p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <h4 className="font-medium">Market Risk</h4>
              </div>
              <div className="text-2xl font-bold text-yellow-600 mb-1">Medium</div>
              <p className="text-sm text-gray-600">Gold price volatility</p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-green-600" />
                <h4 className="font-medium">Credit Risk</h4>
              </div>
              <div className="text-2xl font-bold text-green-600 mb-1">Low</div>
              <p className="text-sm text-gray-600">Strong collateral backing</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Compliance Actions</CardTitle>
            <CardDescription>Manage compliance requirements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <FileText className="h-4 w-4 mr-2" />
              Update Policies
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <Scale className="h-4 w-4 mr-2" />
              Schedule Audit
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Risk Management</CardTitle>
            <CardDescription>Monitor and mitigate risks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Risk Assessment
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <Shield className="h-4 w-4 mr-2" />
              Security Review
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Reports</CardTitle>
            <CardDescription>Generate compliance reports</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <Eye className="h-4 w-4 mr-2" />
              Compliance Report
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <FileText className="h-4 w-4 mr-2" />
              Risk Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
