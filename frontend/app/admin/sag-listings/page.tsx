"use client"

import { useState } from "react"
import { useQuery } from '@tanstack/react-query'
import apiInstance from '@/lib/axios-v1'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Search, Eye, CheckCircle, XCircle, Clock, DollarSign, TrendingUp, ExternalLinkIcon, Plus, AlertTriangle, Info } from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

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
  ltv?: number
  risk_level?: string
  rationale?: string
  purity?: number
  action?: string
  soldShare?: number
  eval_id?: string
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


export default function SagListingsPage() {
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(200)

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-sags', currentPage, pageSize, "active"],
    queryFn: async (): Promise<SAGResponse> => {
      const response = await apiInstance.get(`/sag?page_size=${pageSize}&page_number=${currentPage}&status=active`)
      return response.data
    },
  })

  const sags = data?.data || []
  const pagination = data?.pagination

  const filteredListings = sags.filter((sag) => {
    const matchesStatus = selectedStatus === "all" || 
      (selectedStatus === "active" && (sag.status === "active" || !sag.status)) ||
      (selectedStatus === "closed" && sag.status === "closed") ||
      (selectedStatus === "pending" && !sag.tokenId) // Consider SAGs without tokenId as pending
    const matchesSearch =
      sag.sagId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sag.sagName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sag.sagDescription.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const getStatusBadge = (sag: SAG) => {
    if (!sag.tokenId) {
      return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">Pending Approval</Badge>
    }
    
    const status = sag.status || "active"
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">Active</Badge>
      case "closed":
        return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">Closed</Badge>
      default:
        return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">Active</Badge>
    }
  }

  const getRiskBadge = (sag: SAG) => {
    // Use risk_level from AI evaluation if available, otherwise calculate from LTV percentage
    let risk = sag.sagProperties.risk_level
    
    if (!risk) {
      // Calculate risk from LTV if available, otherwise use loan percentage
      const percentage = sag.sagProperties.ltv 
        ? sag.sagProperties.ltv * 100 
        : (sag.sagProperties.loanPercentage || 0)
      
      if (percentage < 60) risk = "VERY_LOW"
      else if (percentage < 70) risk = "LOW"
      else if (percentage < 80) risk = "MEDIUM"
      else if (percentage <= 85) risk = "HIGH"
      else risk = "VERY_HIGH"
    }
    
    switch (risk.toUpperCase()) {
      case "VERY_LOW":
      case "VERYLOW":
      case "VERY LOW":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700">
            Very Low Risk
          </Badge>
        )
      case "LOW":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700">
            Low Risk
          </Badge>
        )
      case "MEDIUM":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700">
            Medium Risk
          </Badge>
        )
      case "HIGH":
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-700">
            High Risk
          </Badge>
        )
      case "VERY_HIGH":
      case "VERYHIGH":
      case "VERY HIGH":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700">
            Very High Risk
          </Badge>
        )
      default:
        return <Badge variant="outline">{risk}</Badge>
    }
  }

  const getActionCardStyles = (action: string) => {
    if (action === 'approve') {
      return {
        cardClass: 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800',
        textClass: 'text-green-600 dark:text-green-400',
        icon: <CheckCircle className="h-4 w-4 text-green-600" />
      }
    }
    
    if (action === 'monitor') {
      return {
        cardClass: 'bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200 dark:border-yellow-800',
        textClass: 'text-yellow-600 dark:text-yellow-400',
        icon: <Eye className="h-4 w-4 text-yellow-600" />
      }
    }
    
    // margin_call or default
    return {
      cardClass: 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800',
      textClass: 'text-red-600 dark:text-red-400',
      icon: <AlertTriangle className="h-4 w-4 text-red-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-6 w-6 text-emerald-600" />
            SAG Listings Management
          </h1>
          <p className="text-gray-600">Manage Surat Akuan Gadaian listings and tokenization</p>
        </div>
        <div>
          <Button asChild variant="outline">
            <Link href="/apply">
              <Plus className="h-4 w-4 mr-2" />
              New SAG Listing
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Listings</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{pagination?.totalCount || sags.length}</div>
            )}
            <p className="text-xs text-muted-foreground">Total SAG listings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">
                RM {sags.reduce((total, sag) => total + sag.sagProperties.valuation, 0).toLocaleString()}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Combined asset value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Listings</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <div className="text-2xl font-bold text-green-600">
                {sags.filter(sag => sag.status === 'active' || !sag.status).length}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <div className="text-2xl font-bold text-yellow-600">
                {sags.filter(sag => !sag.tokenId).length}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Awaiting tokenization</p>
          </CardContent>
        </Card>
      </div>

      {/* Listings Table */}
      <Card>
        <CardHeader>
          <CardTitle>SAG Listings</CardTitle>
          <CardDescription>Review and manage gold-backed token listings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="search">Search Listings</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by SAG ID or branch name..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status-filter">Status Filter</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="defaulted">Defaulted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SAG Details</TableHead>
                  <TableHead>Asset Info</TableHead>
                  <TableHead>Valuation</TableHead>
                  <TableHead>Investment</TableHead>
                  <TableHead>LTV</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Token ID</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>AI Analysis</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Loading skeleton rows
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={`loading-${i}`}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                    </TableRow>
                  ))
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-red-600">
                      Failed to load SAG listings. Please try again.
                    </TableCell>
                  </TableRow>
                ) : filteredListings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                      No SAG listings found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredListings.map((sag) => (
                    <TableRow key={sag.sagId}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">{sag.sagName}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{sag.sagId}</div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">{sag.sagDescription}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">{sag.sagProperties.assetType}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{sag.sagProperties.weightG}g</div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">{sag.sagProperties.karat}K Gold</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {sag.sagProperties.currency} {sag.sagProperties.valuation.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Loan: {sag.sagProperties.currency} {(sag.sagProperties.valuation * (sag.sagProperties.loanPercentage ?? 0) / 100).toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            {sag.sagProperties.loanPercentage}% of value
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {sag.sagProperties.mintShare.toLocaleString()} shares
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {sag.sagProperties.investorRoiPercentage}% ROI
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            {sag.sagProperties.tenorM} months
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          {sag.sagProperties.ltv ? (
                            <>
                              <div className="font-medium text-gray-900 dark:text-gray-100">
                                {(sag.sagProperties.ltv * 100).toFixed(2)}%
                              </div>
                              <div className="text-xs text-gray-400 dark:text-gray-500">
                                Loan-to-Value
                              </div>
                            </>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500 text-sm">N/A</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(sag)}</TableCell>
                      <TableCell>
                        {sag.tokenId ? (
                          <a 
                            className="text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium flex items-center gap-1"
                            href={`${process.env.NEXT_PUBLIC_ENV_URL}/${sag.tokenId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {sag.tokenId.substring(0, 8)}...
                            <ExternalLinkIcon className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500 text-sm">Not tokenized</span>
                        )}
                      </TableCell>
                      <TableCell>{getRiskBadge(sag)}</TableCell>
                      <TableCell>
                        {sag.sagProperties.rationale ? (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" className="h-8">
                                <Info className="h-3 w-3 mr-1" />
                                Analysis
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                  AI Risk Analysis
                                </DialogTitle>
                                <DialogDescription>
                                  AI-powered risk assessment for {sag.sagName}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                {/* Key Metrics */}
                                <div className="grid grid-cols-3 gap-4">
                                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Risk Level</div>
                                    <div className="flex items-center gap-2">
                                      {getRiskBadge(sag)}
                                    </div>
                                  </div>
                                  
                                  {sag.sagProperties.action && (() => {
                                    const actionStyles = getActionCardStyles(sag.sagProperties.action)
                                    return (
                                      <div className={`p-4 rounded-lg border ${actionStyles.cardClass}`}>
                                        <div className={`text-xs font-medium mb-1 ${actionStyles.textClass}`}>
                                          Recommended Action
                                        </div>
                                        <div className="flex items-center gap-2">
                                          {actionStyles.icon}
                                          <span className="font-bold capitalize">
                                            {sag.sagProperties.action.split('_').join(' ')}
                                          </span>
                                        </div>
                                      </div>
                                    )
                                  })()}
                                  
                                  {sag.sagProperties.ltv && (
                                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                                      <div className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">LTV Ratio</div>
                                      <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                                        {(sag.sagProperties.ltv * 100).toFixed(2)}%
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Asset Details */}
                                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg space-y-2">
                                  <h4 className="text-sm font-semibold mb-3">Asset Details</h4>
                                  <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600 dark:text-gray-400">Asset Type:</span>
                                      <span className="font-medium">{sag.sagProperties.assetType}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600 dark:text-gray-400">Weight:</span>
                                      <span className="font-medium">{sag.sagProperties.weightG}g</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600 dark:text-gray-400">Karat:</span>
                                      <span className="font-medium">{sag.sagProperties.karat}K</span>
                                    </div>
                                    {sag.sagProperties.purity && (
                                      <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Purity:</span>
                                        <span className="font-medium">{sag.sagProperties.purity}</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between">
                                      <span className="text-gray-600 dark:text-gray-400">Valuation:</span>
                                      <span className="font-medium">{sag.sagProperties.currency} {sag.sagProperties.valuation.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600 dark:text-gray-400">Loan Amount:</span>
                                      <span className="font-medium">{sag.sagProperties.currency} {(sag.sagProperties.loan || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600 dark:text-gray-400">Tenor:</span>
                                      <span className="font-medium">{sag.sagProperties.tenorM} months</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600 dark:text-gray-400">Loan %:</span>
                                      <span className="font-medium">{sag.sagProperties.loanPercentage}%</span>
                                    </div>
                                  </div>
                                </div>

                                {/* AI Rationale */}
                                <div>
                                  <h4 className="text-sm font-semibold mb-2">AI Analysis Rationale</h4>
                                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg text-sm whitespace-pre-wrap border border-blue-200 dark:border-blue-800">
                                    {sag.sagProperties.rationale}
                                  </div>
                                </div>

                                {/* Evaluation ID */}
                                {sag.sagProperties.eval_id && (
                                  <div className="flex items-center justify-between pt-2 border-t">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      Evaluation ID: <code className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">{sag.sagProperties.eval_id}</code>
                                    </span>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500 text-sm">No analysis</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <a href={sag.tokenId ? `${process.env.NEXT_PUBLIC_ENV_URL}/${sag.tokenId}` : '#'} target="_blank" rel="noopener noreferrer">
                              <ExternalLinkIcon className="h-3 w-3 mr-1" />
                              View
                            </a>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
