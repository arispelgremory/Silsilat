"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiInstance from '@/lib/axios-v1'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, Search, Eye, CheckCircle, XCircle, AlertTriangle, Info, TrendingUp, TrendingDown, Activity, ExternalLinkIcon } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"

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

export default function RiskEvaluationPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(200)
  const [selectedRiskFilter, setSelectedRiskFilter] = useState("all")
  const [selectedSag, setSelectedSag] = useState<SAG | null>(null)
  const [actionNotes, setActionNotes] = useState("")
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<'approve' | 'monitor' | 'margin_call' | null>(null)
  const [modifiedLtv, setModifiedLtv] = useState<string>("")

  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['risk-evaluation-sags', currentPage, pageSize],
    queryFn: async (): Promise<SAGResponse> => {
      const response = await apiInstance.get(`/sag?ltv&risk_level&page_size=${pageSize}&page_number=${currentPage}&status=active`)
      return response.data
    },
  })

  const sags = data?.data || []
  const pagination = data?.pagination

  // Action mutation
  const actionMutation = useMutation({
    mutationFn: async ({ sagId, action, ltv }: { sagId: string, action: string, ltv: number }) => {
      const response = await apiInstance.post(`/sag/override-failure`, {
        sag_id: sagId,
        ltv: ltv,
        action: action
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risk-evaluation-sags'] })
      toast({
        title: "Action Completed",
        description: "Risk evaluation action has been recorded successfully.",
      })
      setIsActionDialogOpen(false)
      setSelectedSag(null)
      setActionNotes("")
      setActionType(null)
      setModifiedLtv("")
    },
    onError: (error: any) => {
      toast({
        title: "Action Failed",
        description: error?.response?.data?.message || "Failed to complete action. Please try again.",
        variant: "destructive",
      })
    }
  })

  const filteredListings = sags.filter((sag) => {
    const matchesRisk = selectedRiskFilter === "all" || 
      (sag.sagProperties.risk_level?.toUpperCase().replace('_', ' ').replace(' ', '_') === selectedRiskFilter.toUpperCase())
    
    const matchesSearch =
      sag.sagId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sag.sagName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sag.sagDescription.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesRisk && matchesSearch
  })

  const getRiskBadge = (sag: SAG) => {
    let risk = sag.sagProperties.risk_level
    
    if (!risk) {
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
    
    if (action === 'modify') {
      return {
        cardClass: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800',
        textClass: 'text-blue-600 dark:text-blue-400',
        icon: <Activity className="h-4 w-4 text-blue-600" />
      }
    }
    
    return {
      cardClass: 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800',
      textClass: 'text-red-600 dark:text-red-400',
      icon: <AlertTriangle className="h-4 w-4 text-red-600" />
    }
  }

  const handleActionClick = (sag: SAG) => {
    setSelectedSag(sag)
    // Pre-fill LTV with current value
    if (sag.sagProperties.ltv) {
      setModifiedLtv((sag.sagProperties.ltv * 100).toFixed(2))
    }
    // Reset action type to force user to select
    setActionType(null)
    setIsActionDialogOpen(true)
  }

  const submitAction = () => {
    if (!selectedSag || !actionType) return
    
    // Use modified LTV if provided, otherwise use current LTV
    const ltvValue = modifiedLtv ? parseFloat(modifiedLtv) / 100 : (selectedSag.sagProperties.ltv || 0)
    
    actionMutation.mutate({
      sagId: selectedSag.sagId,
      action: actionType,
      ltv: ltvValue
    })
  }

  // Calculate risk distribution
  const riskDistribution = sags.reduce((acc, sag) => {
    const risk = sag.sagProperties.risk_level?.toUpperCase() || 'UNKNOWN'
    acc[risk] = (acc[risk] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Calculate average LTV
  const avgLtv = sags.length > 0
    ? sags.reduce((sum, sag) => sum + (sag.sagProperties.ltv || 0), 0) / sags.length
    : 0

  // Count high risk items
  const highRiskCount = sags.filter(sag => {
    const risk = sag.sagProperties.risk_level?.toUpperCase()
    return risk === 'HIGH' || risk === 'VERY_HIGH' || risk === 'VERYHIGH' || risk === 'VERY HIGH'
  }).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            AI Risk Evaluation Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Review and manage SAG risk assessments with LTV analysis</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Evaluated</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{pagination?.totalCount || sags.length}</div>
            )}
            <p className="text-xs text-muted-foreground">SAGs with risk analysis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Average LTV</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">
                {(avgLtv * 100).toFixed(2)}%
              </div>
            )}
            <p className="text-xs text-muted-foreground">Loan-to-value ratio</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">High Risk Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <div className="text-2xl font-bold text-red-600">
                {highRiskCount}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Low Risk Items</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <div className="text-2xl font-bold text-green-600">
                {(riskDistribution['LOW'] || 0) + (riskDistribution['VERY_LOW'] || 0) + (riskDistribution['VERYLOW'] || 0)}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Safe investments</p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Evaluation Table */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Evaluation Queue</CardTitle>
          <CardDescription>Review SAGs with LTV and risk level analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="search">Search SAGs</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by SAG ID or name..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            {/* <div>
              <Label htmlFor="risk-filter">Risk Level Filter</Label>
              <Select value={selectedRiskFilter} onValueChange={setSelectedRiskFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="VERY_LOW">Very Low Risk</SelectItem>
                  <SelectItem value="LOW">Low Risk</SelectItem>
                  <SelectItem value="MEDIUM">Medium Risk</SelectItem>
                  <SelectItem value="HIGH">High Risk</SelectItem>
                  <SelectItem value="VERY_HIGH">Very High Risk</SelectItem>
                </SelectContent>
              </Select>
            </div> */}
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SAG Details</TableHead>
                  <TableHead>Asset Info</TableHead>
                  <TableHead>Valuation</TableHead>
                  <TableHead>LTV Ratio</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>AI Recommendation</TableHead>
                  <TableHead>Analysis</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={`loading-${i}`}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-32" /></TableCell>
                    </TableRow>
                  ))
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-red-600">
                      Failed to load risk evaluation data. Please try again.
                    </TableCell>
                  </TableRow>
                ) : filteredListings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No SAGs found for risk evaluation.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredListings.map((sag) => (
                    <TableRow key={sag.sagId}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">{sag.sagName}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{sag.sagId}</div>
                          {sag.tokenId && (
                            <a 
                              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                              href={`${process.env.NEXT_PUBLIC_ENV_URL}/${sag.tokenId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Token: {sag.tokenId.substring(0, 8)}...
                              <ExternalLinkIcon className="h-3 w-3" />
                            </a>
                          )}
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
                            Loan: {sag.sagProperties.currency} {(sag.sagProperties.loan || 0).toLocaleString()}
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
                              <div className={`text-lg font-bold ${
                                sag.sagProperties.ltv > 0.85 ? 'text-red-600' :
                                sag.sagProperties.ltv > 0.75 ? 'text-orange-600' :
                                sag.sagProperties.ltv > 0.65 ? 'text-yellow-600' :
                                'text-green-600'
                              }`}>
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
                      <TableCell>{getRiskBadge(sag)}</TableCell>
                      <TableCell>
                        {sag.sagProperties.action ? (
                          (() => {
                            const actionStyles = getActionCardStyles(sag.sagProperties.action)
                            return (
                              <div className="flex items-center gap-2">
                                {actionStyles.icon}
                                <span className="font-medium capitalize text-sm">
                                  {sag.sagProperties.action.split('_').join(' ')}
                                </span>
                              </div>
                            )
                          })()
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500 text-sm">No recommendation</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {sag.sagProperties.rationale ? (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" className="h-8">
                                <Info className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <Shield className="h-5 w-5 text-blue-600" />
                                  AI Risk Analysis
                                </DialogTitle>
                                <DialogDescription>
                                  Comprehensive risk assessment for {sag.sagName}
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
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700"
                          onClick={() => handleActionClick(sag)}
                        >
                          <Activity className="h-3 w-3 mr-1" />
                          Take Action
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Take Risk Evaluation Action
            </DialogTitle>
            <DialogDescription>
              {selectedSag && (
                <div className="space-y-2">
                  <div>SAG: <span className="font-semibold">{selectedSag.sagName}</span></div>
                  <div className="text-xs text-gray-500">ID: {selectedSag.sagId}</div>
                  {selectedSag.sagProperties.ltv && (
                    <div className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded mt-2">
                      Current LTV: <span className="font-bold">{(selectedSag.sagProperties.ltv * 100).toFixed(2)}%</span>
                    </div>
                  )}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Action Type Select */}
            <div>
              <Label htmlFor="action-type">
                Action Type <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={actionType || ''} 
                onValueChange={(value: 'approve' | 'monitor' | 'margin_call') => setActionType(value)}
              >
                <SelectTrigger id="action-type" className="mt-1">
                  <SelectValue placeholder="Select an action..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approve">✓ Approve</SelectItem>
                  <SelectItem value="monitor">👁 Monitor</SelectItem>
                  <SelectItem value="margin_call">✗ Margin Call</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Choose the action to take for this SAG
              </p>
            </div>

            {/* LTV Input */}
            <div>
              <Label htmlFor="ltv-value">
                LTV Value (%) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="ltv-value"
                type="number"
                step="0.01"
                min="0"
                max="100"
                placeholder="Enter LTV percentage (e.g., 75.00)"
                value={modifiedLtv}
                onChange={(e) => setModifiedLtv(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {actionType === 'margin_call' 
                  ? 'Enter the new LTV percentage value for this SAG'
                  : 'Specify the LTV value for this action'}
              </p>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="action-notes">Notes (Optional)</Label>
              <Textarea
                id="action-notes"
                placeholder="Add any additional notes or comments..."
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsActionDialogOpen(false)
                setSelectedSag(null)
                setActionNotes("")
                setActionType(null)
                setModifiedLtv("")
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={submitAction}
              disabled={actionMutation.isPending || !actionType || !modifiedLtv}
              className={
                actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                actionType === 'monitor' ? 'bg-yellow-600 hover:bg-yellow-700' :
                actionType === 'margin_call' ? 'bg-red-600 hover:bg-red-700' :
                'bg-blue-600 hover:bg-blue-700'
              }
            >
              {actionMutation.isPending ? 'Processing...' : 'Submit Action'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}