import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Check, Eye, X } from "lucide-react"

export function PendingLoans() {
  const pendingLoans = [
    {
      id: "L-2025-007",
      user: {
        name: "Ahmad Razif",
        avatar: "/placeholder.svg?height=36&width=36",
        initials: "AR",
      },
      jewelryType: "Gold Necklace (24K)",
      amount: 7500,
      date: "March 20, 2025",
      status: "pending",
    },
    {
      id: "L-2025-008",
      user: {
        name: "Nurul Huda",
        avatar: "/placeholder.svg?height=36&width=36",
        initials: "NH",
      },
      jewelryType: "Diamond Ring (1.5 carat)",
      amount: 12000,
      date: "March 19, 2025",
      status: "pending",
    },
    {
      id: "L-2025-009",
      user: {
        name: "Tan Wei Ming",
        avatar: "/placeholder.svg?height=36&width=36",
        initials: "TW",
      },
      jewelryType: "Gold Bracelet (22K)",
      amount: 5000,
      date: "March 18, 2025",
      status: "pending",
    },
    {
      id: "L-2025-010",
      user: {
        name: "Sarah Abdullah",
        avatar: "/placeholder.svg?height=36&width=36",
        initials: "SA",
      },
      jewelryType: "Gold Earrings (24K)",
      amount: 3500,
      date: "March 18, 2025",
      status: "pending",
    },
  ]

  return (
    <div className="space-y-4">
      {pendingLoans.map((loan) => (
        <Card key={loan.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between p-4 gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={loan.user.avatar} alt={loan.user.name} />
                  <AvatarFallback>{loan.user.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium">{loan.user.name}</h4>
                  <p className="text-sm text-muted-foreground">ID: {loan.id}</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
                <div>
                  <p className="text-sm font-medium">{loan.jewelryType}</p>
                  <p className="text-sm text-muted-foreground">Applied: {loan.date}</p>
                </div>
                <div className="text-right md:text-left">
                  <p className="font-bold">RM {loan.amount.toLocaleString()}</p>
                  <Badge variant="outline">Pending Review</Badge>
                </div>
                <div className="flex gap-2 mt-2 md:mt-0">
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-1" /> View
                  </Button>
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                    <Check className="h-4 w-4 mr-1" /> Approve
                  </Button>
                  <Button size="sm" variant="destructive">
                    <X className="h-4 w-4 mr-1" /> Reject
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
