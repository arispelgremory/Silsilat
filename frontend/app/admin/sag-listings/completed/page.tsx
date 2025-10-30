"use client"

import { useState } from "react"
import { useQuery } from '@tanstack/react-query'
import apiInstance from '@/lib/axios-v1'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, XCircle, Eye, Download, Calendar, ExternalLinkIcon } from "lucide-react"

interface SAGProperties {
  loan?: number
  karat: number
  tenorM: number
  weightG: number
  currency: string
  assetType: string
  mintShare: number
  valuation: number
  enableMinting: boolean
  loanPercentage?: number
  pawnerInterestP?: number
  investorFinancingType: string
  investorRoiPercentage: number
  investorRoiFixedAmount?: number
}

interface SAG {
  sagId: string
  tokenId: string
  sagName: string
  sagDescription: string
  sagProperties: SAGProperties
  sagType: string
  certNo: string
  status?: 'active' | 'closed'
  createdAt?: string
  updatedAt?: string
}

interface SAGResponse {
  success: boolean
  message: string
  data: SAG[]
  pagination: {
    count: number
    totalCount: number
    currentPage: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}


export default function CompletedSAGListingsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(100)

  const { data, isLoading, error } = useQuery({
    queryKey: ['completed-sags', currentPage, pageSize],
    queryFn: async (): Promise<SAGResponse> => {
      const response = await apiInstance.get(`/sag?page_size=${pageSize}&page_number=${currentPage}&status=closed`)
      return response.data
    },
  })

  const sags = data?.data || []
  const pagination = data?.pagination

  const getStatusColor = (sag: SAG) => {
    // For closed SAGs, we consider them "completed" - they could be approved (with tokenId) or rejected (without tokenId)
    if (sag.tokenId) {
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
    } else {
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
    }
  }

  const getStatusIcon = (sag: SAG) => {
    if (sag.tokenId) {
      return <CheckCircle className="h-4 w-4" />
    } else {
      return <XCircle className="h-4 w-4" />
    }
  }

  const getStatusText = (sag: SAG) => {
    return sag.tokenId ? "COMPLETED" : "REJECTED"
  }

