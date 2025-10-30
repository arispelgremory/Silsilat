"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Bot, Send, MessageSquare, AlertTriangle, CheckCircle, Clock } from "lucide-react"

interface ComplianceQuery {
  id: string
  question: string
  response: string
  confidence: number
  timestamp: string
  status: "answered" | "pending" | "escalated"
  category: string
}

export default function ComplianceBotPage() {
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const recentQueries: ComplianceQuery[] = [
    {
      id: "1",
      question: "What are the KYC requirements for high-value transactions?",
      response:
        "For transactions above RM 50,000, enhanced KYC requires: 1) Government-issued ID verification, 2) Proof of income documentation, 3) Source of funds declaration, 4) Biometric verification, 5) Enhanced due diligence screening.",
      confidence: 95,
      timestamp: "2024-01-15 14:30",
      status: "answered",
      category: "KYC",
    },
    {
      id: "2",
      question: "How to handle suspicious transaction patterns?",
      response:
        "Suspicious patterns should be: 1) Immediately flagged in the system, 2) Documented with detailed notes, 3) Reported to compliance team within 24 hours, 4) Customer account temporarily restricted pending review.",
      confidence: 92,
      timestamp: "2024-01-15 13:45",
      status: "answered",
      category: "AML",
    },
    {
      id: "3",
      question: "Shariah compliance requirements for jewelry valuation",
      response: "Under review by Shariah advisory board. This query has been escalated for expert consultation.",
      confidence: 0,
      timestamp: "2024-01-15 12:20",
      status: "escalated",
      category: "Shariah",
    },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsLoading(true)
    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsLoading(false)
    setQuery("")
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "answered":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "escalated":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "answered":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "escalated":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Bot className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">AI Compliance Assistant</h1>
      </div>

      {/* Bot Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Queries Today</p>
                <p className="text-2xl font-bold">247</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Confidence</p>
                <p className="text-2xl font-bold">94.2%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Response Time</p>
                <p className="text-2xl font-bold">1.2s</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Escalations</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Query Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Ask Compliance Question</CardTitle>
          <CardDescription>Get instant answers to compliance, KYC, AML, and Shariah-related questions</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder="Ask about compliance requirements, regulations, procedures..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="min-h-[100px]"
            />
            <Button type="submit" disabled={isLoading || !query.trim()}>
              {isLoading ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Ask Question
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Recent Queries */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Queries</CardTitle>
          <CardDescription>Latest compliance questions and AI responses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentQueries.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(item.status)}
                      <Badge variant="outline" className={getStatusColor(item.status)}>
                        {item.status.toUpperCase()}
                      </Badge>
                      <Badge variant="secondary">{item.category}</Badge>
                      <span className="text-sm text-muted-foreground">{item.timestamp}</span>
                    </div>
                    <p className="font-medium mb-2">{item.question}</p>
                    <p className="text-sm text-muted-foreground">{item.response}</p>
                  </div>
                  {item.confidence > 0 && (
                    <div className="ml-4 text-right">
                      <p className="text-sm text-muted-foreground">Confidence</p>
                      <p className="font-bold text-green-600">{item.confidence}%</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
