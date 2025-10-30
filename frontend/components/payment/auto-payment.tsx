"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Bell, CreditCard, DollarSign, Wallet } from "lucide-react"

export function AutoPayment() {
  const [autoPayEnabled, setAutoPayEnabled] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("hedera")
  const [reminderEnabled, setReminderEnabled] = useState(true)
  const [reminderDays, setReminderDays] = useState("3")
  const [selectedLoans, setSelectedLoans] = useState<string[]>(["L-2025-001"])

  const loans = [
    { id: "L-2025-001", title: "Gold Necklace (24K)", amount: 1250, dueDate: "15th of each month" },
    { id: "L-2025-002", title: "Diamond Ring (1.5 carat)", amount: 833, dueDate: "10th of each month" },
  ]

  const handleLoanToggle = (loanId: string) => {
    setSelectedLoans((prev) => (prev.includes(loanId) ? prev.filter((id) => id !== loanId) : [...prev, loanId]))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="auto-pay">Enable Auto Payment</Label>
          <p className="text-sm text-muted-foreground">Automatically pay your financing on the due date</p>
        </div>
        <Switch id="auto-pay" checked={autoPayEnabled} onCheckedChange={setAutoPayEnabled} />
      </div>

      {autoPayEnabled && (
        <>
          <div className="space-y-4">
            <Label>Select Loans for Auto Payment</Label>
            {loans.map((loan) => (
              <Card key={loan.id} className={selectedLoans.includes(loan.id) ? "border-emerald-600" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    <Checkbox
                      id={`loan-${loan.id}`}
                      checked={selectedLoans.includes(loan.id)}
                      onCheckedChange={() => handleLoanToggle(loan.id)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label
                        htmlFor={`loan-${loan.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {loan.title} ({loan.id})
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Payment: RM {loan.amount.toLocaleString()} | Due: {loan.dueDate}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-2">
            <Label>Payment Method</Label>
            <RadioGroup
              value={paymentMethod}
              onValueChange={setPaymentMethod}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <Card className={`cursor-pointer ${paymentMethod === "hedera" ? "border-emerald-600" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="hedera" id="auto-hedera" />
                    <Label htmlFor="auto-hedera" className="flex items-center gap-2 cursor-pointer">
                      <Wallet className="h-4 w-4" /> Hedera Wallet
                    </Label>
                  </div>
                </CardContent>
              </Card>

              <Card className={`cursor-pointer ${paymentMethod === "bank" ? "border-emerald-600" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="bank" id="auto-bank" />
                    <Label htmlFor="auto-bank" className="flex items-center gap-2 cursor-pointer">
                      <DollarSign className="h-4 w-4" /> Bank Account
                    </Label>
                  </div>
                </CardContent>
              </Card>

              <Card className={`cursor-pointer ${paymentMethod === "card" ? "border-emerald-600" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="card" id="auto-card" />
                    <Label htmlFor="auto-card" className="flex items-center gap-2 cursor-pointer">
                      <CreditCard className="h-4 w-4" /> Credit/Debit Card
                    </Label>
                  </div>
                </CardContent>
              </Card>
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="reminder">Payment Reminders</Label>
                <p className="text-sm text-muted-foreground">Receive notifications before your payment due date</p>
              </div>
              <Switch id="reminder" checked={reminderEnabled} onCheckedChange={setReminderEnabled} />
            </div>

            {reminderEnabled && (
              <div className="space-y-2">
                <Label htmlFor="reminder-days">Reminder Days Before Due Date</Label>
                <Select value={reminderDays} onValueChange={setReminderDays}>
                  <SelectTrigger id="reminder-days">
                    <SelectValue placeholder="Select days" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 day before</SelectItem>
                    <SelectItem value="3">3 days before</SelectItem>
                    <SelectItem value="5">5 days before</SelectItem>
                    <SelectItem value="7">7 days before</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Notification Methods</Label>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="notify-email" defaultChecked />
                <Label htmlFor="notify-email">Email</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="notify-sms" defaultChecked />
                <Label htmlFor="notify-sms">SMS</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="notify-app" defaultChecked />
                <Label htmlFor="notify-app">In-App Notification</Label>
              </div>
            </div>
          </div>
        </>
      )}

      <Button
        className="w-full bg-emerald-600 hover:bg-emerald-700"
        disabled={autoPayEnabled && selectedLoans.length === 0}
      >
        {autoPayEnabled ? "Save Auto Payment Settings" : "Enable Auto Payment"}
      </Button>

      {!autoPayEnabled && (
        <div className="flex items-center p-4 bg-amber-50 rounded-md">
          <Bell className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
          <p className="text-sm text-amber-700">
            Auto payment is currently disabled. Enable it to avoid missing payment due dates.
          </p>
        </div>
      )}
    </div>
  )
}
