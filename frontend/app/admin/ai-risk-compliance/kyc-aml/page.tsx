"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Shield,
  Eye,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Upload,
  Scan,
  UserCheck,
  AlertCircle,
} from "lucide-react"

// Mock data for KYC/AML
const kycStats = {
  totalProcessed: 2847,
  approved: 2654,
  rejected: 127,
  pending: 66,
  accuracy: 98.5,
}

const amlStats = {
  totalScreened: 3421,
  matches: 23,
  falsePositives: 8,
  investigations: 15,
  cleared: 8,
}

const recentKycResults = [
  {
    id: "KYC-2024-0847",
    name: "Ahmad Rahman",
    status: "approved",
    confidence: 97.8,
    timestamp: "2 minutes ago",
    documents: ["IC", "Passport", "Selfie"],
  },
  {
    id: "KYC-2024-0848",
    name: "Siti Nurhaliza",
    status: "flagged",
    confidence: 45.2,
    timestamp: "5 minutes ago",
    documents: ["IC", "Selfie"],
    issue: "Document quality low",
  },
  {
    id: "KYC-2024-0849",
    name: "Raj Kumar",
    status: "approved",
    confidence: 99.1,
    timestamp: "8 minutes ago",
    documents: ["IC", "Passport", "Selfie"],
  },
]

const amlMatches = [
  {
    id: "AML-2024-0234",
    name: "John Smith",
    matchType: "PEP",
    confidence: 89.3,
    status: "investigating",
    source: "OFAC",
    timestamp: "1 hour ago",
  },
  {
    id: "AML-2024-0235",
    name: "Maria Santos",
    matchType: "Sanctions",
    confidence: 76.8,
    status: "cleared",
    source: "UN Sanctions",
    timestamp: "3 hours ago",
  },
]

export default function KycAmlPage() {
  const [selectedTab, setSelectedTab] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-6 w-6 text-emerald-600" />
            KYC & AML Intelligence
          </h1>
          <p className="text-gray-600">AI-powered document verification, liveness detection, and AML screening</p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Upload className="h-4 w-4 mr-2" />
            Batch Upload
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="kyc">KYC Processing</TabsTrigger>
          <TabsTrigger value="aml">AML Screening</TabsTrigger>
          <TabsTrigger value="monitoring">Live Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* KYC & AML Stats */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-emerald-600" />
                  KYC Processing Stats
                </CardTitle>
                <CardDescription>AI-powered document verification performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">{kycStats.totalProcessed}</div>
                    <div className="text-sm text-gray-500">Total Processed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{kycStats.approved}</div>
                    <div className="text-sm text-gray-500">Approved</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{kycStats.rejected}</div>
                    <div className="text-sm text-gray-500">Rejected</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{kycStats.pending}</div>
                    <div className="text-sm text-gray-500">Pending</div>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">AI Accuracy</span>
                    <span className="text-sm font-bold">{kycStats.accuracy}%</span>
                  </div>
                  <Progress value={kycStats.accuracy} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-blue-600" />
                  AML Screening Stats
                </CardTitle>
                <CardDescription>Anti-money laundering detection performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{amlStats.totalScreened}</div>
                    <div className="text-sm text-gray-500">Total Screened</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{amlStats.matches}</div>
                    <div className="text-sm text-gray-500">Matches Found</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{amlStats.investigations}</div>
                    <div className="text-sm text-gray-500">Under Investigation</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{amlStats.cleared}</div>
                    <div className="text-sm text-gray-500">Cleared</div>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Detection Rate</span>
                    <span className="text-sm font-bold">94.2%</span>
                  </div>
                  <Progress value={94.2} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent KYC Results</CardTitle>
                <CardDescription>Latest AI-processed KYC verifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentKycResults.map((result) => (
                  <div key={result.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {result.status === "approved" ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : result.status === "flagged" ? (
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-gray-600" />
                      )}
                      <div>
                        <div className="font-medium">{result.name}</div>
                        <div className="text-sm text-gray-500">{result.id}</div>
                        {result.issue && <div className="text-xs text-red-600">{result.issue}</div>}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={result.status === "approved" ? "default" : "secondary"}
                        className={
                          result.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : result.status === "flagged"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                        }
                      >
                        {result.confidence}% confidence
                      </Badge>
                      <div className="text-xs text-gray-500 mt-1">{result.timestamp}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AML Matches</CardTitle>
                <CardDescription>Watchlist matches requiring investigation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {amlMatches.map((match) => (
                  <div key={match.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {match.status === "investigating" ? (
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      ) : (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                      <div>
                        <div className="font-medium">{match.name}</div>
                        <div className="text-sm text-gray-500">{match.id}</div>
                        <div className="text-xs text-blue-600">{match.source}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={match.matchType === "PEP" ? "destructive" : "secondary"}
                        className={
                          match.matchType === "PEP" ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"
                        }
                      >
                        {match.matchType}
                      </Badge>
                      <div className="text-xs text-gray-500 mt-1">{match.timestamp}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="kyc" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>KYC Document Processing</CardTitle>
              <CardDescription>AI-powered OCR and document intelligence</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertTitle>AI Capabilities</AlertTitle>
                <AlertDescription>
                  Our AI system can extract and validate fields from Malaysian IC, passports, and perform liveness
                  detection with 98.5% accuracy.
                </AlertDescription>
              </Alert>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="font-semibold">Document Types Supported</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Malaysian IC (MyKad)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Malaysian Passport</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>International Passports</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Driving License</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Liveness Selfie</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">AI Verification Features</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Scan className="h-4 w-4 text-blue-600" />
                      <span>OCR Text Extraction</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-blue-600" />
                      <span>Face Matching</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-600" />
                      <span>Liveness Detection</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-blue-600" />
                      <span>Fraud Detection</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span>Document Authenticity</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                  <Upload className="h-4 w-4 mr-2" />
                  Start KYC Batch Processing
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aml" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AML Watchlist Screening</CardTitle>
              <CardDescription>Screen against sanctions, PEPs, and INTERPOL databases</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-red-600">OFAC</div>
                  <div className="text-sm text-gray-500">US Sanctions</div>
                  <div className="text-xs text-green-600 mt-1">✓ Connected</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">UN</div>
                  <div className="text-sm text-gray-500">UN Sanctions</div>
                  <div className="text-xs text-green-600 mt-1">✓ Connected</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">PEP</div>
                  <div className="text-sm text-gray-500">Politically Exposed</div>
                  <div className="text-xs text-green-600 mt-1">✓ Connected</div>
                </div>
              </div>

              <div className="space-y-4">
                <Label htmlFor="aml-search">Manual AML Search</Label>
                <div className="flex gap-2">
                  <Input
                    id="aml-search"
                    placeholder="Enter name to screen against watchlists..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Search className="h-4 w-4 mr-2" />
                    Screen
                  </Button>
                </div>
              </div>

              <Alert>
                <Eye className="h-4 w-4" />
                <AlertTitle>Continuous Monitoring</AlertTitle>
                <AlertDescription>
                  All users are automatically re-screened every 90 days against updated watchlists.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Live Monitoring Dashboard</CardTitle>
              <CardDescription>Real-time KYC and AML processing status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">23</div>
                  <div className="text-sm text-gray-500">Processing Now</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">156</div>
                  <div className="text-sm text-gray-500">In Queue</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">8</div>
                  <div className="text-sm text-gray-500">Manual Review</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-red-600">3</div>
                  <div className="text-sm text-gray-500">Failed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
