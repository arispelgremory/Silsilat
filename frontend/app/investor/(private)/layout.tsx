import type React from "react"
import InvestorLayout from "@/components/layout/investor-layout"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <InvestorLayout>{children}</InvestorLayout>
}
