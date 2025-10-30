"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/hooks/use-language"
import {
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  Clock,
  AlertTriangle,
  TrendingUp,
  Building2,
  Wallet,
  Shield,
  BarChart3,
  Settings,
  Bell,
  HelpCircle,
  Wrench,
  ArrowLeft,
  LogOut,
  ChevronDown,
  Brain,
} from "lucide-react"
import { useState } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { UserRole } from "@/hooks/use-user-role"
import { useAtom } from "jotai"
import { userAtom } from "@/store/atoms"

const sidebarItems = [
  {
    title: "admin.dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    role: "admin,pawnshop",
  },
  {
    title: "AI Risk & Compliance",
    href: "/admin/ai-risk-compliance",
    role: "admin,pawnshop",
    icon: Brain,
    children: [
      { title: "Risk Dashboard", href: "/admin/ai-risk-compliance" },
      { title: "KYC & AML Intelligence", href: "/admin/ai-risk-compliance/kyc-aml" },
      { title: "SAG Risk Evaluation", href: "/admin/ai-risk-compliance/sag-risk" },
      { title: "Wallet Monitoring", href: "/admin/ai-risk-compliance/wallet-monitoring" },
      { title: "Default Prediction", href: "/admin/ai-risk-compliance/default-prediction" },
      { title: "Compliance Bot", href: "/admin/ai-risk-compliance/compliance-bot" },
      { title: "Automated Reporting", href: "/admin/ai-risk-compliance/reporting" },
      { title: "Audit Logs", href: "/admin/ai-risk-compliance/audit-logs" },
      { title: "Risk Evaluation", href: "/admin/ai-risk-compliance/risk-evaluation" },
    ],
  },
  {
    title: "admin.kyc",
    href: "/admin/kyc",
    icon: Users,
    role: "admin",
  },
  {
    title: "admin.sag",
    href: "/admin/sag-listings",
    icon: FileText,
    children: [
      { title: "Active Listings", href: "/admin/sag-listings" },
      { title: "Pending Approval", href: "/admin/sag-listings/pending" },
      { title: "Completed", href: "/admin/sag-listings/completed" },
    ],
    role: "admin,pawnshop",
  },
  {
    title: "admin.repayment",
    href: "/admin/repayment",
    icon: CreditCard,
    role: "admin,pawnshop",
  },
  {
    title: "admin.extensions",
    href: "/admin/extensions",
    icon: Clock,
    role: "admin",
  },
  {
    title: "admin.defaults",
    href: "/admin/defaults",
    icon: AlertTriangle,
    role: "admin",
  },
  {
    title: "admin.investors",
    href: "/admin/investors",
    icon: TrendingUp,
    role: "admin",
  },
  {
    title: "admin.branches",
    href: "/admin/branches",
    icon: Building2,
  },
  {
    title: "admin.wallets",
    href: "/admin/wallets",
    icon: Wallet,
    role: "admin",
  },
  {
    title: "admin.compliance",
    href: "/admin/compliance",
    icon: Shield,
    role: "admin",
  },
  {
    title: "admin.analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    role: "admin",
  },
  {
    title: "admin.settings",
    href: "/admin/settings",
    icon: Settings,
    role: "admin",
  },
  {
    title: "admin.notifications",
    href: "/admin/notifications",
    icon: Bell,
    role: "admin",
  },
  {
    title: "admin.support",
    href: "/admin/support",
    icon: HelpCircle,
    role: "admin",
  },
  {
    title: "admin.tools",
    href: "/admin/tools",
    icon: Wrench,
    role: "admin",
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useLanguage()
  const [openItems, setOpenItems] = useState<string[]>([])
  const [user] = useAtom(userAtom)
  const role = user?.userInfo?.roleId as string

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("userRole")
    router.push("/admin/login")
  }

  const toggleItem = (href: string) => {
    setOpenItems((prev) => (prev.includes(href) ? prev.filter((item) => item !== href) : [...prev, href]))
  }

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r">
      {/* Header */}
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <div>
            <div className="font-semibold text-sm">Silsilat</div>
            <div className="text-xs text-muted-foreground">Admin Panel</div>
          </div>
        </div>
      </div>

      {/* Back to Main Site */}
      <div className="p-4">
        <Button variant="outline" size="sm" className="w-full justify-start bg-transparent" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("admin.backToMain")}
          </Link>
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 pb-4">
        {sidebarItems.filter((item) => item.role?.includes(role || '')).map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          const isOpen = openItems.includes(item.href)
          const Icon = item.icon

          if (item.children) {
            return (
              <Collapsible key={item.href} open={isOpen} onOpenChange={() => toggleItem(item.href)}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn("w-full justify-between", isActive && "bg-emerald-100 text-emerald-700")}
                  >
                    <div className="flex items-center">
                      <Icon className="mr-2 h-4 w-4" />
                      {item.title.startsWith("admin.") ? t(item.title) : item.title}
                    </div>
                    <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 pl-6">
                  {item.children.map((child) => (
                    <Button
                      key={child.href}
                      variant={pathname === child.href ? "secondary" : "ghost"}
                      size="sm"
                      className={cn(
                        "w-full justify-start",
                        pathname === child.href && "bg-emerald-100 text-emerald-700",
                      )}
                      asChild
                    >
                      <Link href={child.href}>{child.title}</Link>
                    </Button>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )
          }

          return (
            <Button
              key={item.href}
              variant={isActive ? "secondary" : "ghost"}
              className={cn("w-full justify-start", isActive && "bg-emerald-100 text-emerald-700")}
              asChild
            >
              <Link href={item.href}>
                <Icon className="mr-2 h-4 w-4" />
                {item.title.startsWith("admin.") ? t(item.title) : item.title}
              </Link>
            </Button>
          )
        })}
      </nav>

      {/* User Role & Logout */}
      <div className="border-t p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Current Role:</span>
          <Badge variant="outline" className="bg-emerald-100 text-emerald-700">
            {role === 'pawnshop' ? 'Ar Rahnu' : role}
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {t("admin.logout")}
        </Button>
      </div>
    </div>
  )
}
