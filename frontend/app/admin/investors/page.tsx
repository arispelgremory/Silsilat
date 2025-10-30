"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Search, Filter, Eye, Ban, Download, Shield, Wallet, CheckCircle } from "lucide-react"

const investorData = [
  {
    id: "INV-001",
    walletAddress: "0x1234...5678",
    kycStatus: "verified",
    totalInvested: "RM 45,000",
    activeSAGs: 8,
    totalReturns: "RM 2,700",
    joinDate: "2024-06-15",
    lastActivity: "2025-01-15",
    riskScore: "low",
    status: "active",
  },
  {
    id: "INV-002",
    walletAddress: "0x2345...6789",
    kycStatus: "pending",
    totalInvested: "RM 12,000",
    activeSAGs: 3,
    totalReturns: "RM 720",
    joinDate: "2024-08-20",
    lastActivity: "2025-01-14",
    riskScore: "medium",
    status: "active",
  },
  {
    id: "INV-003",
    walletAddress: "0x3456...7890",
    kycStatus: "verified",
    totalInvested: "RM 78,500",
    activeSAGs: 15,
    totalReturns: "RM 4,710",
    joinDate: "2024-03-10",
    lastActivity: "2025-01-16",
    riskScore: "low",
    status: "suspended",
  },
]

export default function InvestorsPage() {
  const [selectedInvestor, setSelectedInvestor] = useState<any>(null)
  const [filterStatus, setFilterStatus] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  const getKYCBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-700">
            Verified
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-700">
            Pending
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-700">
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-700">
            Active
          </Badge>
        )
      case "suspended":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-700">
            Suspended
          </Badge>
        )
      case "blacklisted":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-700">
            Blacklisted
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "low":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-700">
            Low
          </Badge>
        )
      case "medium":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-700">
            Medium
          </Badge>
        )
      case "high":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-700">
            High
          </Badge>
        )
      default:
        return <Badge variant="outline">{risk}</Badge>
    }
  }

  const filteredInvestors = investorData.filter((investor) => {
    const matchesStatus = filterStatus === "all" || investor.status === filterStatus
    const matchesSearch =
      investor.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      investor.walletAddress.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Investor Management</h1>
          <p className="text-gray-600">Manage investor accounts, KYC status, and investment tracking</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Download className="h-4 w-4 mr-2" />
          Export Reports
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Investors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">573</div>
            <p className="text-xs text-gray-500">+47 this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">KYC Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">521</div>
            <p className="text-xs text-gray-500">91% completion rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Invested</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">RM 2.4M</div>
            <p className="text-xs text-gray-500">Across all SAGs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Investments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">1,247</div>
            <p className="text-xs text-gray-500">Current positions</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Investor Directory</CardTitle>
          <CardDescription>Complete list of investors with KYC status and investment details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by investor ID or wallet address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="blacklisted">Blacklisted</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="bg-transparent">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>

          {/* Investor Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Investor ID</TableHead>
                  <TableHead>Wallet Address</TableHead>
                  <TableHead>KYC Status</TableHead>
                  <TableHead>Total Invested</TableHead>
                  <TableHead>Active SAGs</TableHead>
                  <TableHead>Risk Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvestors.map((investor) => (
                  <TableRow key={investor.id}>
                    <TableCell className="font-medium">{investor.id}</TableCell>
                    <TableCell className="font-mono text-sm">{investor.walletAddress}</TableCell>
                    <TableCell>{getKYCBadge(investor.kycStatus)}</TableCell>
                    <TableCell>{investor.totalInvested}</TableCell>
                    <TableCell>{investor.activeSAGs}</TableCell>
                    <TableCell>{getRiskBadge(investor.riskScore)}</TableCell>
                    <TableCell>{getStatusBadge(investor.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedInvestor(investor)}
                              className="bg-transparent"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>Investor Details - {selectedInvestor?.id}</DialogTitle>
                              <DialogDescription>Complete investor profile and investment history</DialogDescription>
                            </DialogHeader>
                            {selectedInvestor && (
                              <Tabs defaultValue="profile" className="w-full">
                                <TabsList className="grid w-full grid-cols-4">
                                  <TabsTrigger value="profile">Profile</TabsTrigger>
                                  <TabsTrigger value="investments">Investments</TabsTrigger>
                                  <TabsTrigger value="returns">Returns</TabsTrigger>
                                  <TabsTrigger value="activity">Activity</TabsTrigger>
                                </TabsList>
                                <TabsContent value="profile" className="space-y-4">
                                  <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                      <label className="text-sm font-medium">Investor ID</label>
                                      <p className="text-sm text-gray-600">{selectedInvestor.id}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Wallet Address</label>
                                      <p className="text-sm text-gray-600 font-mono">
                                        {selectedInvestor.walletAddress}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">KYC Status</label>
                                      <div className="mt-1">{getKYCBadge(selectedInvestor.kycStatus)}</div>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Account Status</label>
                                      <div className="mt-1">{getStatusBadge(selectedInvestor.status)}</div>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Join Date</label>
                                      <p className="text-sm text-gray-600">{selectedInvestor.joinDate}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Last Activity</label>
                                      <p className="text-sm text-gray-600">{selectedInvestor.lastActivity}</p>
                                    </div>
                                  </div>
                                  <div className="border-t pt-4">
                                    <h4 className="font-medium mb-3">Account Actions</h4>
                                    <div className="flex gap-2 flex-wrap">
                                      {selectedInvestor.status === "active" && (
                                        <Button size="sm" variant="destructive">
                                          <Ban className="h-4 w-4 mr-2" />
                                          Suspend Account
                                        </Button>
                                      )}
                                      {selectedInvestor.status === "suspended" && (
                                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                          <CheckCircle className="h-4 w-4 mr-2" />
                                          Reactivate Account
                                        </Button>
                                      )}
                                      <Button size="sm" variant="outline" className="bg-transparent">
                                        <Wallet className="h-4 w-4 mr-2" />
                                        Blacklist Wallet
                                      </Button>
                                      <Button size="sm" variant="outline" className="bg-transparent">
                                        <Shield className="h-4 w-4 mr-2" />
                                        Adjust Risk Score
                                      </Button>
                                    </div>
                                  </div>
                                </TabsContent>
                                <TabsContent value="investments" className="space-y-4">
                                  <div className="grid gap-4 md:grid-cols-3">
                                    <div className="p-3 border rounded-lg">
                                      <div className="text-sm font-medium text-gray-600">Total Invested</div>
                                      <div className="text-lg font-bold">{selectedInvestor.totalInvested}</div>
                                    </div>
                                    <div className="p-3 border rounded-lg">
                                      <div className="text-sm font-medium text-gray-600">Active SAGs</div>
                                      <div className="text-lg font-bold">{selectedInvestor.activeSAGs}</div>
                                    </div>
                                    <div className="p-3 border rounded-lg">
                                      <div className="text-sm font-medium text-gray-600">Average Investment</div>
                                      <div className="text-lg font-bold">RM 5,625</div>
                                    </div>
                                  </div>
                                  <div className="border rounded-lg p-4">
                                    <h4 className="font-medium mb-3">Recent Investments</h4>
                                    <div className="space-y-2">
                                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                        <span className="text-sm">SAG-2025-001</span>
                                        <span className="text-sm font-medium">RM 5,000</span>
                                      </div>
                                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                        <span className="text-sm">SAG-2025-003</span>
                                        <span className="text-sm font-medium">RM 3,500</span>
                                      </div>
                                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                        <span className="text-sm">SAG-2024-089</span>
                                        <span className="text-sm font-medium">RM 7,200</span>
                                      </div>
                                    </div>
                                  </div>
                                </TabsContent>
                                <TabsContent value="returns" className="space-y-4">
                                  <div className="grid gap-4 md:grid-cols-2">
                                    <div className="p-3 border rounded-lg">
                                      <div className="text-sm font-medium text-gray-600">Total Returns</div>
                                      <div className="text-lg font-bold text-green-600">
                                        {selectedInvestor.totalReturns}
                                      </div>
                                    </div>
                                    <div className="p-3 border rounded-lg">
                                      <div className="text-sm font-medium text-gray-600">Return Rate</div>
                                      <div className="text-lg font-bold text-green-600">6.0%</div>
                                    </div>
                                  </div>
                                  <div className="border rounded-lg p-4">
                                    <h4 className="font-medium mb-3">Payout History</h4>
                                    <div className="space-y-2">
                                      <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                                        <div>
                                          <span className="text-sm font-medium">SAG-2024-067</span>
                                          <p className="text-xs text-gray-500">Completed 2025-01-10</p>
                                        </div>
                                        <span className="text-sm font-medium text-green-600">+RM 450</span>
                                      </div>
                                      <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                                        <div>
                                          <span className="text-sm font-medium">SAG-2024-045</span>
                                          <p className="text-xs text-gray-500">Completed 2024-12-15</p>
                                        </div>
                                        <span className="text-sm font-medium text-green-600">+RM 320</span>
                                      </div>
                                    </div>
                                  </div>
                                </TabsContent>
                                <TabsContent value="activity" className="space-y-4">
                                  <div className="border rounded-lg p-4">
                                    <h4 className="font-medium mb-3">Recent Activity</h4>
                                    <div className="space-y-3">
                                      <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <div>
                                          <p className="text-sm font-medium">Invested in SAG-2025-001</p>
                                          <p className="text-xs text-gray-500">2025-01-15 14:30</p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <div>
                                          <p className="text-sm font-medium">Received payout from SAG-2024-067</p>
                                          <p className="text-xs text-gray-500">2025-01-10 09:15</p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                        <div>
                                          <p className="text-sm font-medium">KYC verification completed</p>
                                          <p className="text-xs text-gray-500">2024-06-16 11:20</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </TabsContent>
                              </Tabs>
                            )}
                          </DialogContent>
                        </Dialog>
                        {investor.status === "active" && (
                          <Button size="sm" variant="destructive">
                            <Ban className="h-4 w-4" />
                          </Button>
                        )}
                        {investor.status === "suspended" && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Bulk Actions</CardTitle>
            <CardDescription>Perform actions on multiple investors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              Export Investor List
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <Users className="h-4 w-4 mr-2" />
              Bulk KYC Review
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Risk Management</CardTitle>
            <CardDescription>Monitor and manage investor risks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <Shield className="h-4 w-4 mr-2" />
              Risk Assessment
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <Ban className="h-4 w-4 mr-2" />
              Blacklist Management
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Reports</CardTitle>
            <CardDescription>Generate investor reports</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              Investment Report
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              Returns Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
