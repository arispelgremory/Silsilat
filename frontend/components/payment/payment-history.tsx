"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Download, Search } from "lucide-react"

export function PaymentHistory() {
  const [loanFilter, setLoanFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const payments = [
    {
      id: "P-2025-001",
      loanId: "L-2025-001",
      date: "March 15, 2025",
      amount: 1250,
      method: "Hedera Wallet",
      status: "completed",
      transactionId: "TXN-123456",
    },
    {
      id: "P-2025-002",
      loanId: "L-2025-002",
      date: "March 10, 2025",
      amount: 833,
      method: "Bank Transfer",
      status: "completed",
      transactionId: "TXN-123457",
    },
    {
      id: "P-2025-003",
      loanId: "L-2025-001",
      date: "February 15, 2025",
      amount: 1250,
      method: "Hedera Wallet",
      status: "completed",
      transactionId: "TXN-123458",
    },
    {
      id: "P-2025-004",
      loanId: "L-2025-002",
      date: "February 10, 2025",
      amount: 833,
      method: "Credit Card",
      status: "completed",
      transactionId: "TXN-123459",
    },
    {
      id: "P-2025-005",
      loanId: "L-2025-001",
      date: "April 15, 2025",
      amount: 1250,
      method: "Pending",
      status: "upcoming",
      transactionId: "-",
    },
    {
      id: "P-2025-006",
      loanId: "L-2025-002",
      date: "April 10, 2025",
      amount: 833,
      method: "Pending",
      status: "upcoming",
      transactionId: "-",
    },
  ]

  const filteredPayments = payments.filter((payment) => {
    const matchesLoan = loanFilter === "all" || payment.loanId === loanFilter
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter
    const matchesSearch =
      payment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.loanId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.date.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.method.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesLoan && matchesStatus && matchesSearch
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-1/3 space-y-2">
          <Label htmlFor="loan-filter">Filter by Loan</Label>
          <Select value={loanFilter} onValueChange={setLoanFilter}>
            <SelectTrigger id="loan-filter">
              <SelectValue placeholder="Select loan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Loans</SelectItem>
              <SelectItem value="L-2025-001">Gold Necklace (L-2025-001)</SelectItem>
              <SelectItem value="L-2025-002">Diamond Ring (L-2025-002)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:w-1/3 space-y-2">
          <Label htmlFor="status-filter">Filter by Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger id="status-filter">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:w-1/3 space-y-2">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search payments..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Payment ID</TableHead>
              <TableHead>Loan ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.length > 0 ? (
              filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.id}</TableCell>
                  <TableCell>{payment.loanId}</TableCell>
                  <TableCell>{payment.date}</TableCell>
                  <TableCell>RM {payment.amount.toLocaleString()}</TableCell>
                  <TableCell>{payment.method}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        payment.status === "completed"
                          ? "bg-green-500"
                          : payment.status === "upcoming"
                            ? "bg-amber-500"
                            : "bg-red-500"
                      }
                    >
                      {payment.status === "completed"
                        ? "Completed"
                        : payment.status === "upcoming"
                          ? "Upcoming"
                          : "Overdue"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {payment.status === "completed" && (
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4 mr-1" /> Receipt
                      </Button>
                    )}
                    {payment.status === "upcoming" && (
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                        Pay Now
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  No payments found matching your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Showing {filteredPayments.length} of {payments.length} payments
        </p>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" /> Export History
        </Button>
      </div>
    </div>
  )
}
