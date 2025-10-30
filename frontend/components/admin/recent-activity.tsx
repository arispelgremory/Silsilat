"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, AlertTriangle, CreditCard, FileText, Users } from "lucide-react"

interface ActivityItem {
  id: string
  type: "approval" | "settlement" | "kyc" | "alert" | "mint" | "burn"
  title: string
  description: string
  timestamp: string
  user?: {
    name: string
    avatar?: string
    initials: string
  }
  status: "completed" | "pending" | "failed"
}

const activities: ActivityItem[] = [
  {
    id: "1",
    type: "approval",
    title: "SAG Approved",
    description: "SAG-2025-127 approved for listing",
    timestamp: "2 minutes ago",
    user: { name: "Admin User", initials: "AU" },
    status: "completed",
  },
  {
    id: "2",
    type: "settlement",
    title: "Settlement Processed",
    description: "RM 15,000 distributed to investors",
    timestamp: "15 minutes ago",
    status: "completed",
  },
  {
    id: "3",
    type: "kyc",
    title: "KYC Verification",
    description: "New investor KYC approved",
    timestamp: "1 hour ago",
    user: { name: "Sarah Ahmad", initials: "SA" },
    status: "completed",
  },
  {
    id: "4",
    type: "alert",
    title: "Extension Request",
    description: "Loan extension requested for SAG-2025-098",
    timestamp: "2 hours ago",
    status: "pending",
  },
  {
    id: "5",
    type: "mint",
    title: "Token Minted",
    description: "NFT and fractional tokens created",
    timestamp: "3 hours ago",
    status: "completed",
  },
  {
    id: "6",
    type: "burn",
    title: "Token Burned",
    description: "Settlement completed, tokens burned",
    timestamp: "4 hours ago",
    status: "completed",
  },
]

const getActivityIcon = (type: ActivityItem["type"], status: ActivityItem["status"]) => {
  const iconClass = "h-4 w-4"

  switch (type) {
    case "approval":
      return <CheckCircle className={`${iconClass} text-green-600`} />
    case "settlement":
      return <CreditCard className={`${iconClass} text-blue-600`} />
    case "kyc":
      return <Users className={`${iconClass} text-purple-600`} />
    case "alert":
      return <AlertTriangle className={`${iconClass} text-yellow-600`} />
    case "mint":
    case "burn":
      return <FileText className={`${iconClass} text-indigo-600`} />
    default:
      return <Clock className={`${iconClass} text-gray-600`} />
  }
}

const getStatusBadge = (status: ActivityItem["status"]) => {
  switch (status) {
    case "completed":
      return (
        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
          Completed
        </Badge>
      )
    case "pending":
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300">
          Pending
        </Badge>
      )
    case "failed":
      return (
        <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
          Failed
        </Badge>
      )
    default:
      return <Badge variant="outline">Unknown</Badge>
  }
}

export function RecentActivity({ showAll = false }: { showAll?: boolean }) {
  const displayActivities = showAll ? activities : activities.slice(0, 6)

  return (
    <div className="space-y-4">
      {displayActivities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-start gap-3 p-3 rounded-lg border bg-white hover:bg-gray-50 transition-colors"
        >
          <div className="flex-shrink-0 mt-0.5">{getActivityIcon(activity.type, activity.status)}</div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h4 className="text-sm font-medium text-gray-900 truncate">{activity.title}</h4>
              {getStatusBadge(activity.status)}
            </div>

            <p className="text-sm text-gray-600 mb-2">{activity.description}</p>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">{activity.timestamp}</span>
              {activity.user && (
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={activity.user.avatar || "/placeholder.svg"} alt={activity.user.name} />
                    <AvatarFallback className="text-xs">{activity.user.initials}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-gray-500">{activity.user.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {!showAll && activities.length > 6 && (
        <div className="text-center pt-2">
          <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">View all activities →</button>
        </div>
      )}
    </div>
  )
}