  const filteredListings = sags.filter((sag) => {
    const matchesSearch =
      sag.sagName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sag.sagDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sag.sagId.toLowerCase().includes(searchTerm.toLowerCase())
    
    const sagStatus = sag.tokenId ? "approved" : "rejected"
    const matchesStatus = statusFilter === "all" || sagStatus === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const approvedListings = sags.filter((sag) => sag.tokenId) // Has tokenId means approved/completed
  const rejectedListings = sags.filter((sag) => !sag.tokenId) // No tokenId means rejected
  const totalApprovedValue = approvedListings.reduce(
    (sum, sag) => sum + sag.sagProperties.valuation,
    0,
  )
  const totalLoanAmount = approvedListings.reduce(
    (sum, sag) => sum + (sag.sagProperties.valuation * (sag.sagProperties.loanPercentage ?? 0) / 100),
    0,
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <CheckCircle className="h-6 w-6 text-green-600" />
        <h1 className="text-2xl font-bold">Completed SAG Listings</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Completed</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-bold">{pagination?.totalCount || sags.length}</p>
                )}
                <p className="text-xs text-blue-600">Closed SAGs</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-bold text-green-600">{approvedListings.length}</p>
                )}
                {!isLoading && sags.length > 0 && (
                  <p className="text-xs text-green-600">
                    {Math.round((approvedListings.length / sags.length) * 100)}% approval rate
                  </p>
                )}
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
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <p className="text-2xl font-bold">RM {totalApprovedValue.toLocaleString()}</p>
                )}
                <p className="text-xs text-green-600">Approved items</p>
              </div>
              <Eye className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Loans Issued</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <p className="text-2xl font-bold">RM {totalLoanAmount.toLocaleString()}</p>
                )}
                <p className="text-xs text-blue-600">Based on loan percentage</p>
              </div>
              <Download className="h-8 w-8 text-blue-500" />
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
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Completed Listings */}
      <Card>
        <CardHeader>
          <CardTitle>Completed Listings ({filteredListings.length})</CardTitle>
          <CardDescription>Processed and finalized SAG listings</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={`loading-${i}`} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <Skeleton className="h-6 w-48 mb-2" />
                      <Skeleton className="h-4 w-64 mb-1" />
                      <Skeleton className="h-4 w-56" />
                    </div>
                    <div className="text-right">
                      <Skeleton className="h-6 w-24 mb-1" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              Failed to load completed SAG listings. Please try again.
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No completed SAG listings found.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredListings.map((sag) => (
                <div key={sag.sagId} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">{sag.sagName}</h3>
                        <Badge className={getStatusColor(sag)}>
                          {getStatusIcon(sag)}
                          {getStatusText(sag)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground dark:text-gray-400">
                        ID: {sag.sagId} • {sag.sagDescription}
                      </p>
                      <p className="text-sm text-muted-foreground dark:text-gray-400">
                        Certificate: {sag.certNo} • Type: {sag.sagType}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-gray-900 dark:text-gray-100">
                        {sag.sagProperties.currency} {sag.sagProperties.valuation.toLocaleString()}
                      </p>
                      {sag.createdAt && (
                        <p className="text-sm text-muted-foreground dark:text-gray-400">
                          Created: {new Date(sag.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                    <div>
                      <p className="text-muted-foreground dark:text-gray-400">Asset Type</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{sag.sagProperties.assetType}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground dark:text-gray-400">Weight</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{sag.sagProperties.weightG}g</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground dark:text-gray-400">Karat</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{sag.sagProperties.karat}K Gold</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground dark:text-gray-400">
                        {sag.tokenId ? "Loan Amount" : "Status"}
                      </p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {sag.tokenId 
                          ? `${sag.sagProperties.currency} ${(sag.sagProperties.valuation * (sag.sagProperties.loanPercentage ?? 0) / 100).toLocaleString()}`
                          : "Not Approved"
                        }
                      </p>
                    </div>
                  </div>

                  {sag.tokenId && (
                    <div className="mb-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-400">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            <strong>Token ID:</strong> {sag.tokenId}
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-400">
                            Total Available: {sag.sagProperties.mintShare.toLocaleString()} shares at {sag.sagProperties.investorRoiPercentage}% monthly ROI
                          </p>
                        </div>
                        <a 
                          className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 text-sm font-medium"
                          href={`${process.env.NEXT_PUBLIC_ENV_URL}/${sag.tokenId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Token <ExternalLinkIcon className="h-3 w-3" />
                        </a>
                      </div>
                      
                      {/* ROI Per Share Details */}
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-600">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                          <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded text-xs">
                            ROI Details
                          </span>
                          Per Share Breakdown
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Share Price */}
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border dark:border-blue-700">
                            <div className="text-center">
                              <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">Share Price</p>
                              <p className="text-lg font-bold text-blue-800 dark:text-blue-200">
                                {sag.sagProperties.currency} {(sag.sagProperties.valuation / sag.sagProperties.mintShare).toFixed(2)}
                              </p>
                              <p className="text-xs text-blue-600 dark:text-blue-400">
                                {sag.sagProperties.currency} {sag.sagProperties.valuation.toLocaleString()} ÷ {sag.sagProperties.mintShare.toLocaleString()}
                              </p>
                            </div>
                          </div>

                          {/* Monthly ROI per Share */}
                          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border dark:border-green-700">
                            <div className="text-center">
                              <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">Monthly ROI per Share</p>
                              <p className="text-lg font-bold text-green-800 dark:text-green-200">
                                {sag.sagProperties.currency} {((sag.sagProperties.valuation / sag.sagProperties.mintShare) * (sag.sagProperties.investorRoiPercentage / 100)).toFixed(2)}
                              </p>
                              <p className="text-xs text-green-600 dark:text-green-400">
                                {sag.sagProperties.investorRoiPercentage}% of share price
                              </p>
                            </div>
                          </div>

                          {/* Total ROI per Share */}
                          <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border dark:border-purple-700">
                            <div className="text-center">
                              <p className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">Total ROI per Share</p>
                              <p className="text-lg font-bold text-purple-800 dark:text-purple-200">
                                {sag.sagProperties.currency} {(((sag.sagProperties.valuation / sag.sagProperties.mintShare) * (sag.sagProperties.investorRoiPercentage / 100)) * sag.sagProperties.tenorM).toFixed(2)}
                              </p>
                              <p className="text-xs text-purple-600 dark:text-purple-400">
                                Over {sag.sagProperties.tenorM} months
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* ROI Calculation Breakdown */}
                        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Investment Returns Calculation:</h5>
                          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                            <div className="flex justify-between">
                              <span>Initial Investment (per share):</span>
                              <span className="font-medium">{sag.sagProperties.currency} {(sag.sagProperties.valuation / sag.sagProperties.mintShare).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Monthly Return (per share):</span>
                              <span className="font-medium text-green-600 dark:text-green-400">
                                +{sag.sagProperties.currency} {((sag.sagProperties.valuation / sag.sagProperties.mintShare) * (sag.sagProperties.investorRoiPercentage / 100)).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between border-t dark:border-gray-600 pt-1">
                              <span className="font-medium">Total Return (per share):</span>
                              <span className="font-bold text-purple-600 dark:text-purple-400">
                                {sag.sagProperties.currency} {(
                                  (sag.sagProperties.valuation / sag.sagProperties.mintShare) + 
                                  (((sag.sagProperties.valuation / sag.sagProperties.mintShare) * (sag.sagProperties.investorRoiPercentage / 100)) * sag.sagProperties.tenorM)
                                ).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Profit per Share:</span>
                              <span className="font-bold text-green-600 dark:text-green-400">
                                {sag.sagProperties.currency} {(((sag.sagProperties.valuation / sag.sagProperties.mintShare) * (sag.sagProperties.investorRoiPercentage / 100)) * sag.sagProperties.tenorM).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* ROI Percentage Summary */}
                        <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border dark:border-gray-600">
                          <div className="text-center">
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Total Return Rate</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                              {(sag.sagProperties.investorRoiPercentage * sag.sagProperties.tenorM).toFixed(1)}%
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {sag.sagProperties.investorRoiPercentage}% × {sag.sagProperties.tenorM} months
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {!sag.tokenId && (
                    <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 rounded border-l-4 border-red-400">
                      <p className="text-sm text-red-700 dark:text-red-300">
                        <strong>Status:</strong> This SAG was closed without tokenization
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="mr-1 h-3 w-3" />
                      View Details
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="mr-1 h-3 w-3" />
                      Download Report
                    </Button>
                    {sag.tokenId && (
                      <Button size="sm" variant="outline">
                        View Token
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <Calendar className="mr-1 h-3 w-3" />
                      Timeline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

