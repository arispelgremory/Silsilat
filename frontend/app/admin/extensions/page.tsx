"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { RefreshCw, Clock, CheckCircle, XCircle, AlertTriangle, Calendar } from "lucide-react"

const extensionData = [
  {
    sagId: "SAG-2024-089",
    arRahnu: "KL Central Branch",
    originalAmount: "RM 15,000",
    extensionType: "Extension 1",
    requestDate: "2025-01-10",
    currentMaturity: "2025-01-15",
    newMaturity: "2025-07-15",
    status: "pending",
    reason: "Business expansion needs",
    totalExtensions: 0,
    maxExtensions: 2,
  },
  {
    sagId: "SAG-2024-067",
    arRahnu: "Johor Bahru Branch",
    originalAmount: "RM 22,000",
    extensionType: "Extension 2",
    requestDate: "2025-01-08",
    currentMaturity: "2025-01-20",
    newMaturity: "2025-07-20",
    status: "approved",
    reason: "Market conditions",
    totalExtensions: 1,
    maxExtensions: 2,
  },
  {
    sagId: "SAG-2024-045",
    arRahnu: "Penang Branch",
    originalAmount: "RM 18,500",
    extensionType: "Extension 1",
    requestDate: "2025-01-05",
    currentMaturity: "2025-01-10",
    newMaturity: "2025-07-10",
    status: "rejected",
    reason: "Insufficient documentation",
    totalExtensions: 0,
    maxExtensions: 2,
  },
]

export default function ExtensionsPage() {
  const [selectedExtension, setSelectedExtension] = useState<any>(null)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-700">
            Pending
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-700">
            Approved
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

  const getExtensionBadge = (current: number, max: number) => {
    const remaining = max - current
    if (remaining === 0) {
      return (
        <Badge variant="outline" className="bg-red-100 text-red-700">
          Max Reached
        </Badge>
      )
    } else if (remaining === 1) {
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-700">
          1 Remaining
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-700">
          {remaining} Remaining
        </Badge>
      )
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Loan Extensions</h1>
          <p className="text-gray-600">Manage loan extension requests and approvals</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <RefreshCw className="h-4 w-4 mr-2" />
          Review Extensions
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">8</div>
            <p className="text-xs text-gray-500">Awaiting approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Approved This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">15</div>
            <p className="text-xs text-gray-500">Extensions granted</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Extension 1</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-gray-500">First extensions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Extension 2</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-gray-500">Final extensions</p>
          </CardContent>
        </Card>
      </div>

      {/* Extension Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Extension Requests</CardTitle>
          <CardDescription>
            Review and manage loan extension requests (up to 2 extensions, 6 months each)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SAG ID</TableHead>
                  <TableHead>Ar Rahnu Branch</TableHead>
                  <TableHead>Extension Type</TableHead>
                  <TableHead>Current Maturity</TableHead>
                  <TableHead>New Maturity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Extensions Left</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {extensionData.map((extension) => (
                  <TableRow key={extension.sagId}>
                    <TableCell className="font-medium">{extension.sagId}</TableCell>
                    <TableCell>{extension.arRahnu}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-100 text-blue-700">
                        {extension.extensionType}
                      </Badge>
                    </TableCell>
                    <TableCell>{extension.currentMaturity}</TableCell>
                    <TableCell>{extension.newMaturity}</TableCell>
                    <TableCell>{getStatusBadge(extension.status)}</TableCell>
                    <TableCell>{getExtensionBadge(extension.totalExtensions, extension.maxExtensions)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedExtension(extension)}
                              className="bg-transparent"
                            >
                              Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Extension Request - {selectedExtension?.sagId}</DialogTitle>
                              <DialogDescription>Review and approve/reject extension request</DialogDescription>
                            </DialogHeader>
                            {selectedExtension && (
                              <div className="space-y-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                  <div>
                                    <label className="text-sm font-medium">SAG ID</label>
                                    <p className="text-sm text-gray-600">{selectedExtension.sagId}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Ar Rahnu Branch</label>
                                    <p className="text-sm text-gray-600">{selectedExtension.arRahnu}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Original Amount</label>
                                    <p className="text-sm text-gray-600">{selectedExtension.originalAmount}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Extension Type</label>
                                    <p className="text-sm text-gray-600">{selectedExtension.extensionType}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Request Date</label>
                                    <p className="text-sm text-gray-600">{selectedExtension.requestDate}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Extensions Used</label>
                                    <p className="text-sm text-gray-600">
                                      {selectedExtension.totalExtensions} of {selectedExtension.maxExtensions}
                                    </p>
                                  </div>
                                </div>

                                <div>
                                  <label className="text-sm font-medium">Reason for Extension</label>
                                  <p className="text-sm text-gray-600 mt-1 p-3 bg-gray-50 rounded-lg">
                                    {selectedExtension.reason}
                                  </p>
                                </div>

                                <div className="border-t pt-4">
                                  <h4 className="font-medium mb-3">Extension Timeline</h4>
                                  <div className="space-y-2">
                                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                      <span className="text-sm">Current Maturity:</span>
                                      <span className="text-sm font-medium">{selectedExtension.currentMaturity}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                                      <span className="text-sm">New Maturity (if approved):</span>
                                      <span className="text-sm font-medium text-blue-700">
                                        {selectedExtension.newMaturity}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                                      <span className="text-sm">Extension Period:</span>
                                      <span className="text-sm font-medium text-yellow-700">6 months</span>
                                    </div>
                                  </div>
                                </div>

                                {selectedExtension.status === "pending" && (
                                  <div className="border-t pt-4">
                                    <h4 className="font-medium mb-3">Actions</h4>
                                    <div className="flex gap-2">
                                      <Button className="bg-green-600 hover:bg-green-700">
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Approve Extension
                                      </Button>
                                      <Button variant="destructive">
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Reject Extension
                                      </Button>
                                      <Button variant="outline" className="bg-transparent">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Request More Info
                                      </Button>
                                    </div>
                                  </div>
                                )}

                                {selectedExtension.status === "approved" && (
                                  <div className="border-t pt-4">
                                    <h4 className="font-medium mb-3">Post-Approval Actions</h4>
                                    <div className="flex gap-2">
                                      <Button className="bg-emerald-600 hover:bg-emerald-700">
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Auto-mint New Listing
                                      </Button>
                                      <Button variant="outline" className="bg-transparent">
                                        View New NFT/Token
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        {extension.status === "pending" && (
                          <>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="destructive">
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
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

      {/* Extension Policy Info */}
      <Card>
        <CardHeader>
          <CardTitle>Extension Policy</CardTitle>
          <CardDescription>Current platform extension rules and limits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium">Extension Duration</h4>
              </div>
              <p className="text-sm text-gray-600">Each extension adds 6 months to the original term</p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw className="h-5 w-5 text-green-600" />
                <h4 className="font-medium">Maximum Extensions</h4>
              </div>
              <p className="text-sm text-gray-600">Up to 2 extensions allowed (18 months total)</p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <h4 className="font-medium">Requirements</h4>
              </div>
              <p className="text-sm text-gray-600">Previous listing must be fully repaid before approval</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
