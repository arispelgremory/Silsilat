"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Building2, Search, MapPin, Phone, Mail, Users, Settings } from "lucide-react"

const branchData = [
  {
    id: "BR-001",
    name: "KL Central Branch",
    location: "Kuala Lumpur",
    address: "123 Jalan Bukit Bintang, 50200 KL",
    phone: "+60 3-2141 8200",
    email: "klcentral@arrahnu.com.my",
    manager: "Ahmad Rahman",
    status: "active",
    totalSAGs: 45,
    totalValue: "RM 675,000",
    joinDate: "2023-01-15",
  },
  {
    id: "BR-002",
    name: "Johor Bahru Branch",
    location: "Johor Bahru",
    address: "456 Jalan Wong Ah Fook, 80000 JB",
    phone: "+60 7-222 3344",
    email: "jb@arrahnu.com.my",
    manager: "Siti Aminah",
    status: "active",
    totalSAGs: 32,
    totalValue: "RM 480,000",
    joinDate: "2023-03-20",
  },
  {
    id: "BR-003",
    name: "Penang Branch",
    location: "George Town",
    address: "789 Lebuh Campbell, 10100 Penang",
    phone: "+60 4-261 5566",
    email: "penang@arrahnu.com.my",
    manager: "Lim Wei Ming",
    status: "pending",
    totalSAGs: 0,
    totalValue: "RM 0",
    joinDate: "2025-01-10",
  },
]

export default function BranchesPage() {
  const [selectedBranch, setSelectedBranch] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-700">
            Active
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-700">
            Pending
          </Badge>
        )
      case "suspended":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-700">
            Suspended
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const filteredBranches = branchData.filter(
    (branch) =>
      branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ar Rahnu Branches</h1>
          <p className="text-gray-600">Manage Ar Rahnu branch partnerships and configurations</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Building2 className="h-4 w-4 mr-2" />
          Add New Branch
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Branches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">25</div>
            <p className="text-xs text-gray-500">Active partnerships</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">3</div>
            <p className="text-xs text-gray-500">Awaiting approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total SAGs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-gray-500">Across all branches</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">RM 2.4M</div>
            <p className="text-xs text-gray-500">Combined portfolio</p>
          </CardContent>
        </Card>
      </div>

      {/* Branch Management */}
      <Card>
        <CardHeader>
          <CardTitle>Branch Directory</CardTitle>
          <CardDescription>Manage all Ar Rahnu branch partnerships</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search branches..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Branch Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Total SAGs</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBranches.map((branch) => (
                  <TableRow key={branch.id}>
                    <TableCell className="font-medium">{branch.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        {branch.location}
                      </div>
                    </TableCell>
                    <TableCell>{branch.manager}</TableCell>
                    <TableCell>{branch.totalSAGs}</TableCell>
                    <TableCell>{branch.totalValue}</TableCell>
                    <TableCell>{getStatusBadge(branch.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedBranch(branch)}
                              className="bg-transparent"
                            >
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>{selectedBranch?.name}</DialogTitle>
                              <DialogDescription>Branch details and management options</DialogDescription>
                            </DialogHeader>
                            {selectedBranch && (
                              <div className="space-y-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                  <div>
                                    <label className="text-sm font-medium">Branch ID</label>
                                    <p className="text-sm text-gray-600">{selectedBranch.id}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Status</label>
                                    <div className="mt-1">{getStatusBadge(selectedBranch.status)}</div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Manager</label>
                                    <p className="text-sm text-gray-600">{selectedBranch.manager}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Join Date</label>
                                    <p className="text-sm text-gray-600">{selectedBranch.joinDate}</p>
                                  </div>
                                </div>

                                <div>
                                  <label className="text-sm font-medium">Address</label>
                                  <p className="text-sm text-gray-600 mt-1">{selectedBranch.address}</p>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                  <div>
                                    <label className="text-sm font-medium">Phone</label>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Phone className="h-4 w-4 text-gray-400" />
                                      <p className="text-sm text-gray-600">{selectedBranch.phone}</p>
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Email</label>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Mail className="h-4 w-4 text-gray-400" />
                                      <p className="text-sm text-gray-600">{selectedBranch.email}</p>
                                    </div>
                                  </div>
                                </div>

                                <div className="border-t pt-4">
                                  <h4 className="font-medium mb-3">Performance Metrics</h4>
                                  <div className="grid gap-4 md:grid-cols-2">
                                    <div className="p-3 border rounded-lg">
                                      <div className="text-sm font-medium text-gray-600">Total SAGs</div>
                                      <div className="text-lg font-bold">{selectedBranch.totalSAGs}</div>
                                    </div>
                                    <div className="p-3 border rounded-lg">
                                      <div className="text-sm font-medium text-gray-600">Total Value</div>
                                      <div className="text-lg font-bold">{selectedBranch.totalValue}</div>
                                    </div>
                                  </div>
                                </div>

                                <div className="border-t pt-4">
                                  <h4 className="font-medium mb-3">Actions</h4>
                                  <div className="flex gap-2 flex-wrap">
                                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                                      <Settings className="h-4 w-4 mr-2" />
                                      Configure Branch
                                    </Button>
                                    <Button size="sm" variant="outline" className="bg-transparent">
                                      <Users className="h-4 w-4 mr-2" />
                                      Manage Staff
                                    </Button>
                                    {selectedBranch.status === "pending" && (
                                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                        Approve Branch
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button variant="outline" size="sm" className="bg-transparent">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
