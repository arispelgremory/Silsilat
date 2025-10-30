"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreditCard, DollarSign, Wallet } from "lucide-react"

export function PaymentMethods() {
  const [paymentMethod, setPaymentMethod] = useState("hedera")
  const [loanId, setLoanId] = useState("L-2025-001")
  const [amount, setAmount] = useState(1250)
  const [paymentComplete, setPaymentComplete] = useState(false)

  const handlePayment = () => {
    // Simulate payment processing
    setPaymentComplete(true)
  }

  const loans = [
    { id: "L-2025-001", title: "Gold Necklace (24K)", amount: 1250, dueDate: "April 15, 2025" },
    { id: "L-2025-002", title: "Diamond Ring (1.5 carat)", amount: 833, dueDate: "April 10, 2025" },
  ]

  const selectedLoan = loans.find((loan) => loan.id === loanId)

  return (
    <div className="space-y-6">
      {!paymentComplete ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="loan-id">Select Loan</Label>
            <Select value={loanId} onValueChange={setLoanId}>
              <SelectTrigger id="loan-id">
                <SelectValue placeholder="Select loan" />
              </SelectTrigger>
              <SelectContent>
                {loans.map((loan) => (
                  <SelectItem key={loan.id} value={loan.id}>
                    {loan.title} - {loan.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedLoan && (
              <p className="text-sm text-muted-foreground">
                Due: {selectedLoan.dueDate} | Amount: RM {selectedLoan.amount.toLocaleString()}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Payment Amount (RM)</Label>
            <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
          </div>

          <div className="space-y-2">
            <Label>Payment Method</Label>
            <RadioGroup
              value={paymentMethod}
              onValueChange={setPaymentMethod}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <Card className={`cursor-pointer ${paymentMethod === "hedera" ? "border-emerald-600" : ""}`}>
                <CardHeader className="p-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <RadioGroupItem value="hedera" id="hedera" />
                    <Wallet className="h-4 w-4" /> Hedera Wallet
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <CardDescription>Pay using HBAR or stablecoins from your connected Hedera wallet.</CardDescription>
                </CardContent>
              </Card>

              <Card className={`cursor-pointer ${paymentMethod === "bank" ? "border-emerald-600" : ""}`}>
                <CardHeader className="p-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <RadioGroupItem value="bank" id="bank" />
                    <DollarSign className="h-4 w-4" /> Bank Transfer
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <CardDescription>Pay using direct bank transfer from your registered bank account.</CardDescription>
                </CardContent>
              </Card>

              <Card className={`cursor-pointer ${paymentMethod === "card" ? "border-emerald-600" : ""}`}>
                <CardHeader className="p-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <RadioGroupItem value="card" id="card" />
                    <CreditCard className="h-4 w-4" /> Credit/Debit Card
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <CardDescription>Pay using your credit or debit card (additional fees may apply).</CardDescription>
                </CardContent>
              </Card>
            </RadioGroup>
          </div>

          {paymentMethod === "hedera" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Hedera Wallet Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Connected Wallet:</span>
                  <span className="font-medium">0.0.12345</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Available Balance:</span>
                  <span className="font-medium">100.00 HBAR</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Payment Amount:</span>
                  <span className="font-medium">RM {amount.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {paymentMethod === "bank" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Bank Transfer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Bank Account:</span>
                  <span className="font-medium">XXXX-XXXX-1234</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Bank Name:</span>
                  <span className="font-medium">Maybank</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Payment Amount:</span>
                  <span className="font-medium">RM {amount.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {paymentMethod === "card" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Credit/Debit Card Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="card-number">Card Number</Label>
                  <Input id="card-number" placeholder="XXXX XXXX XXXX XXXX" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input id="expiry" placeholder="MM/YY" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input id="cvv" placeholder="123" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Name on Card</Label>
                  <Input id="name" placeholder="Enter name on card" />
                </div>
              </CardContent>
            </Card>
          )}

          <Button onClick={handlePayment} className="w-full bg-emerald-600 hover:bg-emerald-700">
            Pay RM {amount.toLocaleString()}
          </Button>
        </>
      ) : (
        <Card className="bg-emerald-50">
          <CardHeader>
            <CardTitle className="text-emerald-800">Payment Successful</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center p-6">
              <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
                <svg
                  className="h-8 w-8 text-emerald-600"
                  fill="none"
                  height="24"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-emerald-700">Payment Amount:</span>
                <span className="font-medium">RM {amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-emerald-700">Payment Method:</span>
                <span className="font-medium">
                  {paymentMethod === "hedera"
                    ? "Hedera Wallet"
                    : paymentMethod === "bank"
                      ? "Bank Transfer"
                      : "Credit/Debit Card"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-emerald-700">Transaction ID:</span>
                <span className="font-medium">TXN-{Math.floor(Math.random() * 1000000)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-emerald-700">Date & Time:</span>
                <span className="font-medium">{new Date().toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center gap-2">
            <Button variant="outline">View Receipt</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700">Return to Dashboard</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
