import type React from "react"
import PawnshopLayout from "@/components/layout/pawnshop-layout"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <PawnshopLayout>{children}</PawnshopLayout>
}
