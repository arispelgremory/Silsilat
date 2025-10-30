import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function RecentActivity() {
  const activities = [
    {
      id: 1,
      type: "payment",
      description: "Payment received",
      amount: "RM 1,250",
      date: "March 15, 2025",
      icon: "💰",
    },
    {
      id: 2,
      type: "notification",
      description: "Payment reminder sent",
      date: "March 10, 2025",
      icon: "🔔",
    },
    {
      id: 3,
      type: "loan",
      description: "New loan approved",
      amount: "RM 5,000",
      date: "February 10, 2025",
      icon: "✅",
    },
    {
      id: 4,
      type: "nft",
      description: "NFT collateral created",
      date: "February 10, 2025",
      icon: "🔐",
    },
    {
      id: 5,
      type: "application",
      description: "Loan application submitted",
      date: "February 8, 2025",
      icon: "📝",
    },
  ]

  return (
    <div className="space-y-8">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-center">
          <Avatar className="h-9 w-9 mr-4">
            <AvatarFallback>{activity.icon}</AvatarFallback>
          </Avatar>
          <div className="space-y-1 flex-1">
            <p className="text-sm font-medium leading-none">{activity.description}</p>
            <p className="text-sm text-muted-foreground">{activity.date}</p>
          </div>
          {activity.amount && <div className="font-medium">{activity.amount}</div>}
        </div>
      ))}
    </div>
  )
}
