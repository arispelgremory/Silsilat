import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CreditCard, Info } from "lucide-react"
import Image from "next/image"

export function LoanStatus() {
  const loans = [
    {
      id: "L-2025-001",
      title: "Gold Necklace (24K)",
      amount: 7500,
      remainingAmount: 5625,
      startDate: "January 15, 2025",
      endDate: "July 15, 2025",
      nextPayment: "April 15, 2025",
      nextPaymentAmount: 1250,
      status: "active",
      progress: 25,
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      id: "L-2025-002",
      title: "Diamond Ring (1.5 carat)",
      amount: 5000,
      remainingAmount: 4000,
      startDate: "February 10, 2025",
      endDate: "August 10, 2025",
      nextPayment: "April 10, 2025",
      nextPaymentAmount: 833,
      status: "active",
      progress: 20,
      image: "/placeholder.svg?height=100&width=100",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {loans.map((loan) => (
        <Card key={loan.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{loan.title}</CardTitle>
                <CardDescription>Loan ID: {loan.id}</CardDescription>
              </div>
              <Badge className={loan.status === "active" ? "bg-green-500" : "bg-amber-500"}>
                {loan.status === "active" ? "Active" : "Pending"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Image
                src={loan.image || "/placeholder.svg"}
                alt={loan.title}
                width={80}
                height={80}
                className="w-20 h-20 rounded-md object-cover border"
              />
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Financing Amount:</span>
                  <span className="font-bold">RM {loan.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Remaining:</span>
                  <span>RM {loan.remainingAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Next Payment:</span>
                  <span>{loan.nextPayment}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Payment Amount:</span>
                  <span>RM {loan.nextPaymentAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{loan.progress}% Paid</span>
              </div>
              <Progress value={loan.progress} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="space-y-1">
                <span className="text-muted-foreground">Start Date</span>
                <p>{loan.startDate}</p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">End Date</span>
                <p>{loan.endDate}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" size="sm">
              <Info className="mr-2 h-4 w-4" />
              View Details
            </Button>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
              <CreditCard className="mr-2 h-4 w-4" />
              Make Payment
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
