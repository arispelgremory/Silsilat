"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  FileText,
  Eye,
  Brain,
  AlertTriangle,
  User,
  Clock,
  Download,
  Filter,
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  Info,
} from "lucide-react"

// Mock audit log data
const auditLogs = [
  {
    id: "AL-2024-001234",
    timestamp: "2024-01-22 14:30:25",
    system: "KYC AI Engine",
    event: "Batch Processing Completed",
    user: "system@suyula.com",
    severity: "info",
    details: "Processed 127 KYC applications with 98.5% accuracy",
    ipAddress: "10.0.1.45",
    userAgent: "SuyulaAI/2.1.0",
    outcome: "success",
  },
  {
    id: "AL-2024-001233",
    timestamp: "2024-01-22 14:25:12",
    system: "AML Screening",
    event: "High Risk Match Detected",
    user: "admin@suyula.com",
    severity: "high",
    details: "PEP match found for applicant ID: APP-2024-5678 - Mohammad Ahmad",
    ipAddress: "192.168.1.102",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    outcome: "flagged",
  },
  {
    id: "AL-2024-001232",
    timestamp: "2024-01-22 14:20:08",
    system: "Wallet Monitor",
    event: "Suspicious Transaction Pattern",
    user: "ai-monitor@suyula.com",
    severity: "medium",
    details: "Wallet 0x7A2...B4C exceeded velocity threshold: 15 txns in 2 minutes",
    ipAddress: "10.0.2.12",
    userAgent: "SuyulaMonitor/1.5.3",
    outcome: "investigated",
  },
  {
    id: "AL-2024-001231",
    timestamp: "2024-01-22 14:15:45",
    system: "SAG Risk Evaluator",
    event: "High Risk SAG Identified",
    user: "risk-ai@suyula.com",
    severity: "high",
    details: "SAG-2024-0847 scored 89% risk: Suspicious ownership structure",
    ipAddress: "10.0.3.18",
    userAgent: "SuyulaRisk/3.2.1",
    outcome: "blocked",
  },
  {
    id: "AL-2024-001230",
    timestamp: "2024-01-22 14:10:33",
    system: "Default Predictor",
    event: "Model Retrained",
    user: "ml-ops@suyula.com",
    severity: "info",
    details: "Model accuracy improved to 91.3% after retraining with 2,341 new samples",
    ipAddress: "10.0.4.25",
    userAgent: "MLOps/4.1.2",
    outcome: "success",
  },
  {
    id: "AL-2024-001229",
    timestamp: "2024-01-22 14:05:17",
    system: "Compliance Bot",
    event: "User Query Processed",
    user: "sarah.johnson@suyula.com",
    severity: "info",
    details: "Query: 'What are the AML requirements for high-value transactions?'",
    ipAddress: "192.168.1.87",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    outcome: "answered",
  },
]

const systemColors = {
  "KYC AI Engine": "bg-blue-100 text-blue-800",
  "AML Screening": "bg-purple-100 text-purple-800",
  "Wallet Monitor": "bg-orange-100 text-orange-800",
  "SAG Risk Evaluator": "bg-red-100 text-red-800",
  "Default Predictor": "bg-green-100 text-green-800",
  "Compliance Bot": "bg-cyan-100 text-cyan-800",
}

const severityIcons = {
  info: <Info className="h-4 w-4 text-blue-600" />,
  medium: <AlertTriangle className="h-4 w-4 text-yellow-600" />,
  high: <XCircle className="h-4 w-4 text-red-600" />,
}

const outcomeIcons = {
  success: <CheckCircle className="h-4 w-4 text-green-600" />,
  flagged: <AlertTriangle className="h-4 w-4 text-yellow-600" />,
  investigated: <Eye className="h-4 w-4 text-blue-600" />,
  blocked: <XCircle className="h-4 w-4 text-red-600" />,
  answered: <CheckCircle className="h-4 w-4 text-green-600" />,
}

export default function AuditLogsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSystem, setSelectedSystem] = useState("all")
  const [selectedSeverity, setSelectedSeverity] = useState("all")
  const [selectedTimeframe, setSelectedTimeframe] = useState("24h")

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSystem = selectedSystem === "all" || log.system === selectedSystem
    const matchesSeverity = selectedSeverity === "all" || log.severity === selectedSeverity
    return matchesSearch && matchesSystem && matchesSeverity
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-6 w-6 text-emerald-600" />
            AI Risk & Compliance Audit Logs
          </h1>
          <p className="text-gray-600">Comprehensive audit trail for all AI system activities and compliance events</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="bg-transparent">
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
          <Button variant="outline" size="sm" className="bg-transparent">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Events (24h)</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-gray-600">+12% from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">High Severity</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">23</div>
            <p className="text-xs text-gray-600">-8% from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">AI Systems Active</CardTitle>
            <Brain className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-gray-600">All operational</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Failed Operations</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-gray-600">All investigated</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Audit Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search"
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>System</Label>
              <Select value={selectedSystem} onValueChange={setSelectedSystem}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Systems</SelectItem>
                  <SelectItem value="KYC AI Engine">KYC AI Engine</SelectItem>
                  <SelectItem value="AML Screening">AML Screening</SelectItem>
                  <SelectItem value="Wallet Monitor">Wallet Monitor</SelectItem>
                  <SelectItem value="SAG Risk Evaluator">SAG Risk Evaluator</SelectItem>
                  <SelectItem value="Default Predictor">Default Predictor</SelectItem>
                  <SelectItem value="Compliance Bot">Compliance Bot</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Severity</Label>
              <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Timeframe</Label>
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last Hour</SelectItem>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" className="w-full bg-transparent">
                <Filter className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Log Entries</CardTitle>
          <CardDescription>Showing {filteredLogs.length} entries matching your filters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>System</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-gray-50">
                    <TableCell className="font-mono text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        {log.timestamp}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={systemColors[log.system as keyof typeof systemColors] || "bg-gray-100 text-gray-800"}
                      >
                        {log.system}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{log.event}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{log.user}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {severityIcons[log.severity as keyof typeof severityIcons]}
                        <span className="capitalize">{log.severity}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {outcomeIcons[log.outcome as keyof typeof outcomeIcons]}
                        <span className="capitalize">{log.outcome}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-md truncate text-sm text-gray-600" title={log.details}>
                        {log.details}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* System Activity Summary */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>System Activity Summary</CardTitle>
            <CardDescription>Events by system in the last 24 hours</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { system: "KYC AI Engine", events: 342, severity: "info" },
              { system: "AML Screening", events: 156, severity: "medium" },
              { system: "Wallet Monitor", events: 289, severity: "high" },
              { system: "SAG Risk Evaluator", events: 127, severity: "high" },
              { system: "Default Predictor", events: 93, severity: "info" },
              { system: "Compliance Bot", events: 240, severity: "info" },
            ].map((item) => (
              <div key={item.system} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className={systemColors[item.system as keyof typeof systemColors] || "bg-gray-100 text-gray-800"}
                  >
                    {item.system}
                  </Badge>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">{item.events} events</span>
                  {severityIcons[item.severity as keyof typeof severityIcons]}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Critical Events</CardTitle>
            <CardDescription>High-priority events requiring attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {auditLogs
              .filter((log) => log.severity === "high")
              .slice(0, 5)
              .map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-red-800">{log.event}</div>
                      <Badge variant="outline" className="bg-red-100 text-red-800">
                        {log.system}
                      </Badge>
                    </div>
                    <div className="text-sm text-red-600 mt-1">{log.details}</div>
                    <div className="text-xs text-red-500 mt-2">{log.timestamp}</div>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
