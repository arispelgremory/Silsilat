import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CreditCard } from "lucide-react"

interface PaymentScheduleProps {
  showAll?: boolean
}

export function PaymentSchedule({ showAll = false }: PaymentScheduleProps) {
  const payments = [
    {
      id: "P-2025-001",
      loanId: "L-2025-001",
      dueDate: "April 15, 2025",
      amount: 1250,
      status: "upcoming",
    },
    {
      id: "P-2025-002",
      loanId: "L-2025-002",
      dueDate: "April 10, 2025",
      amount: 833,
      status: "upcoming",
    },
    {
      id: "P-2025-003",
      loanId: "L-2025-001",
      dueDate: "March 15, 2025",
      amount: 1250,
      status: "paid",
    },
    {
      id: "P-2025-004",
      loanId: "L-2025-002",
      dueDate: "March 10, 2025",
      amount: 833,
      status: "paid",
    },
    {
      id: "P-2025-005",
      loanId: "L-2025-001",
      dueDate: "February 15, 2025",
      amount: 1250,
      status: "paid",
    },
    {
      id: "P-2025-006",
      loanId: "L-2025-002",
      dueDate: "February 10, 2025",
      amount: 833,
      status: "paid",
    },
  ]

  const displayPayments = showAll ? payments : payments.slice(0, 4)

  return (
    <div className="space-y-4">
      {displayPayments.map((payment) => (
        <div key={payment.id} className="flex items-center justify-between p-2 border rounded-md">
          <div className="space-y-1">
            <p className="text-sm font-medium">Payment #{payment.id}</p>
            <p className="text-xs text-muted-foreground">Loan #{payment.loanId}</p>
            <p className="text-xs text-muted-foreground">Due: {payment.dueDate}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="font-bold">RM {payment.amount.toLocaleString()}</span>
            <Badge
              className={
                payment.status === "paid"
                  ? "bg-green-500"
                  : payment.status === "upcoming"
                    ? "bg-amber-500"
                    : "bg-red-500"
              }
            >
              {payment.status === "paid" ? "Paid" : payment.status === "upcoming" ? "Upcoming" : "Overdue"}
            </Badge>
            {payment.status === "upcoming" && (
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                <CreditCard className="mr-2 h-3 w-3" />
                Pay Now
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
