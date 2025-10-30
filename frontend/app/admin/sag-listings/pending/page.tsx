"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Eye, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

const pendingListings = [
  {
    id: "SAG001",
    itemName: "Gold Necklace Set",
    submitter: "Ahmad Rahman",
    estimatedValue: "RM 8,500",
    submissionDate: "2024-01-15",
    category: "Gold Jewelry",
    weight: "45.2g",
    purity: "22K",
    status: "pending_review",
    priority: "medium",
    images: 4,
    documents: 2,
  },
  {
    id: "SAG002",
    itemName: "Diamond Engagement Ring",
    submitter: "Siti Nurhaliza",
    estimatedValue: "RM 15,000",
    submissionDate: "2024-01-14",
    category: "Diamond Jewelry",
    weight: "3.2g",
    purity: "18K Gold, 1.5ct Diamond",
    status: "pending_verification",
    priority: "high",
    images: 6,
    documents: 3,
  },
  {
    id: "SAG003",
    itemName: "Silver Bracelet Collection",
    submitter: "Raj Kumar",
    estimatedValue: "RM 2,200",
    submissionDate: "2024-01-13",
    category: "Silver Jewelry",
    weight: "125.8g",
    purity: "925 Sterling Silver",
    status: "pending_appraisal",
    priority: "low",
    images: 8,
    documents: 1,
  },
  {
    id: "SAG004",
    itemName: "Antique Gold Coins",
    submitter: "Fatimah Ali",
    estimatedValue: "RM 12,000",
    submissionDate: "2024-01-12",
    category: "Gold Coins",
    weight: "31.1g",
    purity: "24K",
    status: "pending_authentication",
    priority: "high",
    images: 10,
    documents: 4,
  },
]

export default function PendingSAGListingsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending_review":
        return "bg-blue-100 text-blue-800"
      case "pending_verification":
        return "bg-orange-100 text-orange-800"
      case "pending_appraisal":
        return "bg-purple-100 text-purple-800"
      case "pending_authentication":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-orange-100 text-orange-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending_review":
        return <Clock className="h-4 w-4" />
      case "pending_verification":
        return <AlertTriangle className="h-4 w-4" />
      case "pending_appraisal":
        return <Eye className="h-4 w-4" />
      case "pending_authentication":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const filteredListings = pendingListings.filter((listing) => {
    const matchesSearch =
      listing.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.submitter.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || listing.status === statusFilter
    const matchesPriority = priorityFilter === "all" || listing.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Clock className="h-6 w-6 text-orange-600" />
        <h1 className="text-2xl font-bold">Pending SAG Listings</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pending</p>
                <p className="text-2xl font-bold">47</p>
                <p className="text-xs text-orange-600">Awaiting review</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Priority</p>
                <p className="text-2xl font-bold text-red-600">12</p>
                <p className="text-xs text-red-600">Urgent attention</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Processing</p>
                <p className="text-2xl font-bold">2.3 days</p>
                <p className="text-xs text-green-600">↓ 0.5 days faster</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">RM 2.1M</p>
                <p className="text-xs text-blue-600">Pending approval</p>
              </div>
              <Eye className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search by item name, submitter, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending_review">Pending Review</SelectItem>
                <SelectItem value="pending_verification">Pending Verification</SelectItem>
                <SelectItem value="pending_appraisal">Pending Appraisal</SelectItem>
                <SelectItem value="pending_authentication">Pending Authentication</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Pending Listings */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Listings ({filteredListings.length})</CardTitle>
          <CardDescription>Items awaiting review and approval</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredListings.map((listing) => (
              <div key={listing.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{listing.itemName}</h3>
                      <Badge className={getStatusColor(listing.status)}>
                        {getStatusIcon(listing.status)}
                        {listing.status.replace("_", " ").toUpperCase()}
                      </Badge>
                      <Badge className={getPriorityColor(listing.priority)}>{listing.priority.toUpperCase()}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      ID: {listing.id} • Submitted by {listing.submitter}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{listing.estimatedValue}</p>
                    <p className="text-sm text-muted-foreground">{listing.submissionDate}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                  <div>
                    <p className="text-muted-foreground">Category</p>
                    <p className="font-medium">{listing.category}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Weight</p>
                    <p className="font-medium">{listing.weight}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Purity</p>
                    <p className="font-medium">{listing.purity}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Documents</p>
                    <p className="font-medium">
                      {listing.images} images, {listing.documents} docs
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Eye className="mr-1 h-3 w-3" />
                    Review Details
                  </Button>
                  <Button size="sm" variant="outline">
                    View Images
                  </Button>
                  <Button size="sm" variant="outline">
                    Contact Submitter
                  </Button>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Approve
                  </Button>
                  <Button size="sm" variant="destructive">
                    <XCircle className="mr-1 h-3 w-3" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
