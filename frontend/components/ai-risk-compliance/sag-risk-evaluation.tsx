"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { TrendingDown, AlertTriangle, Clock, Target, BarChart3, Search, Filter, Eye, Brain } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

interface SagRiskData {
  id: string
  sagId: string
  branchName: string
  raiseAmount: number
  collateralValue: number
  raisePercentage: number
  goldWeight: string
  goldKarat: string
  duration: string
  subscriptionRate: number
  riskScore: number
  riskLevel: "low" | "moderate" | "high"
  delayHistory: number
  extensionCount: number
  lastUpdated: string
  aiFlags: string[]
  predictedDefault: number
}

export function SagRiskEvaluation() {
  const { t } = useLanguage()
  const [sagRisks, setSagRisks] = useState<SagRiskData[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [riskFilter, setRiskFilter] = useState("all")
  const [selectedSag, setSelectedSag] = useState<SagRiskData | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    // Mock SAG risk data
    const mockData: SagRiskData[] = [
      {
        id: "RISK-001",
        sagId: "SAG-10293",
        branchName: "KL Central Branch",
        raiseAmount: 15000,
        collateralValue: 18750,
        raisePercentage: 80,
        goldWeight: "50g",
        goldKarat: "22K",
        duration: "6 months",
        subscriptionRate: 78,
        riskScore: 25,
        riskLevel: "low",
        delayHistory: 0,
        extensionCount: 0,
        lastUpdated: "2024-01-15 10:30:00",
        aiFlags: [],
        predictedDefault: 12,
      },
      {
        id: "RISK-002",
        sagId: "SAG-10294",
        branchName: "Johor Bahru Branch",
        raiseAmount: 25000,
        collateralValue: 28000,
        raisePercentage: 89,
        goldWeight: "75g",
        goldKarat: "24K",
        duration: "12 months",
        subscriptionRate: 45,
        riskScore: 75,
        riskLevel: "high",
        delayHistory: 2,
        extensionCount: 1,
        lastUpdated: "2024-01-16 14:20:00",
        aiFlags: ["High raise percentage", "Low subscription rate", "Branch delay history"],
        predictedDefault: 67,
      },
      {
        id: "RISK-003",
        sagId: "SAG-10295",
        branchName: "Penang Branch",
        raiseAmount: 8500,
        collateralValue: 12000,
        raisePercentage: 71,
        goldWeight: "30g",
        goldKarat: "18K",
        duration: "3 months",
        subscriptionRate: 92,
        riskScore: 45,
        riskLevel: "moderate",
        delayHistory: 1,
        extensionCount: 0,
        lastUpdated: "2024-01-17 09:15:00",
        aiFlags: ["Lower karat gold", "Previous delay"],
        predictedDefault: 34,
      },
    ]
    setSagRisks(mockData)
  }, [])

  const filteredSags = sagRisks.filter((sag) => {
    const matchesSearch =
      sag.sagId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sag.branchName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRisk = riskFilter === "all" || sag.riskLevel === riskFilter
    return matchesSearch && matchesRisk
  })

  const getRiskBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case "low":
        return <Badge className="bg-green-100 text-green-800">{t("sag.lowRisk")}</Badge>
      case "moderate":
        return <Badge className="bg-yellow-100 text-yellow-800">{t("sag.moderateRisk")}</Badge>
      case "high":
        return <Badge className="bg-red-100 text-red-800">{t("sag.highRisk")}</Badge>
      default:
        return <Badge variant="outline">{riskLevel}</Badge>
    }
  }

  const handleReanalyze = async (sagId: string) => {
    setIsAnalyzing(true)
    // Simulate AI reanalysis
    await new Promise((resolve) => setTimeout(resolve, 3000))

    setSagRisks((prev) =>
      prev.map((sag) =>
        sag.id === sagId
          ? {
              ...sag,
              lastUpdated: new Date().toISOString().replace("T", " ").substring(0, 19),
              riskScore: Math.max(sag.riskScore - Math.random() * 15, 0),
              predictedDefault: Math.max(sag.predictedDefault - Math.random() * 10, 0),
            }
          : sag,
      ),
    )
    setIsAnalyzing(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Target className="h-6 w-6 text-orange-600" />
            {t("ai.sagRisk")}
          </h2>
          <p className="text-gray-600">AI-powered SAG listing risk evaluation and monitoring</p>
        </div>
        <Button className="bg-orange-600 hover:bg-orange-700">
          <BarChart3 className="h-4 w-4 mr-2" />
          Risk Report
        </Button>
      </div>

      {/* Risk Evaluation Capabilities */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              {t("sag.raiseRatio")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">85%</div>
            <div className="text-xs text-gray-500">Avg Raise vs Collateral</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {t("sag.patternDelay")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">23</div>
            <div className="text-xs text-gray-500">Delayed SAGs</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              {t("sag.underSubscription")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">8</div>
            <div className="text-xs text-gray-500">Low Interest SAGs</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {t("sag.repeatedExtensions")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">5</div>
            <div className="text-xs text-gray-500">Multiple Extensions</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Brain className="h-4 w-4" />
              {t("sag.realTimeScore")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">92%</div>
            <div className="text-xs text-gray-500">AI Accuracy</div>
          </CardContent>
        </Card>
      </div>

      {/* SAG Risk Analysis Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("sag.riskEvaluation")}</CardTitle>
          <CardDescription>Real-time AI analysis of SAG listing risks and default predictions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by SAG ID or branch..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by risk level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="low">{t("sag.lowRisk")}</SelectItem>
                <SelectItem value="moderate">{t("sag.moderateRisk")}</SelectItem>
                <SelectItem value="high">{t("sag.highRisk")}</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SAG ID</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Raise %</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>{t("sag.riskLevel")}</TableHead>
                  <TableHead>Default Risk</TableHead>
                  <TableHead>Extensions</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSags.map((sag) => (
                  <TableRow key={sag.id}>
                    <TableCell className="font-medium">{sag.sagId}</TableCell>
                    <TableCell>{sag.branchName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={sag.raisePercentage} className="w-16" />
                        <span className="text-sm">{sag.raisePercentage}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={sag.subscriptionRate} className="w-16" />
                        <span className="text-sm">{sag.subscriptionRate}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{getRiskBadge(sag.riskLevel)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={sag.predictedDefault} className="w-16" />
                        <span className="text-sm">{sag.predictedDefault}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={sag.extensionCount > 0 ? "destructive" : "outline"}>{sag.extensionCount}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{sag.lastUpdated}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedSag(sag)}
                              className="bg-transparent"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>SAG Risk Analysis - {selectedSag?.sagId}</DialogTitle>
                              <DialogDescription>
                                Comprehensive AI risk evaluation and predictive analysis
                              </DialogDescription>
                            </DialogHeader>
                            {selectedSag && (
                              <div className="space-y-6">
                                {/* Risk Overview */}
                                <div className="grid gap-4 md:grid-cols-3">
                                  <Card>
                                    <CardHeader className="pb-2">
                                      <CardTitle className="text-sm">Risk Score</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="text-2xl font-bold">{selectedSag.riskScore}</div>
                                      <Progress value={selectedSag.riskScore} className="mt-2" />
                                    </CardContent>
                                  </Card>
                                  <Card>
                                    <CardHeader className="pb-2">
                                      <CardTitle className="text-sm">Default Probability</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="text-2xl font-bold text-red-600">
                                        {selectedSag.predictedDefault}%
                                      </div>
                                      <Progress value={selectedSag.predictedDefault} className="mt-2" />
                                    </CardContent>
                                  </Card>
                                  <Card>
                                    <CardHeader className="pb-2">
                                      <CardTitle className="text-sm">Subscription Rate</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="text-2xl font-bold text-blue-600">
                                        {selectedSag.subscriptionRate}%
                                      </div>
                                      <Progress value={selectedSag.subscriptionRate} className="mt-2" />
                                    </CardContent>
                                  </Card>
                                </div>

                                {/* SAG Details */}
                                <div className="grid gap-4 md:grid-cols-2">
                                  <div>
                                    <label className="text-sm font-medium">Raise Amount</label>
                                    <p className="text-sm text-gray-600">
                                      RM {selectedSag.raiseAmount.toLocaleString()}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Collateral Value</label>
                                    <p className="text-sm text-gray-600">
                                      RM {selectedSag.collateralValue.toLocaleString()}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Gold Details</label>
                                    <p className="text-sm text-gray-600">
                                      {selectedSag.goldWeight} • {selectedSag.goldKarat}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Duration</label>
                                    <p className="text-sm text-gray-600">{selectedSag.duration}</p>
                                  </div>
                                </div>

                                {/* AI Flags */}
                                {selectedSag.aiFlags.length > 0 && (
                                  <div>
                                    <label className="text-sm font-medium">AI Risk Flags</label>
                                    <div className="space-y-2 mt-2">
                                      {selectedSag.aiFlags.map((flag, index) => (
                                        <div key={index} className="flex items-center gap-2 p-2 bg-red-50 rounded">
                                          <AlertTriangle className="h-4 w-4 text-red-500" />
                                          <span className="text-sm text-red-700">{flag}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleReanalyze(selectedSag.id)}
                                    disabled={isAnalyzing}
                                    className="bg-orange-600 hover:bg-orange-700"
                                  >
                                    {isAnalyzing ? "Reanalyzing..." : "AI Reanalyze"}
                                  </Button>
                                  <Button variant="outline">Manual Review</Button>
                                  <Button variant="outline">Flag for Compliance</Button>
                                  {selectedSag.riskLevel === "high" && (
                                    <Button variant="destructive">Block Listing</Button>
                                  )}
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReanalyze(sag.id)}
                          disabled={isAnalyzing}
                        >
                          <Brain className="h-4 w-4" />
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
